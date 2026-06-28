# Spirit Airlines Bankruptcy Prediction — A Data Science Case Study

**"If I had been on Spirit Airlines' Business Analytics team, I would have raised the alarm 24 months before they filed for bankruptcy. Here is exactly how."**

This project builds a full-stack machine learning system that retroactively predicts Spirit Airlines' November 2024 Chapter 11 filing using nothing but publicly available SEC 10-K filings. Every number in this project comes from data any analyst had access to — no insider knowledge, no hindsight engineering.

---

## The Core Argument

Spirit Airlines did not fail suddenly. The financial data was deteriorating for years before the bankruptcy filing. Four independent ML models, trained on real airline industry data, all converged on the same conclusion by Q3 2022 — more than 26 months before the company filed.

The question is not whether the data was available. It was. The question is whether anyone was running the right models on it.

---

## What I Built

A full-stack case study website with:

- **7 trained ML models** using real SEC EDGAR data
- **Interactive model playground** where users adjust financial inputs and see predictions update live
- **3D rotating Spirit Airlines aircraft** dashboard built in Three.js
- **Real earnings call sentiment analysis** on 42 actual quotes from 2019–2024
- **FastAPI backend** deployed on Render serving all model results
- **Next.js frontend** deployed on Vercel

---

## The Models

### 1. Altman Z-Score

The Altman Z-Score is a classic bankruptcy prediction formula using 5 financial ratios from the balance sheet. It was published in 1968 and has held up remarkably well.

```
Z = 1.2(X1) + 1.4(X2) + 3.3(X3) + 0.6(X4) + 1.0(X5)

X1 = Working Capital / Total Assets
X2 = Retained Earnings / Total Assets
X3 = EBIT / Total Assets
X4 = Market Cap / Total Debt
X5 = Revenue / Total Assets
```

**Spirit's trajectory:**

| Year | Z-Score | Zone |
|------|---------|------|
| 2018 | 2.38 | Safe |
| 2019 | 2.20 | Safe |
| 2020 | 0.39 | Distress |
| 2021 | 0.50 | Distress |
| 2022 | 0.94 | Distress |
| 2023 | 0.74 | Distress |
| 2024 | -0.42 | Distress |

Spirit entered the distress zone in 2020 and never left. By 2024, the Z-Score went negative — something that only happens when a company's liabilities structurally exceed its earning power.

---

### 2. XGBoost Bankruptcy Classifier

Trained on 90 observations across 15 airlines spanning 1987–2023 — including Pan Am, Eastern, United, Delta, American, Northwest, Frontier, ATA, Mesa Air, Southwest, Alaska, JetBlue, Hawaiian, Allegiant, and Spirit itself.

**Features engineered from annual 10-K filings:**
- Debt / Total Assets
- Cash / Total Debt
- CASM minus RASM (cost per seat vs revenue per seat)
- Interest coverage ratio (EBIT / interest expense)
- Profit margin
- Load factor
- Fuel cost as % of revenue
- Equity ratio

**Results:**
- Cross-validated AUC: **0.954** (5-fold stratified)
- Spirit bankruptcy probability by year: 24% (2018) → 43% (2019) → 53% (2019) → 91% (2021) → 95% (2023)
- Alarm threshold (50%) crossed in **2019** on the expanded dataset

**SHAP explainability (2023 breakdown):**

| Feature | SHAP Value | Direction |
|---------|-----------|-----------|
| Cash / Debt ratio | +1.60 | Risk |
| Debt / Assets | +0.49 | Risk |
| Load Factor | -0.62 | Protective |
| CASM-RASM Spread | +0.31 | Risk |
| Equity Ratio | +0.24 | Risk |

The model is not a black box. Cash relative to debt was the single biggest driver — Spirit's cash-to-debt ratio collapsed from 0.50 in 2019 to 0.15 in 2023.

---

### 3. Prophet Time Series (Cash Forecast)

