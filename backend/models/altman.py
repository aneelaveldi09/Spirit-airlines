import pandas as pd
import numpy as np

def compute_altman_z(row):
    working_capital = row["cash_equivalents"] - (row["total_debt"] * 0.15)
    total_assets = row["total_assets"]
    retained_earnings = row["equity"] * 0.6
    ebit = row["ebitda"] - (row["total_assets"] * 0.04)
    market_cap = max(row["equity"] * 1.2, 100)
    revenue = row["revenue"]

    x1 = working_capital / total_assets
    x2 = retained_earnings / total_assets
    x3 = ebit / total_assets
    x4 = market_cap / row["total_debt"]
    x5 = revenue / total_assets

    z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5
    return round(z, 3)

def get_zone(z):
    if z > 2.99:
        return "Safe"
    elif z > 1.81:
        return "Grey Zone"
    else:
        return "Distress"

def run_altman(df: pd.DataFrame):
    results = []
    for _, row in df.iterrows():
        z = compute_altman_z(row)
        results.append({
            "year": int(row["year"]),
            "z_score": z,
            "zone": get_zone(z),
            "revenue": row["revenue"],
            "cash": row["cash_equivalents"],
            "debt": row["total_debt"],
        })
    return results
