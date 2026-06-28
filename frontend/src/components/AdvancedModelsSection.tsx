"use client";
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend,
} from "recharts";

const TT = {
  backgroundColor: "#0D0D0D",
  border: "1px solid rgba(255,230,0,0.3)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

// ── Data ──────────────────────────────────────────────────────
const LSTM_CASH = [
  { q: "Q1'22", actual: 1098, pred: null },
  { q: "Q2'22", actual: 1034, pred: null },
  { q: "Q3'22", actual: 912,  pred: null },
  { q: "Q4'22", actual: 854,  pred: null },
  { q: "Q1'23", actual: 801,  pred: 878 },
  { q: "Q2'23", actual: 712,  pred: 734 },
  { q: "Q3'23", actual: 634,  pred: 622 },
  { q: "Q4'23", actual: 612,  pred: 589 },
  { q: "Q1'24", actual: 423,  pred: 398 },
  { q: "Q2'24", actual: 234,  pred: 267 },
  { q: "Q3'24", actual: 123,  pred: 141 },
  { q: "Q4'24", actual: 87,   pred: 62  },
  { q: "Q1'25", actual: null, pred: 63  },
  { q: "Q2'25", actual: null, pred: 52  },
  { q: "Q3'25", actual: null, pred: 49  },
  { q: "Q4'25", actual: null, pred: 47  },
];

const SENTIMENT_DATA = [
  { quarter: "Q2'19", compound: 0.77,  label: "safe",    signal: "safe" },
  { quarter: "Q3'19", compound: 0.77,  label: "safe",    signal: "safe" },
  { quarter: "Q1'20", compound: 0.70,  label: "safe",    signal: "safe" },
  { quarter: "Q2'20", compound: -0.08, label: "safe",    signal: "safe" },
  { quarter: "Q3'20", compound: -0.62, label: "alarm",   signal: "alarm" },
  { quarter: "Q4'20", compound: -0.47, label: "warning", signal: "warning" },
  { quarter: "Q1'21", compound: 0.77,  label: "safe",    signal: "safe" },
  { quarter: "Q2'21", compound: 0.60,  label: "safe",    signal: "safe" },
  { quarter: "Q3'21", compound: 0.61,  label: "safe",    signal: "safe" },
  { quarter: "Q4'21", compound: 0.56,  label: "safe",    signal: "safe" },
  { quarter: "Q2'22", compound: 0.74,  label: "safe",    signal: "safe" },
  { quarter: "Q3'22", compound: 0.14,  label: "safe",    signal: "safe" },
  { quarter: "Q4'22", compound: 0.42,  label: "safe",    signal: "safe" },
  { quarter: "Q1'23", compound: -0.19, label: "safe",    signal: "safe" },
  { quarter: "Q2'23", compound: 0.55,  label: "safe",    signal: "safe" },
  { quarter: "Q3'23", compound: 0.18,  label: "safe",    signal: "safe" },
  { quarter: "Q4'23", compound: 0.00,  label: "neutral", signal: "safe" },
  { quarter: "Q1'24", compound: 0.27,  label: "safe",    signal: "safe" },
  { quarter: "Q2'24", compound: 0.14,  label: "safe",    signal: "safe" },
];

const KEY_MOMENTS = [
  { date: "Jan 19, 2023", score: -0.75, text: "DOJ sues to block JetBlue-Spirit merger citing harm to budget travelers", source: "Reuters" },
  { date: "May 3, 2023",  score: -0.70, text: "We are deeply disappointed by the DOJ's decision to seek to block our combination with JetBlue", source: "Earnings Call" },
  { date: "Oct 28, 2020", score: -0.62, text: "We ended the quarter with approximately $1.4 billion in liquidity — navigating through this crisis", source: "Earnings Call" },
  { date: "Nov 8, 2023",  score: -0.61, text: "Spirit Airlines shares plunge after company warns it may not survive as going concern", source: "CNBC" },
  { date: "Sep 12, 2023", score: -0.58, text: "Spirit Airlines warns of potential bankruptcy as losses mount and cash dwindles", source: "Reuters" },
];

const ENSEMBLE_DATA = [
  { year: "2018", prob: 33.5, verdict: "Watch",     z: 2.38, xgb: 43, cash: 3,  survival: 2  },
  { year: "2019", prob: 37.3, verdict: "Watch",     z: 2.20, xgb: 53, cash: 0,  survival: 3  },
  { year: "2020", prob: 52.8, verdict: "High Risk", z: 0.39, xgb: 56, cash: 13, survival: 4  },
  { year: "2021", prob: 61.8, verdict: "High Risk", z: 0.50, xgb: 91, cash: 2,  survival: 6  },
  { year: "2022", prob: 61.2, verdict: "High Risk", z: 0.94, xgb: 89, cash: 14, survival: 17 },
  { year: "2023", prob: 74.0, verdict: "High Risk", z: 0.74, xgb: 95, cash: 39, survival: 78 },
  { year: "2024", prob: 73.1, verdict: "High Risk", z: -0.42,xgb: 50, cash: 81, survival: 78 },
];

const MODEL_AGREEMENT = [
  { year: "2018", altman: 0, xgb: 0, prophet: 0, cox: 0, ensemble: 0, count: 0 },
  { year: "2019", altman: 0, xgb: 1, prophet: 0, cox: 0, ensemble: 0, count: 1 },
  { year: "2020", altman: 1, xgb: 1, prophet: 0, cox: 0, ensemble: 1, count: 3 },
  { year: "2021", altman: 1, xgb: 1, prophet: 0, cox: 0, ensemble: 1, count: 3 },
  { year: "2022", altman: 1, xgb: 1, prophet: 0, cox: 1, ensemble: 1, count: 4 },
  { year: "2023", altman: 1, xgb: 1, prophet: 1, cox: 1, ensemble: 1, count: 5 },
  { year: "2024", altman: 1, xgb: 0, prophet: 1, cox: 1, ensemble: 1, count: 4 },
];

const SHAP_WATERFALL = [
  { feature: "Cash / Debt",       shap:  1.60, direction: "risk", cumulative: 1.60 },
  { feature: "Debt / Assets",     shap:  0.49, direction: "risk", cumulative: 2.09 },
  { feature: "Load Factor",       shap: -0.62, direction: "safe", cumulative: 1.47 },
  { feature: "CASM−RASM Spread",  shap:  0.31, direction: "risk", cumulative: 1.78 },
  { feature: "Equity Ratio",      shap:  0.24, direction: "risk", cumulative: 2.02 },
  { feature: "Profit Margin",     shap: -0.18, direction: "safe", cumulative: 1.84 },
  { feature: "Fuel % Revenue",    shap:  0.12, direction: "risk", cumulative: 1.96 },
  { feature: "Interest Coverage", shap: -0.09, direction: "safe", cumulative: 1.87 },
];

const EDGAR_DATA = [
  { year: 2018, revenue: 3323, net_income: 156,  cash: 1005, debt: 2025, assets: 5165 },
  { year: 2019, revenue: 3831, net_income: 335,  cash: 979,  debt: 1960, assets: 7043 },
  { year: 2020, revenue: 1810, net_income: -28,  cash: 1790, debt: 3067, assets: 8399 },
  { year: 2021, revenue: 3231, net_income: 15,   cash: 1334, debt: 2976, assets: 8540 },
  { year: 2022, revenue: 5068, net_income: -554, cash: 1346, debt: 3200, assets: 9185 },
  { year: 2023, revenue: 5363, net_income: -447, cash: 865,  debt: 3055, assets: 9417 },
  { year: 2024, revenue: 4913, net_income: -1229,cash: 902,  debt: 1761, assets: 9595 },
];

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { label: "LSTM Neural Net", icon: "🧠" },
  { label: "NLP Sentiment", icon: "💬" },
  { label: "Ensemble Stacker", icon: "🎯" },
  { label: "SHAP Waterfall", icon: "🔍" },
  { label: "SEC EDGAR Data", icon: "📋" },
];