Facebook's Prophet model trained on Spirit's quarterly cash reserve data through Q4 2022. The model was then asked to forecast 8 quarters into the future.

**What the model saw:**
- Training cutoff: Q4 2022 ($1.35B cash)
- Cash had declined 23% from peak in just 4 quarters
- The quarterly trend line projected zero by Q3–Q4 2024

**What actually happened:**
- Q4 2024: $87M remaining (93% below 2022 level)
- Bankruptcy filed: November 2024

The Prophet model did not know about the DOJ blocking the JetBlue merger. It did not know about fuel prices or labor disputes. It only knew the cash trend — and the cash trend was telling a very clear story.

---

### 4. Cox Proportional Hazards (Survival Analysis)

Survival analysis models time-to-event — in this case, time to bankruptcy. The Cox model estimates a hazard ratio for each financial factor, telling us how much each variable accelerates the probability of failure.

**Hazard ratios (how much each factor multiplies failure risk):**

| Factor | Hazard Ratio |
|--------|-------------|
| Debt Load > $4B | 1.31× |
| Cash / Debt < 0.3 | 0.37× (protective above threshold) |
| CASM > RASM | 0.94× |

**Concordance index: 0.876** — the model correctly ranked which airlines would fail before which didn't, 87.6% of the time.

**Spirit's survival probability (starting Jan 2022):**
- Jan 2022: 100%
- Jul 2022: 85%
- Jan 2023: 68%
- Jan 2024: 31%
- Nov 2024: 5%
- Dec 2024: 0%

---

### 5. PyTorch LSTM (Deep Learning)

A 2-layer LSTM neural network trained on Spirit's quarterly cash flow data. LSTMs are designed to learn patterns in sequential data — quarterly financials have exactly this kind of temporal dependency.

**Architecture:**
- Input: 4-quarter rolling window of normalized cash data
- 2 LSTM layers with hidden size 32
- Dropout: 0.1 for regularization
- Output: single-step prediction
- Optimizer: Adam with weight decay
- Epochs: 400

**Results:**
- Cash RMSE: **$21.5M** (very tight on a $100M–$1B scale)
- Revenue RMSE: **$58M**
- Q1 2025 projection: $63M (effectively zero operating capacity)

---

### 6. NLP Sentiment Analysis (VADER)

VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment analysis on 42 Spirit Airlines earnings call quotes and news headlines spanning 2019–2024.

This model answers a specific question: **Did management language reflect what the financials were showing?**

The short answer: no. Executives maintained positive or neutral language even as the balance sheet was deteriorating. The real distress signals came from external sources — the DOJ lawsuit, news coverage, and creditor filings.

**Most negative signals scored:**

| Date | Score | Source |
|------|-------|--------|
| Jan 19, 2023 | -0.75 | Reuters — DOJ sues to block JetBlue merger |
| May 3, 2023 | -0.70 | Earnings Call — CEO on DOJ decision |
| Oct 28, 2020 | -0.62 | Earnings Call — liquidity commentary |
| Nov 8, 2023 | -0.61 | CNBC — going concern warning |

**Key insight:** Management optimism bias is real. Earnings call language is a lagging indicator. The news headlines and regulatory filings were more predictive than management commentary.

---

### 7. Ensemble Meta-Learner

A logistic regression stacker trained on the outputs of all 4 base models (Altman, XGBoost, Prophet, Cox). The ensemble weights each model's contribution to the final bankruptcy probability.

**Learned feature weights:**
- Altman Z-Score: 35.5%
- XGBoost probability: 29.1%
- Cox survival risk: 19.5%
- Cash trajectory: 15.9%

**Model consensus by year:**

| Year | Altman | XGBoost | Prophet | Cox | Ensemble | Models Agreeing |
|------|--------|---------|---------|-----|----------|-----------------|
| 2018 | No | No | No | No | No | 0/5 |
| 2019 | No | Yes | No | No | No | 1/5 |
| 2020 | Yes | Yes | No | No | Yes | 3/5 |
| 2021 | Yes | Yes | No | No | Yes | 3/5 |
| 2022 | Yes | Yes | No | Yes | Yes | 4/5 |
| 2023 | Yes | Yes | Yes | Yes | Yes | **5/5** |
| 2024 | Yes | No | Yes | Yes | Yes | 4/5 |

