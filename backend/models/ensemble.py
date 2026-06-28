"""
ensemble.py — Meta-learner stacking Altman Z-Score, XGBoost, Prophet cash
trajectory, and Cox survival outputs into a single bankruptcy probability.

Uses LogisticRegression as the meta-learner trained on years 2018-2024 with
labels: 0=safe (2018-2019), 1=distress (2020-2024).
"""

import os
import json
import warnings
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Years and labels
# ---------------------------------------------------------------------------

ALL_YEARS = list(range(2018, 2025))          # 2018 … 2024
LABELS = {2018: 0, 2019: 0, 2020: 1, 2021: 1, 2022: 1, 2023: 1, 2024: 1}

VERDICT_MAP = {
    (0, 25): "Safe",
    (25, 50): "Watch",
    (50, 75): "High Risk",
    (75, 101): "Critical / Bankruptcy Imminent",
}


def _verdict(prob_pct: float) -> str:
    for (lo, hi), label in VERDICT_MAP.items():
        if lo <= prob_pct < hi:
            return label
    return "Critical / Bankruptcy Imminent"


# ---------------------------------------------------------------------------
# Feature extractors
# ---------------------------------------------------------------------------

def _extract_altman(altman: list) -> dict:
    """
    Returns {year: z_score} from the Altman list.
    altman is a list of dicts with 'year' and 'z_score'.
    """
    result = {}
    for entry in (altman or []):
        yr = entry.get("year")
        z = entry.get("z_score")
        if yr is not None and z is not None:
            result[int(yr)] = float(z)
    return result


def _extract_xgb(xgb: dict) -> dict:
    """
    Returns {year: prob_0_to_1} from XGBoost yearly_risk list.
    'bankruptcy_prob' is on a 0-100 scale.
    """
    result = {}
    for entry in xgb.get("yearly_risk", []):
        yr = entry.get("year")
        prob = entry.get("bankruptcy_prob")
        if yr is not None and prob is not None:
            result[int(yr)] = float(prob) / 100.0
    return result


def _extract_cash(prophet: dict) -> dict:
    """
    Returns {year: annual_avg_cash_usd} from Prophet cash_forecast actuals.
    Uses 'actual' values; falls back to 'forecast' when actual is None.
    """
    by_year = {}
    for entry in prophet.get("cash_forecast", []):
        q = entry.get("quarter", "")
        try:
            yr = int(q.split("-")[0])
        except (ValueError, IndexError):
            continue
        value = entry.get("actual") or entry.get("forecast")
        if value is not None:
            by_year.setdefault(yr, []).append(float(value))
    return {yr: sum(vals) / len(vals) for yr, vals in by_year.items()}


def _extract_survival(survival: dict) -> dict:
    """
    Returns {year: survival_prob_0_to_100} by mapping the survival curve
    (which is month-based starting Jan'22) to calendar years.

    Assumptions for years before the curve starts:
      2018 → 98.0, 2019 → 97.5, 2020 → 96.0, 2021 → 94.5
    """
    month_map = {
        "Jan'22": 2022.0,
        "Jul'22": 2022.5,
        "Jan'23": 2023.0,
        "Jul'23": 2023.5,
        "Jan'24": 2024.0,
        "Jul'24": 2024.5,
        "Nov'24": 2024.9,
        "Dec'24": 2024.92,
    }

    curve = []
    for entry in survival.get("survival_curve", []):
        month = entry.get("month", "")
        prob = entry.get("prob")
        if prob is not None and month in month_map:
            curve.append((month_map[month], float(prob)))

    curve.sort(key=lambda x: x[0])

    def _interp(t: float) -> float:
        if not curve:
            return 90.0
        if t <= curve[0][0]:
            return curve[0][1]
        if t >= curve[-1][0]:
            return curve[-1][1]
        for i in range(len(curve) - 1):
            t0, p0 = curve[i]
            t1, p1 = curve[i + 1]
            if t0 <= t <= t1:
                frac = (t - t0) / (t1 - t0)
                return p0 + frac * (p1 - p0)
        return curve[-1][1]

    priors = {2018: 98.0, 2019: 97.5, 2020: 96.0, 2021: 94.5}
    result = {}
    for yr in ALL_YEARS:
        if yr in priors:
            result[yr] = priors[yr]
        else:
            result[yr] = _interp(float(yr))
    return result


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

