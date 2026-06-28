"""
Fetches Spirit Airlines financial data directly from SEC EDGAR XBRL API.
CIK: 0001498710
"""
import requests
import json
import os

HEADERS = {"User-Agent": "SpiritAnalytics aneelaveldi09@gmail.com"}
BASE = "https://data.sec.gov"
CIK = "CIK0001498710"

CONCEPTS = {
    "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"],
    "net_income": ["NetIncomeLoss"],
    "total_assets": ["Assets"],
    "total_debt": ["LongTermDebtAndCapitalLeaseObligations", "LongTermDebt"],
    "cash": ["CashAndCashEquivalentsAtCarryingValue"],
    "operating_expenses": ["OperatingExpenses", "CostsAndExpenses"],
    "interest_expense": ["InterestExpense"],
}

def fetch_concept(concept: str) -> dict:
    url = f"{BASE}/api/xbrl/companyconcept/{CIK}/us-gaap/{concept}.json"
    r = requests.get(url, headers=HEADERS, timeout=15)
    if r.status_code != 200:
        return {}
    return r.json()

def extract_annual(concept_data: dict, label: str) -> dict:
    results = {}
    try:
        units = concept_data.get("units", {})
        usd = units.get("USD", [])
        for entry in usd:
            if entry.get("form") == "10-K" and entry.get("fp") == "FY":
                year = entry["end"][:4]
                val = entry["val"]
                if year not in results or results[year] < val:
                    results[year] = val
    except Exception:
        pass
    return results

def fetch_all():
    print("Fetching Spirit Airlines data from SEC EDGAR...")
    raw = {}
    for field, concepts in CONCEPTS.items():
        for concept in concepts:
            data = fetch_concept(concept)
            if data:
                annual = extract_annual(data, field)
                if annual:
                    if field not in raw:
                        raw[field] = annual
                    else:
                        for y, v in annual.items():
                            if y not in raw[field]:
                                raw[field][y] = v
                    print(f"  {field} ({concept}): {dict(sorted(annual.items()))}")
                    break

    years = sorted(set(y for vals in raw.values() for y in vals.keys()))
    years = [y for y in years if "2018" <= y <= "2024"]

    records = []
    for year in years:
        rec = {"year": int(year), "source": "SEC_EDGAR"}
        for field in CONCEPTS:
            rec[field] = raw.get(field, {}).get(year, None)
        records.append(rec)

    out_path = os.path.join(os.path.dirname(__file__), "spirit_edgar.json")
    with open(out_path, "w") as f:
        json.dump(records, f, indent=2)
    print(f"\nSaved {len(records)} years of EDGAR data → {out_path}")
    return records

if __name__ == "__main__":
    records = fetch_all()
    for r in records:
        print(r)