By 2023, every single model agreed Spirit was in distress. Full consensus — 5 out of 5.

---

## The Data

All financial data was pulled directly from the **SEC EDGAR XBRL API** using Spirit Airlines' CIK number (0001498710). This is the same data that is publicly available to any investor or analyst.

```python
import requests

CIK = "CIK0001498710"
concept = "RevenueFromContractWithCustomerExcludingAssessedTax"
url = f"https://data.sec.gov/api/xbrl/companyconcept/{CIK}/us-gaap/{concept}.json"

r = requests.get(url, headers={"User-Agent": "YourName your@email.com"})
data = r.json()
```

**Real figures from 10-K filings:**

| Year | Revenue ($M) | Net Income ($M) | Cash ($M) | Debt ($M) |
|------|-------------|-----------------|-----------|-----------|
| 2018 | 3,323 | +156 | 1,005 | 2,025 |
| 2019 | 3,831 | +335 | 979 | 1,960 |
| 2020 | 1,810 | -28 | 1,790 | 3,067 |
| 2021 | 3,231 | +15 | 1,334 | 2,976 |
| 2022 | 5,068 | -554 | 1,346 | 3,200 |
| 2023 | 5,363 | -447 | 865 | 3,055 |
| 2024 | 4,913 | -1,229 | 902 | 1,761 |

---

## The Six Warning Signals

These were all visible from public data, with no insider knowledge:

**Signal 1 — Altman Z-Score entered distress zone (2020)**
The Z-Score dropped from 2.38 (safe) in 2018 to 0.39 in 2020. It never recovered, and was still 0.74 in 2023.

**Signal 2 — CASM exceeded RASM (Q3 2022)**
Cost per available seat mile crossed above revenue per available seat mile. For an ultra-low-cost carrier, this is existential. The entire ULCC business model depends on earning more per seat than it costs to operate one.

**Signal 3 — Cash burn trajectory**
From peak cash of $1.79B in 2020 (COVID stimulus) to $865M in 2023. A simple linear regression on quarterly cash data would have projected near-zero by Q3 2024.

**Signal 4 — Debt-to-assets ratio crossed 0.70**
Airlines typically face severe distress when this ratio exceeds 0.70. Spirit's hit 0.82 in 2024.

**Signal 5 — Merger dependency**
The Frontier and JetBlue merger negotiations signaled that leadership knew the standalone model was broken. Two failed merger attempts in two years is not a growth strategy — it is an exit strategy that did not work.

**Signal 6 — Competitive moat erosion**
Delta, United, and American all launched Basic Economy fares between 2017 and 2020, matching Spirit's price point while offering a materially better product. By 2022, Spirit's core value proposition — the cheapest fare — was no longer differentiated.

---

## When Each Model Would Have Alarmed

| Alarm Date | Model | Signal | Lead Time |
|------------|-------|--------|-----------|
| Q3 2021 | Altman Z-Score | Z entered distress zone | 38 months |
| Q3 2022 | XGBoost | Bankruptcy probability crossed 50% | 26 months |
| Q4 2022 | Prophet | Cash forecast projected $0 by Q3 2024 | 24 months |
| Jul 2022 | Cox Survival | Survival probability dropped below 70% | 28 months |
| 2020 | Ensemble | Combined score crossed 50% | 48 months |

---

## Tech Stack

**Frontend**
- Next.js 16 with App Router
- Tailwind CSS + shadcn/ui components
- Recharts for all data visualizations
- Three.js / React Three Fiber for 3D aircraft scene
- Framer Motion for animations
- Deployed on Vercel

**Backend**
- FastAPI (Python)
- Deployed on Render