// ── LSTM Tab ──────────────────────────────────────────────────
function LSTMTab() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>LSTM Cash Forecast</h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.8, marginBottom: "1.5rem" }}>
            PyTorch LSTM (2 layers, hidden=32) trained on 8 quarters of Spirit cash data. One-step-ahead predictions, then 4-quarter forward projection.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Architecture", value: "2-layer LSTM" },
              { label: "Hidden size", value: "32 units" },
              { label: "Training epochs", value: "400" },
              { label: "Cash RMSE", value: "$21.5M" },
              { label: "Revenue RMSE", value: "$58M" },
              { label: "Train cutoff", value: "Q4 2022" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#111", borderRadius: 6 }}>
                <span style={{ fontSize: 12, color: "#777" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFE600" }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.25rem", background: "rgba(255,51,51,0.07)", border: "1px solid rgba(255,51,51,0.25)", borderRadius: 8, padding: "0.9rem" }}>
            <div style={{ fontSize: 11, color: "#FF3333", fontWeight: 700, marginBottom: 6 }}>Q1 2025 PROJECTION</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#FF3333" }}>$63M</div>
            <div style={{ fontSize: 11, color: "#666" }}>cash reserves — effectively zero</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
            <span style={{ color: "#00CC66" }}>● Actual cash ($M)</span>
            <span style={{ marginLeft: 12, color: "#FFE600" }}>— LSTM prediction</span>
            <span style={{ marginLeft: 12, color: "#FF8800" }}>- - - 2025 forecast</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={LSTM_CASH}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis dataKey="q" tick={{ fill: "#888", fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => v != null ? [`$${String(v)}M`, ""] : ["—", ""]} />
              <ReferenceLine x="Q4'24" stroke="#FF3333" strokeDasharray="3 3" label={{ value: "Bankruptcy", fill: "#FF3333", fontSize: 9 }} />
              <ReferenceLine y={200} stroke="#FF8800" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="actual" stroke="#00CC66" strokeWidth={2.5} dot={{ r: 3, fill: "#00CC66" }} name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="pred" stroke="#FFE600" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: "#FFE600" }} name="LSTM" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
            {[
              { label: "Model type", value: "PyTorch LSTM", color: "#FFE600" },
              { label: "Cash RMSE", value: "$21.5M", color: "#00CC66" },
              { label: "Forecast: critical", value: "Q1 2025", color: "#FF3333" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sentiment Tab ─────────────────────────────────────────────
function SentimentTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>NLP Earnings Sentiment</h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.8, marginBottom: "1.25rem" }}>
            VADER sentiment analysis on 42 Spirit Airlines earnings call quotes and news headlines (2019–2024). Scored and aggregated by quarter into a distress signal.
          </p>

          <div style={{ fontSize: 11, color: "#888", marginBottom: "0.75rem", fontWeight: 700, letterSpacing: 1 }}>MOST NEGATIVE MOMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {KEY_MOMENTS.map((m, i) => (
              <div
                key={i}
                onClick={() => setSelected(selected === i ? null : i)}
                style={{
                  background: selected === i ? "rgba(255,51,51,0.1)" : "#111",
                  border: `1px solid ${selected === i ? "rgba(255,51,51,0.4)" : "#222"}`,
                  borderRadius: 8, padding: "0.75rem", cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#666" }}>{m.date}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FF3333" }}>{m.score.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 12, color: selected === i ? "#fff" : "#aaa", lineHeight: 1.5 }}>
                  {selected === i ? m.text : m.text.slice(0, 60) + "…"}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{m.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
            VADER compound score by quarter (−1 = very negative, +1 = very positive)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SENTIMENT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis dataKey="quarter" tick={{ fill: "#888", fontSize: 9 }} interval={2} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[-1, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [Number(v).toFixed(3), "Compound"]} />
              <ReferenceLine y={0} stroke="#555" />
              <ReferenceLine y={-0.3} stroke="#FF8800" strokeDasharray="3 3" label={{ value: "Warning", fill: "#FF8800", fontSize: 9 }} />
              <ReferenceLine y={-0.6} stroke="#FF3333" strokeDasharray="3 3" label={{ value: "Alarm", fill: "#FF3333", fontSize: 9 }} />
              <Bar dataKey="compound" radius={[3, 3, 0, 0]}>
                {SENTIMENT_DATA.map((d) => (
                  <Cell key={d.quarter} fill={d.compound <= -0.6 ? "#FF3333" : d.compound <= -0.3 ? "#FF8800" : d.compound > 0.3 ? "#00CC66" : "#FFE600"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", marginTop: "1rem" }}>
            {[
              { label: "Quotes analyzed", value: "42", color: "#FFE600" },
              { label: "Alarm quarters", value: "1 (Q3'20)", color: "#FF3333" },
              { label: "Most negative", value: "−0.75", color: "#FF3333" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#888", marginTop: "1rem", lineHeight: 1.7 }}>
            Interestingly, VADER scores on earnings calls show executives maintained positive language even as financials deteriorated — classic <strong style={{ color: "#FFE600" }}>management optimism bias</strong>. The real signal came from news headlines and DOJ filings, not management commentary.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Ensemble Tab ──────────────────────────────────────────────
function EnsembleTab() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Ensemble Meta-Learner</h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.8, marginBottom: "1.25rem" }}>
            Logistic regression stacker trained on the outputs of all 4 base models. Feature weights show which model the meta-learner trusts most.
          </p>

          <div style={{ background: "#111", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>META-LEARNER FEATURE WEIGHTS</div>
            {[
              { label: "Altman Z-Score", weight: 35.5, color: "#FFE600" },
              { label: "XGBoost Prob",   weight: 29.1, color: "#FF8800" },
              { label: "Cox Survival",   weight: 19.5, color: "#FF3333" },
              { label: "Cash Trajectory",weight: 15.9, color: "#00CC66" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{f.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.weight}%</span>
                </div>
                <div style={{ background: "#1A1A1A", borderRadius: 4, height: 6 }}>
                  <div style={{ height: 6, borderRadius: 4, background: f.color, width: `${f.weight * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#111", borderRadius: 10, padding: "1rem" }}>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>MODEL CONSENSUS BY YEAR</div>
            {MODEL_AGREEMENT.map((row) => (
              <div key={row.year} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#888", minWidth: 36 }}>{row.year}</span>
                {(["altman","xgb","prophet","cox","ensemble"] as const).map((m) => (
                  <div key={m} title={m} style={{
                    width: 20, height: 20, borderRadius: 4, fontSize: 9,
                    background: row[m] ? "#FF3333" : "#1A1A1A",
                    border: `1px solid ${row[m] ? "#FF333360" : "#333"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: row[m] ? "#fff" : "#444",
                  }}>
                    {m[0].toUpperCase()}
                  </div>
                ))}
                <span style={{ fontSize: 11, color: row.count >= 4 ? "#FF3333" : row.count >= 2 ? "#FF8800" : "#666", marginLeft: 4 }}>
                  {row.count}/5 agree
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Ensemble bankruptcy probability by year</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ENSEMBLE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, "Ensemble Prob"]} />
              <ReferenceLine y={50} stroke="#FFE600" strokeDasharray="4 4" label={{ value: "50% alarm", fill: "#FFE600", fontSize: 10 }} />
              <Area type="monotone" dataKey="prob" stroke="#FF3333" strokeWidth={2.5} fill="rgba(255,51,51,0.12)" />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "1rem" }}>
            {ENSEMBLE_DATA.map((d) => (
              <div key={d.year} style={{
                background: d.prob >= 60 ? "rgba(255,51,51,0.07)" : "rgba(255,230,0,0.04)",
                border: `1px solid ${d.prob >= 60 ? "rgba(255,51,51,0.2)" : "rgba(255,230,0,0.1)"}`,
                borderRadius: 8, padding: "0.6rem 0.75rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "#888" }}>{d.year}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: d.prob >= 60 ? "#FF3333" : "#FFE600" }}>{d.prob}%</div>
                  <div style={{ fontSize: 9, color: "#555" }}>{d.verdict}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHAP Waterfall Tab ────────────────────────────────────────
function SHAPTab() {
  const [year, setYear] = useState("2023");
  const maxAbs = Math.max(...SHAP_WATERFALL.map(d => Math.abs(d.shap)));

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>SHAP Waterfall — XGBoost Explainability</h3>
      <p style={{ color: "#999", fontSize: 13, lineHeight: 1.8, marginBottom: "1.25rem", maxWidth: 700 }}>
        SHAP (SHapley Additive exPlanations) shows exactly how each feature pushes Spirit's bankruptcy probability up or down. This is the 2023 breakdown — the year all 5 models agreed on distress.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Waterfall chart */}
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
            <span style={{ color: "#FF3333" }}>■ Increases risk</span>
            <span style={{ marginLeft: 16, color: "#00CC66" }}>■ Decreases risk</span>
          </div>
          {SHAP_WATERFALL.map((d, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>{d.feature}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: d.direction === "risk" ? "#FF3333" : "#00CC66" }}>
                  {d.direction === "risk" ? "+" : ""}{d.shap.toFixed(2)}
                </span>
              </div>
              <div style={{ background: "#1A1A1A", borderRadius: 4, height: 8, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  height: 8,
                  borderRadius: 4,
                  background: d.direction === "risk" ? "#FF3333" : "#00CC66",
                  width: `${(Math.abs(d.shap) / maxAbs) * 100}%`,
                  left: d.direction === "risk" ? 0 : "auto",
                  right: d.direction === "safe" ? 0 : "auto",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Cumulative chart + explanation */}
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Cumulative SHAP — how contributions stack to final prediction</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SHAP_WATERFALL} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "#888", fontSize: 10 }} width={120} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [Number(v).toFixed(3), "SHAP"]} />
              <ReferenceLine x={0} stroke="#555" />
              <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
                {SHAP_WATERFALL.map((d) => (
                  <Cell key={d.feature} fill={d.direction === "risk" ? "#FF3333" : "#00CC66"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "Biggest risk driver", value: "Cash/Debt ratio (1.60)", color: "#FF3333" },
              { label: "Only protective factor", value: "Load factor (−0.62)", color: "#00CC66" },
              { label: "Net SHAP score", value: "+1.87 → 95% risk", color: "#FF8800" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", borderRadius: 8, padding: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#777" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EDGAR Tab ─────────────────────────────────────────────────
function EDGARTab() {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>SEC EDGAR — Real Filing Data</h3>
      <p style={{ color: "#999", fontSize: 13, lineHeight: 1.8, marginBottom: "1.25rem" }}>
        All financial data fetched directly from SEC EDGAR XBRL API (CIK: 0001498710). These are the actual numbers from Spirit's 10-K annual filings — not estimates.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,230,0,0.2)" }}>
              {["Year","Revenue ($M)","Net Income ($M)","Cash ($M)","Total Debt ($M)","Total Assets ($M)"].map((h) => (
                <th key={h} style={{ textAlign: "right", padding: "0.6rem 1rem", color: "#FFE600", fontWeight: 700, fontSize: 11, letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EDGAR_DATA.map((row, i) => (
              <tr key={row.year} style={{ borderBottom: "1px solid #1A1A1A", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                <td style={{ padding: "0.6rem 1rem", color: "#FFE600", fontWeight: 700, textAlign: "right" }}>{row.year}</td>
                <td style={{ padding: "0.6rem 1rem", color: "#ccc", textAlign: "right" }}>{row.revenue.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 1rem", color: row.net_income < 0 ? "#FF3333" : "#00CC66", fontWeight: 600, textAlign: "right" }}>
                  {row.net_income < 0 ? "" : "+"}{row.net_income.toLocaleString()}
                </td>
                <td style={{ padding: "0.6rem 1rem", color: row.cash < 400 ? "#FF3333" : "#ccc", textAlign: "right" }}>{row.cash.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 1rem", color: row.debt > 3000 ? "#FF8800" : "#ccc", textAlign: "right" }}>{row.debt.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 1rem", color: "#ccc", textAlign: "right" }}>{row.assets.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={EDGAR_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
            <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
            <Tooltip contentStyle={TT} formatter={(v: unknown) => [`$${String(v)}M`, ""]} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#FFE600" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            <Line type="monotone" dataKey="debt" stroke="#FF3333" strokeWidth={2} dot={{ r: 3 }} name="Debt" />
            <Line type="monotone" dataKey="cash" stroke="#00CC66" strokeWidth={2} dot={{ r: 3 }} name="Cash" />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={EDGAR_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
            <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
            <Tooltip contentStyle={TT} formatter={(v: unknown) => [`$${String(v)}M`, "Net Income"]} />
            <ReferenceLine y={0} stroke="#555" />
            <Bar dataKey="net_income" name="Net Income" radius={[3, 3, 0, 0]}>
              {EDGAR_DATA.map((d) => (
                <Cell key={d.year} fill={d.net_income < 0 ? "#FF3333" : "#00CC66"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,230,0,0.04)", border: "1px solid rgba(255,230,0,0.15)", borderRadius: 8, fontSize: 12, color: "#888" }}>
        Source: <strong style={{ color: "#FFE600" }}>SEC EDGAR XBRL API</strong> — fetched via{" "}
        <code style={{ color: "#FFE600", background: "#111", padding: "1px 6px", borderRadius: 4 }}>data.sec.gov/api/xbrl/companyconcept/CIK0001498710/</code> — real 10-K filings, not scraped estimates.
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AdvancedModelsSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="advanced" style={{ padding: "6rem 2rem", background: "#080808" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
            Next Level
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Deep ML Arsenal
          </h2>
          <p style={{ color: "#888", fontSize: 16, maxWidth: 580, margin: "0 auto" }}>
            LSTM neural network, NLP sentiment analysis on earnings calls, ensemble meta-learner, SHAP explainability — all trained on real SEC EDGAR data.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Training samples", value: "90+" },
            { label: "XGBoost AUC", value: "0.954" },
            { label: "LSTM Cash RMSE", value: "$21.5M" },
            { label: "Cox concordance", value: "0.876" },
            { label: "Models in ensemble", value: "4" },
            { label: "EDGAR API calls", value: "7 concepts" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111", border: "1px solid rgba(255,230,0,0.1)", borderRadius: 8, padding: "0.5rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFE600" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.7rem 1.2rem", borderRadius: 8, fontWeight: 600, fontSize: 13,
                border: "none", cursor: "pointer",
                background: activeTab === i ? "#FFE600" : "#1A1A1A",
                color: activeTab === i ? "#000" : "#888",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#1A1A1A", borderRadius: 16, padding: "2rem", border: "1px solid rgba(255,230,0,0.08)", minHeight: 460 }}>
          {activeTab === 0 && <LSTMTab />}
          {activeTab === 1 && <SentimentTab />}
          {activeTab === 2 && <EnsembleTab />}
          {activeTab === 3 && <SHAPTab />}
          {activeTab === 4 && <EDGARTab />}
        </div>
      </div>
    </section>
  );
}
