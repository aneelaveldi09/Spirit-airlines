import json
import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Spirit Airlines Bankruptcy Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "trained_models")

def _load_json(filename: str):
    with open(os.path.join(MODELS_DIR, filename)) as f:
        return json.load(f)

@app.get("/")
def root():
    return {"status": "Spirit Analytics API — models trained and ready"}

@app.get("/api/financials")
def get_financials():
    df = pd.read_csv(os.path.join(DATA_DIR, "spirit_financials.csv"))
    return df.to_dict(orient="records")

@app.get("/api/quarterly")
def get_quarterly():
    df = pd.read_csv(os.path.join(DATA_DIR, "quarterly_data.csv"))
    return df.to_dict(orient="records")

@app.get("/api/altman")
def get_altman():
    return _load_json("altman_results.json")

@app.get("/api/gbm")
def get_gbm():
    return _load_json("xgboost_results.json")

@app.get("/api/timeseries")
def get_timeseries():
    return _load_json("prophet_results.json")

@app.get("/api/survival")
def get_survival():
    return _load_json("survival_results.json")

@app.get("/api/summary")
def get_summary():
    s = _load_json("summary.json")
    s["key_signals"] = [
        f"Altman Z-Score entered distress zone in {s['altman_distress_entry']}",
        f"XGBoost flagged >50% bankruptcy probability from {s['xgboost_alarm_year']}",
        f"Prophet forecast cash reserves hitting critical threshold by {s['prophet_zero_cash']}",
        f"Cox survival probability dropped below 70% by {s['cox_alarm_month']}",
        f"XGBoost cross-val AUC: {s['xgb_cv_auc']} — Cox concordance index: {s['cox_concordance']}",
    ]
    return s


@app.get("/api/lstm")
def get_lstm():
    return _load_json("lstm_results.json")


@app.get("/api/sentiment")
def get_sentiment():
    return _load_json("sentiment_results.json")


@app.get("/api/ensemble")
def get_ensemble():
    return _load_json("ensemble_results.json")


@app.get("/api/shap")
def get_shap():
    data = _load_json("xgboost_results.json")
    shap_values = data["shap_values"]

    # Build waterfall structure for the worst year (2023)
    waterfall = []
    cumulative = 0.0
    for item in shap_values:
        direction = item["direction"]
        signed_value = item["mean_abs_shap"] if direction == "risk" else -item["mean_abs_shap"]
        cumulative += signed_value
        waterfall.append({
            "feature": item["feature"],
            "shap_value": round(signed_value, 4),
            "direction": direction,
            "cumulative": round(cumulative, 4),
        })

    return {
        "year": 2023,
        "shap_values": shap_values,
        "waterfall": waterfall,
    }


@app.get("/api/edgar")
def get_edgar():
    df = pd.read_csv(os.path.join(DATA_DIR, "spirit_edgar_full.csv"))
    return df.to_dict(orient="records")


@app.get("/api/health")
def get_health():
    if os.path.exists(MODELS_DIR):
        models = [
            f.replace(".json", "")
            for f in os.listdir(MODELS_DIR)
            if f.endswith(".json")
        ]
    else:
        models = []
    return {"status": "ok", "models": sorted(models)}