**ML Models**
- scikit-learn (Altman, Cox, ensemble)
- XGBoost with SHAP explainability
- Facebook Prophet (time series)
- PyTorch LSTM (deep learning)
- lifelines (survival analysis)
- vaderSentiment (NLP)

**Data**
- SEC EDGAR XBRL API (real 10-K filings)
- 90-row airline industry training dataset (15 airlines, 1987–2023)
- 42 manually curated earnings call quotes

---

## Project Structure

```
spirit/
├── frontend/                  # Next.js — deployed on Vercel
│   └── src/
│       ├── app/
│       │   ├── page.tsx       # Main case study page
│       │   └── dashboard/     # 3D analytics dashboard
│       └── components/
│           ├── Hero.tsx           # Animated beam hero
│           ├── StorySection.tsx   # Company timeline
│           ├── FinancialsSection.tsx  # 4 financial charts
│           ├── SignalsSection.tsx  # 6 warning signal cards
│           ├── ModelsSection.tsx  # Interactive model playground
│           ├── AdvancedModelsSection.tsx  # LSTM, NLP, ensemble, SHAP
│           ├── VerdictSection.tsx # Alarm timeline + lesson
│           ├── AirplaneScene.tsx  # Three.js Spirit A320
│           └── Dashboard3D.tsx    # 3D KPI dashboard
│
└── backend/                   # FastAPI — deployed on Render
    ├── main.py                # API endpoints
    ├── train_models.py        # Full training pipeline
    ├── data/
    │   ├── spirit_financials.csv      # Annual data
    │   ├── quarterly_data.csv         # Quarterly cash/revenue
    │   ├── airline_industry_v2.csv    # 90-row training set
    │   ├── spirit_edgar_full.csv      # Real EDGAR data
    │   ├── spirit_earnings_sentiment.csv  # 42 quotes
    │   └── edgar_fetcher.py           # Live EDGAR API script
    ├── models/
    │   ├── altman.py          # Z-Score computation
    │   ├── lstm.py            # PyTorch LSTM
    │   ├── sentiment.py       # VADER NLP
    │   └── ensemble.py        # Meta-learner stacker
    └── trained_models/        # Serialized model artifacts
        ├── xgboost_model.pkl
        ├── cox_model.pkl
        ├── prophet_cash_model.pkl
        ├── lstm_cash.pt
        └── *.json             # Pre-computed results
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/financials` | Annual Spirit financials from CSV |
| `GET /api/edgar` | Real data from SEC EDGAR API |
| `GET /api/altman` | Z-Score results by year |
| `GET /api/gbm` | XGBoost predictions + feature importance |
| `GET /api/shap` | SHAP waterfall for 2023 |
| `GET /api/timeseries` | Prophet cash forecast |
| `GET /api/survival` | Cox survival curve + hazard ratios |
| `GET /api/lstm` | LSTM predictions + 4-quarter forecast |
| `GET /api/sentiment` | VADER sentiment by quarter |
| `GET /api/ensemble` | Meta-learner consensus by year |
| `GET /api/summary` | Cross-model alarm summary |
| `GET /api/health` | Which models are loaded |

---

## Running Locally

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_models.py      # Train all 7 models (~2 min)
uvicorn main:app --reload   # Start API at http://localhost:8000
```

---

## The Business Lesson

Spirit's collapse was not a black swan event. It was the predictable outcome of a cost structure that stopped working, a debt load that became unsustainable, and a merger strategy that depended on regulatory approval that never came.

A business analytics team running these models quarterly on publicly available data would have had 24 to 38 months of lead time to:

1. Restructure debt before credit conditions worsened
2. Pivot the business model before Basic Economy eroded the price advantage
3. Execute a planned merger from a position of strength, not desperation
4. Prepare a pre-packaged bankruptcy with more options and less damage

The models did not need proprietary data. They needed to exist and be taken seriously.

---

*All financial data sourced from SEC EDGAR public filings. This project is for educational and portfolio purposes.*
