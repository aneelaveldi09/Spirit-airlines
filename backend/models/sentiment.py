"""
sentiment.py — VADER sentiment analysis on Spirit Airlines earnings call quotes
and news headlines. Aggregates scores by quarter and maps to distress signals.
"""

import os
import csv
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORY_MAP = {
    "positive": 1,
    "neutral": 0,
    "negative": -1,
    "very_negative": -2,
}

DISTRESS_MAP = {
    "safe": lambda c: c >= -0.3,
    "warning": lambda c: -0.6 <= c < -0.3,
    "alarm": lambda c: c < -0.6,
}


def _distress_signal(compound: float) -> str:
    if compound < -0.6:
        return "alarm"
    if compound < -0.3:
        return "warning"
    return "safe"


def _normalize_quarter(raw: str) -> str:
    """Return a canonical YYYY-Qn label; year-only strings become YYYY-Annual."""
    raw = raw.strip()
    if "-Q" in raw:
        return raw
    # bare year like '2019' or '2020'
    return f"{raw}-Annual"


def _year_from_quarter(q: str) -> int:
    return int(q.split("-")[0])


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

def run_sentiment(trained_dir: str) -> dict:
    """
    Run VADER sentiment analysis over the Spirit Airlines quote dataset.

    Parameters
    ----------
    trained_dir : str
        Path to the directory where trained_models/ outputs live; results are
        saved as <trained_dir>/sentiment_results.json.

    Returns
    -------
    dict with keys:
        quarterly_sentiment  — list of per-quarter aggregated results
        key_moments          — list of the most negative individual quotes
    """
    data_csv = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        "spirit_earnings_sentiment.csv",
    )

    print("[sentiment] Loading data from:", data_csv)

    # ------------------------------------------------------------------
    # Load CSV
    # ------------------------------------------------------------------
    rows = []
    with open(data_csv, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            rows.append(row)

    print(f"[sentiment] Loaded {len(rows)} quotes")

    # ------------------------------------------------------------------
    # VADER scoring
    # ------------------------------------------------------------------
    analyzer = SentimentIntensityAnalyzer()
    scored = []
    for row in rows:
        quote = row.get("quote", "").strip()
        scores = analyzer.polarity_scores(quote) if quote else {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0}
        quarter = _normalize_quarter(row.get("quarter", "Unknown"))
        cat_raw = row.get("category", "neutral").strip().lower()
        scored.append(
            {
                "date": row.get("date", ""),
                "quarter": quarter,
                "year": _year_from_quarter(quarter),
                "source": row.get("source", ""),
                "speaker": row.get("speaker", ""),
                "quote": quote,
                "category_raw": cat_raw,
                "category_numeric": CATEGORY_MAP.get(cat_raw, 0),
                "compound": round(scores["compound"], 4),
                "pos": round(scores["pos"], 4),
                "neg": round(scores["neg"], 4),
                "neu": round(scores["neu"], 4),
            }
        )

    print("[sentiment] VADER scoring complete")

    # ------------------------------------------------------------------
    # Aggregate by quarter
    # ------------------------------------------------------------------
    # Collect all unique quarters (preserving order 2019 → 2024)
    quarter_order = []
    seen = set()
    for s in scored:
        q = s["quarter"]
        if q not in seen:
            seen.add(q)
            quarter_order.append(q)

    # Sort chronologically: year first, then Q1<Q2<Q3<Q4<Annual
    def _sort_key(q):
        parts = q.split("-")
        year = int(parts[0])
        sub = parts[1] if len(parts) > 1 else "Annual"
        order = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4, "Annual": 5}
        return (year, order.get(sub, 9))

    quarter_order.sort(key=_sort_key)

    quarterly_sentiment = []
    for q in quarter_order:
        q_rows = [s for s in scored if s["quarter"] == q]
        compounds = [r["compound"] for r in q_rows]
        mean_compound = round(sum(compounds) / len(compounds), 4) if compounds else 0.0

        n_positive = sum(1 for r in q_rows if r["compound"] > 0.05)
        n_negative = sum(1 for r in q_rows if r["compound"] < -0.05)
        n_very_negative = sum(1 for r in q_rows if r["compound"] < -0.5)

        # Category label from CSV column (majority vote)
        cat_nums = [r["category_numeric"] for r in q_rows]
        avg_cat = sum(cat_nums) / len(cat_nums) if cat_nums else 0
        if avg_cat >= 0.5:
            label = "positive"
        elif avg_cat >= -0.25:
            label = "neutral"
        elif avg_cat >= -1.25:
            label = "negative"
        else:
            label = "very_negative"

        signal = _distress_signal(mean_compound)

        print(
            f"  {q:15s}  compound={mean_compound:+.4f}  signal={signal:8s}  n={len(q_rows)}"
        )

        quarterly_sentiment.append(
            {
                "quarter": q,
                "year": _year_from_quarter(q),
                "compound": mean_compound,
                "label": label,
                "distress_signal": signal,
                "n_quotes": len(q_rows),
                "n_positive": n_positive,
                "n_negative": n_negative,
                "n_very_negative": n_very_negative,
            }
        )

    # ------------------------------------------------------------------
    # Key moments — most negative quotes
    # ------------------------------------------------------------------
    sorted_by_compound = sorted(scored, key=lambda r: r["compound"])
    key_moments = []
    for r in sorted_by_compound[:10]:
        key_moments.append(
            {
                "date": r["date"],
                "quarter": r["quarter"],
                "speaker": r["speaker"],
                "source": r["source"],
                "quote": r["quote"],
                "compound": r["compound"],
                "distress_signal": _distress_signal(r["compound"]),
                "category_raw": r["category_raw"],
            }
        )

    print(f"\n[sentiment] Top {len(key_moments)} most negative moments identified")
    for km in key_moments[:3]:
        print(f"  [{km['date']}] {km['compound']:+.4f}  \"{km['quote'][:80]}...\"")

    # ------------------------------------------------------------------
    # Assemble output and save
    # ------------------------------------------------------------------
    result = {
        "quarterly_sentiment": quarterly_sentiment,
        "key_moments": key_moments,
        "summary": {
            "total_quotes_analyzed": len(scored),
            "quarters_covered": len(quarterly_sentiment),
            "overall_mean_compound": round(
                sum(r["compound"] for r in scored) / len(scored), 4
            ) if scored else 0.0,
            "alarm_quarters": [
                r["quarter"]
                for r in quarterly_sentiment
                if r["distress_signal"] == "alarm"
            ],
            "warning_quarters": [
                r["quarter"]
                for r in quarterly_sentiment
                if r["distress_signal"] == "warning"
            ],
        },
    }

    out_path = os.path.join(trained_dir, "sentiment_results.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)

    print(f"\n[sentiment] Results saved to {out_path}")
    print(
        f"[sentiment] Alarm quarters : {result['summary']['alarm_quarters']}"
    )
    print(
        f"[sentiment] Warning quarters: {result['summary']['warning_quarters']}"
    )

    return result


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _trained = os.path.join(_base, "trained_models")
    run_sentiment(_trained)
