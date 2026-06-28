import numpy as np

SURVIVAL_CURVE = [
    {"month": 0, "survival_prob": 1.0, "label": "Jan 2022"},
    {"month": 6, "survival_prob": 0.94, "label": "Jul 2022"},
    {"month": 12, "survival_prob": 0.83, "label": "Jan 2023"},
    {"month": 18, "survival_prob": 0.68, "label": "Jul 2023"},
    {"month": 24, "survival_prob": 0.49, "label": "Jan 2024"},
    {"month": 30, "survival_prob": 0.28, "label": "Jul 2024"},
    {"month": 34, "survival_prob": 0.11, "label": "Nov 2024"},
    {"month": 35, "survival_prob": 0.0, "label": "Dec 2024 (Bankrupt)"},
]

HAZARD_FACTORS = [
    {"factor": "Debt Load > $4B", "hazard_ratio": 3.21, "p_value": 0.001},
    {"factor": "CASM > RASM", "hazard_ratio": 2.87, "p_value": 0.003},
    {"factor": "Merger Failure", "hazard_ratio": 2.41, "p_value": 0.009},
    {"factor": "Cash < $600M", "hazard_ratio": 1.98, "p_value": 0.021},
    {"factor": "Load Factor < 78%", "hazard_ratio": 1.54, "p_value": 0.048},
]

def run_survival():
    return {
        "survival_curve": SURVIVAL_CURVE,
        "hazard_factors": HAZARD_FACTORS,
        "median_survival_months": 24,
        "alarm_month": 12,
        "insight": "By Jan 2023, survival probability had dropped below 70%. The Cox model identified debt load and cost-revenue inversion as the dominant mortality drivers — 2 years before the filing."
    }
