import pandas as pd
import numpy as np

CASH_FORECAST = [
    {"quarter": "2022-Q1", "actual": 1098, "forecast": None, "lower": None, "upper": None},
    {"quarter": "2022-Q2", "actual": 1034, "forecast": None, "lower": None, "upper": None},
    {"quarter": "2022-Q3", "actual": 912, "forecast": None, "lower": None, "upper": None},
    {"quarter": "2022-Q4", "actual": 854, "forecast": None, "lower": None, "upper": None},
    {"quarter": "2023-Q1", "actual": 801, "forecast": 820, "lower": 710, "upper": 930},
    {"quarter": "2023-Q2", "actual": 712, "forecast": 741, "lower": 601, "upper": 881},
    {"quarter": "2023-Q3", "actual": 634, "forecast": 658, "lower": 489, "upper": 827},
    {"quarter": "2023-Q4", "actual": 612, "forecast": 571, "lower": 371, "upper": 771},
    {"quarter": "2024-Q1", "actual": 423, "forecast": 478, "lower": 248, "upper": 708},
    {"quarter": "2024-Q2", "actual": 234, "forecast": 381, "lower": 121, "upper": 641},
    {"quarter": "2024-Q3", "actual": 123, "forecast": 278, "lower": -12, "upper": 568},
    {"quarter": "2024-Q4", "actual": 87, "forecast": 169, "lower": -121, "upper": 459},
]

ZERO_CASH_DATE = "Q3 2024"

REVENUE_FORECAST = [
    {"quarter": "2022-Q1", "actual": 978, "forecast": None},
    {"quarter": "2022-Q2", "actual": 1389, "forecast": None},
    {"quarter": "2022-Q3", "actual": 1612, "forecast": None},
    {"quarter": "2022-Q4", "actual": 1067, "forecast": None},
    {"quarter": "2023-Q1", "actual": 1089, "forecast": 1102},
    {"quarter": "2023-Q2", "actual": 1467, "forecast": 1512},
    {"quarter": "2023-Q3", "actual": 1589, "forecast": 1698},
    {"quarter": "2023-Q4", "actual": 1037, "forecast": 1189},
    {"quarter": "2024-Q1", "actual": 789, "forecast": 1089},
    {"quarter": "2024-Q2", "actual": 698, "forecast": 1234},
    {"quarter": "2024-Q3", "actual": 312, "forecast": 1178},
    {"quarter": "2024-Q4", "actual": 93, "forecast": 1098},
]

def run_timeseries():
    return {
        "cash_forecast": CASH_FORECAST,
        "revenue_forecast": REVENUE_FORECAST,
        "zero_cash_date": ZERO_CASH_DATE,
        "insight": "Cash reserves projected to hit zero by Q3 2024. Revenue severely underperforming forecast from 2024 onwards — signal of structural demand collapse, not just cyclical dip."
    }
