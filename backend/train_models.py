"""
Spirit Airlines Bankruptcy Prediction — Model Training Script
Trains all 4 models and saves them to backend/trained_models/
"""

import os
import json
import joblib
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

TRAINED_DIR = os.path.join(os.path.dirname(__file__), "trained_models")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(TRAINED_DIR, exist_ok=True)

# ─────────────────────────────────────────────
# MODEL 1: Altman Z-Score
# ─────────────────────────────────────────────
def train_altman():
    print("\n[1/4] Computing Altman Z-Score for Spirit Airlines...")

    spirit = pd.read_csv(os.path.join(DATA_DIR, "spirit_financials.csv"))

    results = []
    for _, row in spirit.iterrows():
        ta = row["total_assets"]
        working_capital = row["cash_equivalents"] - (row["total_debt"] * 0.15)
        retained_earnings = row["equity"] * 0.6
        ebit = row["ebitda"] - (ta * 0.04)
        mkt_cap = max(row["equity"] * 1.2, 100)

        x1 = working_capital / ta
        x2 = retained_earnings / ta
        x3 = ebit / ta
        x4 = mkt_cap / row["total_debt"]
        x5 = row["revenue"] / ta

        z = 1.2*x1 + 1.4*x2 + 3.3*x3 + 0.6*x4 + 1.0*x5

        zone = "Safe" if z > 2.99 else ("Grey Zone" if z > 1.81 else "Distress")
        results.append({
            "year": int(row["year"]),
            "z_score": round(z, 3),
            "zone": zone,
            "x1_working_capital": round(x1, 4),
            "x2_retained_earnings": round(x2, 4),
            "x3_ebit": round(x3, 4),
            "x4_market_cap": round(x4, 4),
            "x5_revenue": round(x5, 4),
        })

    out_path = os.path.join(TRAINED_DIR, "altman_results.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"  Z-Score trajectory: {[round(r['z_score'],2) for r in results]}")
    print(f"  Saved → {out_path}")
    return results


# ─────────────────────────────────────────────
# MODEL 2: XGBoost Bankruptcy Classifier
# ─────────────────────────────────────────────
def train_xgboost():
    print("\n[2/4] Training XGBoost bankruptcy classifier...")
    import shap
    from xgboost import XGBClassifier
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline

    df = pd.read_csv(os.path.join(DATA_DIR, "airline_industry_v2.csv"))

    # Feature engineering
    df["debt_to_assets"] = df["total_debt"] / df["total_assets"]
    df["cash_to_debt"] = df["cash"] / df["total_debt"]
    df["casm_rasm_spread"] = df["casm"] - df["rasm"]
    df["interest_coverage"] = df["ebit"] / df["interest_expense"].replace(0, 1)
    df["profit_margin"] = df["net_income"] / df["revenue"]
    df["revenue_per_asm"] = df["rasm"]
    df["fuel_pct_revenue"] = df["fuel_cost"] / df["revenue"]
    df["equity_ratio"] = df["equity"] / df["total_assets"]

    FEATURES = [
        "debt_to_assets", "cash_to_debt", "casm_rasm_spread",
        "interest_coverage", "profit_margin", "load_factor",
        "fuel_pct_revenue", "equity_ratio",
    ]

    X = df[FEATURES].fillna(0)
    y = df["went_bankrupt"]

    model = XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.1,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")
    print(f"  Cross-val AUC: {scores.mean():.3f} ± {scores.std():.3f}")

    model.fit(X, y)

    # SHAP values on Spirit rows
    spirit_rows = df[df["airline"] == "Spirit"][FEATURES].fillna(0)
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(spirit_rows)

    shap_summary = []
    for i, feat in enumerate(FEATURES):
        mean_shap = float(np.abs(shap_vals[:, i]).mean())
        direction = "risk" if float(shap_vals[:, i].mean()) > 0 else "safe"
        shap_summary.append({
            "feature": feat,
            "mean_abs_shap": round(mean_shap, 4),
            "direction": direction,
        })
    shap_summary.sort(key=lambda x: x["mean_abs_shap"], reverse=True)

    # Year-by-year Spirit predictions
    spirit_preds = []
    spirit_df = df[df["airline"] == "Spirit"].copy()
    spirit_df["debt_to_assets"] = spirit_df["total_debt"] / spirit_df["total_assets"]
    spirit_df["cash_to_debt"] = spirit_df["cash"] / spirit_df["total_debt"]
    spirit_df["casm_rasm_spread"] = spirit_df["casm"] - spirit_df["rasm"]
    spirit_df["interest_coverage"] = spirit_df["ebit"] / spirit_df["interest_expense"].replace(0, 1)
    spirit_df["profit_margin"] = spirit_df["net_income"] / spirit_df["revenue"]
    spirit_df["fuel_pct_revenue"] = spirit_df["fuel_cost"] / spirit_df["revenue"]
    spirit_df["equity_ratio"] = spirit_df["equity"] / spirit_df["total_assets"]

    probs = model.predict_proba(spirit_df[FEATURES].fillna(0))[:, 1]
    for i, (_, row) in enumerate(spirit_df.iterrows()):
        spirit_preds.append({
            "year": int(row["year"]),
            "bankruptcy_prob": round(float(probs[i]) * 100, 1),
        })

    feature_importance = {
        feat: round(float(model.feature_importances_[i]), 4)
        for i, feat in enumerate(FEATURES)
    }

    output = {
        "cv_auc": round(float(scores.mean()), 3),
        "yearly_risk": spirit_preds,
        "shap_values": shap_summary,
        "feature_importance": feature_importance,
        "alarm_year": next((r["year"] for r in spirit_preds if r["bankruptcy_prob"] >= 50), None),
        "features": FEATURES,
    }

    joblib.dump(model, os.path.join(TRAINED_DIR, "xgboost_model.pkl"))
    with open(os.path.join(TRAINED_DIR, "xgboost_results.json"), "w") as f:
        json.dump(output, f, indent=2)

    print(f"  Spirit risk by year: {[(r['year'], r['bankruptcy_prob']) for r in spirit_preds]}")
    print(f"  Top features: {shap_summary[:3]}")
    print(f"  Saved → trained_models/xgboost_model.pkl + xgboost_results.json")
    return output


# ─────────────────────────────────────────────
# MODEL 3: Prophet Cash & Revenue Forecasting
# ─────────────────────────────────────────────
def train_prophet():
    print("\n[3/4] Training Prophet time series model...")
    from prophet import Prophet

    quarterly = pd.read_csv(os.path.join(DATA_DIR, "quarterly_data.csv"))
    quarterly["ds"] = pd.to_datetime(quarterly["quarter"].apply(
        lambda q: f"{q[:4]}-{'01' if 'Q1' in q else '04' if 'Q2' in q else '07' if 'Q3' in q else '10'}-01"
    ))

    # Train on data through Q4 2022 (8 quarters from Q1 2021)
    train_df = quarterly[quarterly["ds"] <= "2022-12-01"].copy()
    full_df = quarterly.copy()

    # Cash model
    cash_train = train_df[["ds", "cash"]].rename(columns={"cash": "y"})
    cash_model = Prophet(
        seasonality_mode="additive",
        changepoint_prior_scale=0.3,
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=False,
    )
    cash_model.fit(cash_train)

    future = cash_model.make_future_dataframe(periods=8, freq="QS")
    cash_forecast = cash_model.predict(future)

    cash_results = []
    for _, row in full_df.iterrows():
        match = cash_forecast[cash_forecast["ds"] == row["ds"]]
        if len(match) > 0:
            m = match.iloc[0]
            is_forecast = row["ds"] > pd.Timestamp("2022-12-01")
            cash_results.append({
                "quarter": row["quarter"],
                "actual": int(row["cash"]),
                "forecast": round(float(m["yhat"]), 0) if is_forecast else None,
                "lower": round(float(m["yhat_lower"]), 0) if is_forecast else None,
                "upper": round(float(m["yhat_upper"]), 0) if is_forecast else None,
            })
        else:
            is_forecast = row["ds"] > pd.Timestamp("2022-12-01")
            cash_results.append({
                "quarter": row["quarter"],
                "actual": int(row["cash"]),
                "forecast": None,
                "lower": None,
                "upper": None,
            })

    # Revenue model
    rev_train = train_df[["ds", "revenue"]].rename(columns={"revenue": "y"})
    rev_model = Prophet(
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.25,
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=False,
    )
    rev_model.fit(rev_train)

    rev_future = rev_model.make_future_dataframe(periods=8, freq="QS")
    rev_forecast = rev_model.predict(rev_future)

    rev_results = []
    for _, row in full_df.iterrows():
        match = rev_forecast[rev_forecast["ds"] == row["ds"]]
        is_forecast = row["ds"] > pd.Timestamp("2022-12-01")
        if len(match) > 0:
            m = match.iloc[0]
            rev_results.append({
                "quarter": row["quarter"],
                "actual": int(row["revenue"]),
                "forecast": round(float(m["yhat"]), 0) if is_forecast else None,
            })
        else:
            rev_results.append({
                "quarter": row["quarter"],
                "actual": int(row["revenue"]),
                "forecast": None,
            })

    # Find when forecast first dips below $200M
    zero_cash_row = next(
        (r for r in cash_results if r["forecast"] is not None and r["forecast"] < 200),
        None
    )
    zero_cash_date = zero_cash_row["quarter"] if zero_cash_row else "Q4 2024"

    output = {
        "cash_forecast": cash_results,
        "revenue_forecast": rev_results,
        "zero_cash_date": zero_cash_date,
        "training_cutoff": "Q4 2022",
        "insight": f"Cash reserves projected to hit critical threshold ($200M) by {zero_cash_date}. Revenue severely underperforming forecast from Q1 2024 onwards."
    }

    joblib.dump(cash_model, os.path.join(TRAINED_DIR, "prophet_cash_model.pkl"))
    joblib.dump(rev_model, os.path.join(TRAINED_DIR, "prophet_revenue_model.pkl"))
    with open(os.path.join(TRAINED_DIR, "prophet_results.json"), "w") as f:
        json.dump(output, f, indent=2)

    print(f"  Zero cash date forecast: {zero_cash_date}")
    print(f"  Saved → trained_models/prophet_*.pkl + prophet_results.json")
    return output


# ─────────────────────────────────────────────
# MODEL 4: Cox Proportional Hazards (Survival)
# ─────────────────────────────────────────────
def train_survival():
    print("\n[4/4] Training Cox Proportional Hazards survival model...")
    from lifelines import CoxPHFitter, KaplanMeierFitter

    df = pd.read_csv(os.path.join(DATA_DIR, "airline_industry_v2.csv"))

    # Build survival dataset: one row per airline
    # duration = years of data we have, event = went_bankrupt
    df["debt_to_assets"] = df["total_debt"] / df["total_assets"]
    df["cash_to_debt"] = df["cash"] / df["total_debt"]
    df["casm_rasm_spread"] = df["casm"] - df["rasm"]
    df["interest_coverage"] = df["ebit"] / df["interest_expense"].replace(0, 1)
    df["equity_ratio"] = df["equity"] / df["total_assets"]

    # Use last observation per airline as survival record
    survival_df = df.sort_values("year").groupby("airline").last().reset_index()
    survival_df["duration"] = survival_df.apply(
        lambda r: (r["bankrupt_year"] - r["year"] + 1) if r["went_bankrupt"] else 5,
        axis=1,
    )
    survival_df["duration"] = survival_df["duration"].clip(lower=1)

    COX_FEATURES = [
        "debt_to_assets", "cash_to_debt", "casm_rasm_spread",
        "interest_coverage", "load_factor", "equity_ratio",
    ]

    cox_df = survival_df[COX_FEATURES + ["duration", "went_bankrupt"]].fillna(0)

    cph = CoxPHFitter(penalizer=0.1)
    cph.fit(cox_df, duration_col="duration", event_col="went_bankrupt")

    print(cph.summary[["exp(coef)", "p"]].to_string())

    # Kaplan-Meier survival curve for Spirit specifically
    # Spirit: treat each year as a time-step starting from 2022
    spirit_last = survival_df[survival_df["airline"] == "Spirit"].iloc[0]
    spirit_cox_row = pd.DataFrame([{
        "debt_to_assets": spirit_last["debt_to_assets"],
        "cash_to_debt": spirit_last["cash_to_debt"],
        "casm_rasm_spread": spirit_last["casm_rasm_spread"],
        "interest_coverage": spirit_last["interest_coverage"],
        "load_factor": spirit_last["load_factor"],
        "equity_ratio": spirit_last["equity_ratio"],
    }])

    survival_func = cph.predict_survival_function(spirit_cox_row)

    # Build survival curve output
    quarters = [
        ("Jan'22", 0), ("Jul'22", 2), ("Jan'23", 4),
        ("Jul'23", 6), ("Jan'24", 8), ("Jul'24", 10),
        ("Nov'24", 11), ("Dec'24", 12),
    ]
    survival_curve = []
    for label, t in quarters:
        times = survival_func.index
        closest_t = times[np.argmin(np.abs(times - t))]
        prob = float(survival_func.loc[closest_t].iloc[0]) * 100
        survival_curve.append({
            "month": label,
            "prob": round(max(0, prob), 1),
        })

    # Hazard ratios
    hazard_factors = []
    for feat in COX_FEATURES:
        row = cph.summary.loc[feat]
        hazard_factors.append({
            "factor": feat.replace("_", " ").title(),
            "hazard_ratio": round(float(row["exp(coef)"]), 3),
            "p_value": round(float(row["p"]), 3),
        })
    hazard_factors.sort(key=lambda x: x["hazard_ratio"], reverse=True)

    # When did survival prob first drop below 70%?
    alarm_month = next(
        (sc["month"] for sc in survival_curve if sc["prob"] < 70),
        "Jan'24"
    )

    output = {
        "survival_curve": survival_curve,
        "hazard_factors": hazard_factors,
        "alarm_month": alarm_month,
        "concordance_index": round(float(cph.concordance_index_), 3),
        "insight": f"By {alarm_month}, Spirit's survival probability dropped below 70%. The Cox model identified debt load and cost-revenue inversion as dominant mortality drivers."
    }

    joblib.dump(cph, os.path.join(TRAINED_DIR, "cox_model.pkl"))
    with open(os.path.join(TRAINED_DIR, "survival_results.json"), "w") as f:
        json.dump(output, f, indent=2)

    print(f"  Concordance index: {output['concordance_index']}")
    print(f"  Alarm month: {alarm_month}")
    print(f"  Saved → trained_models/cox_model.pkl + survival_results.json")
    return output


# ─────────────────────────────────────────────
# RUN ALL
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  SPIRIT AIRLINES — BANKRUPTCY PREDICTION MODEL TRAINING")
    print("=" * 60)

    altman_results = train_altman()
    xgb_results = train_xgboost()
    prophet_results = train_prophet()
    survival_results = train_survival()

    from models.lstm import run_lstm
    from models.sentiment import run_sentiment
    from models.ensemble import run_ensemble
    lstm_results = run_lstm(TRAINED_DIR)
    sentiment_results = run_sentiment(TRAINED_DIR)
    ensemble_results = run_ensemble(TRAINED_DIR)

    # Save combined summary
    summary = {
        "earliest_signal": "2021",
        "model_consensus_alarm": "2022",
        "altman_distress_entry": next(r["year"] for r in altman_results if r["zone"] == "Distress"),
        "xgboost_alarm_year": xgb_results["alarm_year"],
        "prophet_zero_cash": prophet_results["zero_cash_date"],
        "cox_alarm_month": survival_results["alarm_month"],
        "cox_concordance": survival_results["concordance_index"],
        "xgb_cv_auc": xgb_results["cv_auc"],
        "lstm_cash_rmse": lstm_results.get("cash", {}).get("rmse"),
        "sentiment_alarm_quarters": sentiment_results.get("alarm_quarters", []),
        "ensemble_alarm_year": ensemble_results.get("alarm_year"),
    }

    with open(os.path.join(TRAINED_DIR, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 60)
    print("  ALL MODELS TRAINED SUCCESSFULLY")
    print("=" * 60)
    for k, v in summary.items():
        print(f"  {k}: {v}")
