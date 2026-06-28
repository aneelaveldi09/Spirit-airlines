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