def run_ensemble(trained_dir: str) -> dict:
    """
    Stack Altman Z, XGBoost, Prophet cash, and Cox survival into a final
    meta-learner bankruptcy probability.

    Parameters
    ----------
    trained_dir : str
        Directory containing the four source JSON files and where
        ensemble_results.json will be written.

    Returns
    -------
    dict  — ensemble results (also saved to <trained_dir>/ensemble_results.json)
    """

    # ------------------------------------------------------------------
    # Load source models
    # ------------------------------------------------------------------
    def _load(name):
        path = os.path.join(trained_dir, name)
        print(f"[ensemble] Loading {name} …", end=" ")
        try:
            with open(path, encoding="utf-8") as fh:
                data = json.load(fh)
            print("OK")
            return data
        except FileNotFoundError:
            print("NOT FOUND — using empty placeholder")
            return {} if "altman" not in name else []
        except json.JSONDecodeError as exc:
            print(f"JSON ERROR: {exc} — using empty placeholder")
            return {} if "altman" not in name else []

    altman_raw  = _load("altman_results.json")
    xgb_raw     = _load("xgboost_results.json")
    prophet_raw = _load("prophet_results.json")
    survival_raw = _load("survival_results.json")

    # ------------------------------------------------------------------
    # Extract features
    # ------------------------------------------------------------------
    print("\n[ensemble] Extracting per-year features …")

    altman_z   = _extract_altman(altman_raw)          # {year: z_score}
    xgb_probs  = _extract_xgb(xgb_raw)               # {year: 0-1}
    cash_avgs  = _extract_cash(prophet_raw)           # {year: cash_usd}
    surv_probs = _extract_survival(survival_raw)      # {year: 0-100}

    # 2019 peak cash (used to compute cash % of peak)
    cash_2019 = cash_avgs.get(2019, max(cash_avgs.values()) if cash_avgs else 1.0)
    if cash_2019 == 0:
        cash_2019 = 1.0

    # Z-score range for normalization (lower z → more risk → higher z_norm)
    z_values = [altman_z[yr] for yr in ALL_YEARS if yr in altman_z]
    z_min = min(z_values) if z_values else 0.0
    z_max = max(z_values) if z_values else 4.0
    z_range = (z_max - z_min) or 1.0

    print(f"  Z-score range   : {z_min:.3f} – {z_max:.3f}")
    print(f"  2019 peak cash  : ${cash_2019:,.0f}M")

    # ------------------------------------------------------------------
    # Build feature matrix
    # ------------------------------------------------------------------
    rows = []
    for yr in ALL_YEARS:
        z  = altman_z.get(yr, z_min)                       # raw z
        z_norm = 1.0 - (z - z_min) / z_range               # 0-1, high = more risk

        xgb = xgb_probs.get(yr, 0.5)                       # 0-1 probability

        cash = cash_avgs.get(yr, cash_2019)
        cash_pct = cash / cash_2019                         # fraction of 2019 peak
        cash_risk = max(0.0, min(1.0, 1.0 - cash_pct))     # inverted: high = more risk

        surv = surv_probs.get(yr, 95.0)
        survival_risk = max(0.0, min(1.0, 1.0 - surv / 100.0))  # inverted

        rows.append(
            {
                "year": yr,
                "z_score_raw": round(z, 4),
                "z_norm": round(z_norm, 4),
                "xgb_prob": round(xgb, 4),
                "cash_risk": round(cash_risk, 4),
                "survival_risk": round(survival_risk, 4),
                "label": LABELS[yr],
            }
        )
        print(
            f"  {yr}  z_norm={z_norm:.3f}  xgb={xgb:.3f}  "
            f"cash_risk={cash_risk:.3f}  surv_risk={survival_risk:.3f}  label={LABELS[yr]}"
        )

    # ------------------------------------------------------------------
    # Train meta-learner
    # ------------------------------------------------------------------
    print("\n[ensemble] Training LogisticRegression meta-learner …")

    feature_names = ["z_norm", "xgb_prob", "cash_risk", "survival_risk"]
    X = np.array([[r[f] for f in feature_names] for r in rows])
    y = np.array([r["label"] for r in rows])

    # Scale to [0,1] (features are already in range but scaling ensures
    # coefficient comparability)
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(
        C=1.0,
        max_iter=1000,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_scaled, y)

    coefs = clf.coef_[0]
    # Softmax-normalize absolute values for display weights
    abs_coefs = np.abs(coefs)
    feature_weights = {
        name: round(float(abs_coefs[i] / abs_coefs.sum()), 4)
        for i, name in enumerate(["z_score", "xgb", "cash", "survival"])
    }

    print("\n[ensemble] Feature weights (relative importance):")
    for fname, wt in feature_weights.items():
        bar = "█" * int(wt * 40)
        print(f"  {fname:>12s}  {wt:.4f}  {bar}")

    raw_coef_str = {
        name: round(float(coefs[i]), 6)
        for i, name in enumerate(feature_names)
    }
    print(f"\n[ensemble] Raw LR coefficients: {raw_coef_str}")

    # ------------------------------------------------------------------
    # Predict per-year ensemble probabilities
    # ------------------------------------------------------------------
    proba = clf.predict_proba(X_scaled)[:, 1]   # P(distress)

    yearly_ensemble = []
    alarm_year = None

    for i, row in enumerate(rows):
        ep = float(proba[i])
        consensus = round(ep * 100, 1)
        verdict = _verdict(consensus)

        if alarm_year is None and ep > 0.50:
            alarm_year = row["year"]

        yearly_ensemble.append(
            {
                "year": row["year"],
                "z_norm": row["z_norm"],
                "xgb_prob": row["xgb_prob"],
                "cash_risk": row["cash_risk"],
                "survival_risk": row["survival_risk"],
                "ensemble_prob": round(ep, 4),
                "consensus_score": consensus,
                "verdict": verdict,
            }
        )

        print(
            f"  {row['year']}  ensemble_prob={ep:.3f}  consensus={consensus:5.1f}  {verdict}"
        )

    # ------------------------------------------------------------------
    # Model agreement analysis
    # ------------------------------------------------------------------
    print("\n[ensemble] Analysing model agreement …")

    model_agreement = {}
    for row, ep in zip(rows, proba):
        yr = row["year"]
        signals = {
            "altman": int(row["z_norm"] > 0.5),          # z_norm>0.5 = risk
            "xgboost": int(row["xgb_prob"] > 0.5),
            "prophet": int(row["cash_risk"] > 0.3),
            "cox": int(row["survival_risk"] > 0.1),
            "ensemble": int(ep > 0.5),
        }
        agreement_count = sum(signals.values())
        model_agreement[str(yr)] = {
            "signals": signals,
            "models_flagging_distress": agreement_count,
            "full_consensus": agreement_count == 5,
        }
        print(
            f"  {yr}: {agreement_count}/5 models flag distress  —  "
            + ", ".join(f"{k}={'Y' if v else 'N'}" for k, v in signals.items())
        )

    # ------------------------------------------------------------------
    # Assemble and save
    # ------------------------------------------------------------------
    result = {
        "yearly_ensemble": yearly_ensemble,
        "feature_weights": feature_weights,
        "raw_lr_coefficients": raw_coef_str,
        "alarm_year": alarm_year,
        "model_agreement": model_agreement,
        "meta": {
            "meta_learner": "LogisticRegression(C=1.0, class_weight=balanced)",
            "features": feature_names,
            "training_years": ALL_YEARS,
            "labels": LABELS,
            "safe_years": [yr for yr, lbl in LABELS.items() if lbl == 0],
            "distress_years": [yr for yr, lbl in LABELS.items() if lbl == 1],
        },
    }

    out_path = os.path.join(trained_dir, "ensemble_results.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)

    print(f"\n[ensemble] Results saved to {out_path}")
    print(f"[ensemble] First alarm year (ensemble_prob > 50%): {alarm_year}")

    return result


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _trained = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "trained_models",
    )
    run_ensemble(_trained)
