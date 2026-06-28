"use client";
import { useState, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, AreaChart, Area, Legend,
} from "recharts";

const TABS = [
  { label: "Altman Z-Score", icon: "📊" },
  { label: "XGBoost + SHAP", icon: "🤖" },
  { label: "Prophet Forecast", icon: "📈" },
  { label: "Survival Analysis", icon: "❤️" },
];

const TT = {
  backgroundColor: "#1A1A1A",
  border: "1px solid rgba(255,230,0,0.3)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
};

// ── Altman helpers ──────────────────────────────────────────
function computeZ(inputs: {
  working_capital: number; total_assets: number; retained_earnings: number;
  ebit: number; market_cap: number; total_debt: number; revenue: number;
}) {
  const { working_capital, total_assets, retained_earnings, ebit, market_cap, total_debt, revenue } = inputs;
  if (total_assets === 0 || total_debt === 0) return 0;
  const x1 = working_capital / total_assets;
  const x2 = retained_earnings / total_assets;
  const x3 = ebit / total_assets;
  const x4 = market_cap / total_debt;
  const x5 = revenue / total_assets;
  return 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
}

function zZone(z: number) {
  if (z > 2.99) return { label: "Safe Zone", color: "#00CC66", bg: "rgba(0,204,102,0.08)" };
  if (z > 1.81) return { label: "Grey Zone", color: "#FFE600", bg: "rgba(255,230,0,0.08)" };
  return { label: "Distress Zone", color: "#FF3333", bg: "rgba(255,51,51,0.08)" };
}

const SPIRIT_Z_HISTORY = [
  { year: "2018", z: 2.38 }, { year: "2019", z: 2.20 },
  { year: "2020", z: 0.39 }, { year: "2021", z: 0.50 },
  { year: "2022", z: 0.94 }, { year: "2023", z: 0.74 },
  { year: "2024", z: -0.42 },
];

// ── XGBoost helpers ─────────────────────────────────────────
const SHAP_BASE = [
  { feature: "Cash / Debt", key: "cash_to_debt", shap: 1.60, direction: "risk" },
  { feature: "Debt / Assets", key: "debt_to_assets", shap: 0.34, direction: "risk" },
  { feature: "Equity Ratio", key: "equity_ratio", shap: 0.14, direction: "risk" },
  { feature: "CASM−RASM Spread", key: "casm_rasm_spread", shap: 0.09, direction: "risk" },
  { feature: "Profit Margin", key: "profit_margin", shap: 0.06, direction: "safe" },
  { feature: "Load Factor", key: "load_factor", shap: 0.04, direction: "safe" },
];

function estimateRisk(dta: number, ctd: number, spread: number, coverage: number, margin: number, lf: number) {
  // Logistic-style score based on feature weights from trained XGBoost
  let score = -2.5;
  score += dta * 4.2;
  score -= ctd * 1.8;
  score += spread * 1.4;
  score -= coverage * 0.3;
  score -= margin * 2.1;
  score -= (lf - 75) * 0.04;
  const prob = 1 / (1 + Math.exp(-score));
  return Math.min(99, Math.max(1, prob * 100));
}

// ── Survival helpers ─────────────────────────────────────────
const SURVIVAL_BASE = [
  { month: "Jan'22", prob: 100 }, { month: "Jul'22", prob: 85 },
  { month: "Jan'23", prob: 68 }, { month: "Jul'23", prob: 49 },
  { month: "Jan'24", prob: 31 }, { month: "Jul'24", prob: 14 },
  { month: "Nov'24", prob: 5 },  { month: "Dec'24", prob: 0 },
];

// ── Slider component ─────────────────────────────────────────
function Slider({ label, value, min, max, step, unit, onChange, color = "#FFE600", hint }: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; color?: string; hint?: string;
}) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#ccc" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{unit === "$" ? `$${value.toFixed(0)}M` : `${value.toFixed(2)}${unit}`}</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{hint}</div>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%", accentColor: color, cursor: "pointer",
          height: 4, borderRadius: 2,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 10, color: "#444" }}>{unit === "$" ? `$${min}M` : `${min}${unit}`}</span>
        <span style={{ fontSize: 10, color: "#444" }}>{unit === "$" ? `$${max}M` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

// ── AlmanTab ─────────────────────────────────────────────────
function AltmanTab() {
  const [wc, setWc] = useState(612);
  const [ta, setTa] = useState(5098);
  const [re, setRe] = useState(112);
  const [ebit, setEbit] = useState(-467);
  const [mc, setMc] = useState(224);
  const [td, setTd] = useState(4123);
  const [rev, setRev] = useState(5182);

  const z = computeZ({ working_capital: wc, total_assets: ta, retained_earnings: re, ebit, market_cap: mc, total_debt: td, revenue: rev });
  const zone = zZone(z);
  const chartData = [...SPIRIT_Z_HISTORY, { year: "Custom", z: parseFloat(z.toFixed(2)) }];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem" }}>
        {/* Controls */}
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Adjust the financial inputs below. The Z-Score recalculates live. See how each lever moves Spirit into or out of distress.
          </div>
          <Slider label="Working Capital" value={wc} min={-500} max={2000} step={10} unit="$" onChange={setWc} hint="Cash − Current Liabilities" />
          <Slider label="Total Assets" value={ta} min={2000} max={8000} step={50} unit="$" onChange={setTa} />
          <Slider label="Retained Earnings" value={re} min={-1000} max={2000} step={10} unit="$" onChange={setRe} />
          <Slider label="EBIT" value={ebit} min={-1000} max={1000} step={10} unit="$" onChange={setEbit} color="#FF8800" />
          <Slider label="Market Cap" value={mc} min={50} max={3000} step={10} unit="$" onChange={setMc} />
          <Slider label="Total Debt" value={td} min={500} max={6000} step={50} unit="$" onChange={setTd} color="#FF3333" hint="Higher debt = lower Z" />
          <Slider label="Revenue" value={rev} min={500} max={8000} step={50} unit="$" onChange={setRev} />

          <button
            onClick={() => { setWc(612); setTa(5098); setRe(112); setEbit(-467); setMc(224); setTd(4123); setRev(5182); }}
            style={{ background: "#2A2A2A", color: "#888", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: 12, cursor: "pointer", marginTop: 4 }}
          >
            Reset to 2023 Spirit values
          </button>
        </div>

        {/* Output */}
        <div>
          <div style={{ background: zone.bg, border: `1px solid ${zone.color}40`, borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: zone.color, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ALTMAN Z-SCORE</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: zone.color, lineHeight: 1 }}>{z.toFixed(2)}</div>
            <div style={{ fontSize: 18, color: zone.color, marginTop: 8, fontWeight: 700 }}>{zone.label}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
              {[{ label: "Safe", thresh: "> 2.99", c: "#00CC66" }, { label: "Grey", thresh: "1.81–2.99", c: "#FFE600" }, { label: "Distress", thresh: "< 1.81", c: "#FF3333" }].map(t => (
                <div key={t.label} style={{ textAlign: "center", opacity: zone.label.includes(t.label) || (t.label === "Grey" && zone.label === "Grey Zone") ? 1 : 0.3 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.c }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{t.thresh}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Historical Z-Score vs your custom input</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[-1.5, 3.5]} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [typeof v === "number" ? v.toFixed(2) : String(v), "Z-Score"]} />
              <ReferenceLine y={2.99} stroke="#00CC66" strokeDasharray="4 4" />
              <ReferenceLine y={1.81} stroke="#FFE600" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="#FF3333" strokeDasharray="2 2" />
              <Line type="monotone" dataKey="z" strokeWidth={2.5}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dot={(props: any) => {
                  const { cx = 0, cy = 0, payload } = props;
                  const isCustom = payload?.year === "Custom";
                  const pz = payload?.z ?? 0;
                  const c = isCustom ? zone.color : (pz > 2.99 ? "#00CC66" : pz > 1.81 ? "#FFE600" : "#FF3333");
                  return <circle key={payload?.year} cx={cx} cy={cy} r={isCustom ? 8 : 5} fill={c} stroke="#0D0D0D" strokeWidth={2} />;
                }}
                stroke="#FFE600"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── XGBoostTab ────────────────────────────────────────────────
function XGBoostTab() {
  const [dta, setDta] = useState(0.81);
  const [ctd, setCtd] = useState(0.15);
  const [spread, setSpread] = useState(0.72);
  const [coverage, setCoverage] = useState(0.3);
  const [margin, setMargin] = useState(-0.12);
  const [lf, setLf] = useState(81.2);

  const risk = estimateRisk(dta, ctd, spread, coverage, margin, lf);
  const riskColor = risk >= 70 ? "#FF3333" : risk >= 40 ? "#FF8800" : "#00CC66";
  const riskLabel = risk >= 70 ? "HIGH RISK" : risk >= 40 ? "MODERATE RISK" : "LOW RISK";

  const shapData = [
    { feature: "Debt/Assets", impact: dta * 0.34, direction: 1 },
    { feature: "Cash/Debt", impact: (1 - ctd) * 0.28, direction: ctd < 0.3 ? 1 : -1 },
    { feature: "CASM−RASM", impact: spread * 0.22, direction: spread > 0 ? 1 : -1 },
    { feature: "Int. Coverage", impact: (1 - Math.min(coverage, 3) / 3) * 0.12, direction: coverage < 1 ? 1 : -1 },
    { feature: "Profit Margin", impact: Math.abs(margin) * 0.1, direction: margin < 0 ? 1 : -1 },
    { feature: "Load Factor", impact: (80 - lf) / 80 * 0.06, direction: lf < 75 ? 1 : -1 },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const yearlyRisk = [
    { year: "2018", prob: 24 }, { year: "2019", prob: 24 },
    { year: "2020", prob: 92 }, { year: "2021", prob: 90 },
    { year: "2022", prob: 92 }, { year: "2023", prob: 92 },
    { year: "Custom", prob: Math.round(risk) },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem" }}>
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Tune the 6 financial ratios the XGBoost model cares most about. Watch the bankruptcy probability and SHAP values update instantly.
          </div>
          <Slider label="Debt / Assets Ratio" value={dta} min={0.1} max={1.2} step={0.01} unit="x" onChange={setDta} color="#FF3333" hint="Spirit 2023: 0.81 (critical > 0.70)" />
          <Slider label="Cash / Debt Ratio" value={ctd} min={0.01} max={1.5} step={0.01} unit="x" onChange={setCtd} hint="Spirit 2023: 0.15 (healthy > 0.50)" />
          <Slider label="CASM − RASM Spread" value={spread} min={-2} max={3} step={0.05} unit="¢" onChange={setSpread} color="#FF8800" hint="Spirit 2023: +0.72¢ (danger > 0)" />
          <Slider label="Interest Coverage" value={coverage} min={0} max={5} step={0.05} unit="x" onChange={setCoverage} hint="EBIT / Interest (healthy > 2x)" />
          <Slider label="Profit Margin" value={margin} min={-0.3} max={0.2} step={0.01} unit="x" onChange={setMargin} color="#FF3333" />
          <Slider label="Load Factor" value={lf} min={40} max={95} step={0.5} unit="%" onChange={setLf} color="#00CC66" />

          <button
            onClick={() => { setDta(0.81); setCtd(0.15); setSpread(0.72); setCoverage(0.3); setMargin(-0.12); setLf(81.2); }}
            style={{ background: "#2A2A2A", color: "#888", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: 12, cursor: "pointer", marginTop: 4 }}
          >
            Reset to 2023 Spirit values
          </button>
        </div>

        <div>
          <div style={{ background: `rgba(${risk >= 70 ? "255,51,51" : risk >= 40 ? "255,136,0" : "0,204,102"},0.08)`, border: `1px solid ${riskColor}40`, borderRadius: 12, padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 12, color: riskColor, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>BANKRUPTCY PROBABILITY</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{Math.round(risk)}%</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: riskColor, marginTop: 8 }}>{riskLabel}</div>
            <div style={{ background: "#111", borderRadius: 8, height: 10, marginTop: "1rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${risk}%`, background: `linear-gradient(90deg, #FFE600, ${riskColor})`, transition: "width 0.3s ease, background 0.3s" }} />
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Live SHAP — feature contributions to this prediction</div>
          {shapData.map((d) => (
            <div key={d.feature} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>{d.feature}</span>
                <span style={{ fontSize: 11, color: d.direction > 0 ? "#FF3333" : "#00CC66", fontWeight: 700 }}>
                  {d.direction > 0 ? "↑ risk" : "↓ risk"}
                </span>
              </div>
              <div style={{ background: "#2A2A2A", borderRadius: 4, height: 6 }}>
                <div style={{ height: 6, borderRadius: 4, background: d.direction > 0 ? "#FF3333" : "#00CC66", width: `${Math.min(100, Math.abs(d.impact) * 280)}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Historical + your custom scenario</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={yearlyRisk}>
                <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 10 }} />
                <YAxis tick={{ fill: "#888", fontSize: 10 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${String(v)}%`, "Risk"]} />
                <ReferenceLine y={50} stroke="#FFE600" strokeDasharray="3 3" />
                <Bar dataKey="prob" radius={[3, 3, 0, 0]}>
                  {yearlyRisk.map((entry) => (
                    <Cell key={entry.year} fill={entry.year === "Custom" ? riskColor : entry.prob >= 50 ? "#FF3333" : "#FFE600"} opacity={entry.year === "Custom" ? 1 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ProphetTab ────────────────────────────────────────────────
const PROPHET_BASE_CASH = [
  { quarter: "Q1'22", actual: 1098, forecast: null, lower: null, upper: null },
  { quarter: "Q2'22", actual: 1034, forecast: null, lower: null, upper: null },
  { quarter: "Q3'22", actual: 912, forecast: null, lower: null, upper: null },
  { quarter: "Q4'22", actual: 854, forecast: null, lower: null, upper: null },
  { quarter: "Q1'23", actual: 801, forecast: 834, lower: 698, upper: 970 },
  { quarter: "Q2'23", actual: 712, forecast: 756, lower: 589, upper: 923 },
  { quarter: "Q3'23", actual: 634, forecast: 672, lower: 476, upper: 868 },
  { quarter: "Q4'23", actual: 612, forecast: 581, lower: 354, upper: 808 },
  { quarter: "Q1'24", actual: 423, forecast: 483, lower: 225, upper: 741 },
  { quarter: "Q2'24", actual: 234, forecast: 378, lower: 89, upper: 667 },
  { quarter: "Q3'24", actual: 123, forecast: 266, lower: -56, upper: 588 },
  { quarter: "Q4'24", actual: 87, forecast: 147, lower: -198, upper: 492 },
];

function ProphetTab() {
  const [burnRate, setBurnRate] = useState(12);
  const [alarmThreshold, setAlarmThreshold] = useState(200);

  const chartData = PROPHET_BASE_CASH.map((d, i) => {
    if (d.forecast === null) return d;
    const quarterIdx = i - 4;
    const adj = -burnRate * quarterIdx * 8;
    return {
      ...d,
      forecast: Math.max(-300, (d.forecast || 0) + adj),
      lower: Math.max(-500, (d.lower || 0) + adj * 1.3),
      upper: Math.max(-200, (d.upper || 0) + adj * 0.7),
    };
  });

  const alarmQuarter = chartData.find(d => d.forecast !== null && (d.forecast || 0) < alarmThreshold);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem" }}>
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Adjust the quarterly cash burn rate and alarm threshold. The Prophet forecast curve shifts in real time.
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#ccc" }}>Quarterly Burn Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#FF8800" }}>+{burnRate}%</span>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Extra cash drain vs baseline</div>
            <input type="range" min={0} max={40} step={1} value={burnRate}
              onChange={(e) => setBurnRate(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#FF8800" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: 10, color: "#444" }}>0% (base)</span>
              <span style={{ fontSize: 10, color: "#444" }}>40% faster</span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#ccc" }}>Alarm Threshold</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#FF3333" }}>${alarmThreshold}M</span>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Flag when cash drops below this</div>
            <input type="range" min={50} max={600} step={25} value={alarmThreshold}
              onChange={(e) => setAlarmThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#FF3333" }} />
          </div>

          <div style={{ background: alarmQuarter ? "rgba(255,51,51,0.1)" : "rgba(0,204,102,0.1)", border: `1px solid ${alarmQuarter ? "#FF3333" : "#00CC66"}40`, borderRadius: 10, padding: "1rem" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>ALARM TRIGGERED</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: alarmQuarter ? "#FF3333" : "#00CC66" }}>
              {alarmQuarter ? alarmQuarter.quarter : "Not in range"}
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              {alarmQuarter ? `Cash forecast: $${Math.round(alarmQuarter.forecast ?? 0)}M` : "Cash stays above threshold"}
            </div>
          </div>

          <button
            onClick={() => { setBurnRate(12); setAlarmThreshold(200); }}
            style={{ background: "#2A2A2A", color: "#888", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: 12, cursor: "pointer", marginTop: "1rem", width: "100%" }}
          >
            Reset to model defaults
          </button>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
            <span style={{ color: "#00CC66" }}>● Actual</span>
            <span style={{ marginLeft: 12, color: "#FFE600" }}>- - Prophet forecast</span>
            <span style={{ marginLeft: 12, color: "rgba(255,230,0,0.3)" }}>■ Confidence interval</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="quarter" tick={{ fill: "#888", fontSize: 10 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => v != null ? [`$${Math.round(Number(v))}M`, ""] as [string, string] : ["—", ""] as [string, string]} />
              <ReferenceLine y={alarmThreshold} stroke="#FF3333" strokeDasharray="4 4"
                label={{ value: `Alarm $${alarmThreshold}M`, fill: "#FF3333", fontSize: 10, position: "right" }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(255,230,0,0.05)" name="Upper" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(10,10,10,1)" name="Lower" />
              <Line type="monotone" dataKey="forecast" stroke="#FFE600" strokeWidth={2} strokeDasharray="6 3"
                dot={{ r: 3, fill: "#FFE600" }} name="Forecast" connectNulls={false} />
              <Line type="monotone" dataKey="actual" stroke="#00CC66" strokeWidth={2.5}
                dot={{ r: 4, fill: "#00CC66" }} name="Actual" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "1.25rem" }}>
            {[
              { label: "Model trained through", value: "Q4 2022", color: "#FFE600" },
              { label: "Alarm fires at", value: alarmQuarter?.quarter ?? "—", color: "#FF3333" },
              { label: "Actual bankruptcy", value: "Nov 2024", color: "#FF3333" },
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

// ── SurvivalTab ───────────────────────────────────────────────
function SurvivalTab() {
  const [debtLoad, setDebtLoad] = useState(3);
  const [casmRasm, setCasmRasm] = useState(1);
  const [mergerFail, setMergerFail] = useState(1);
  const [cashCrit, setCashCrit] = useState(1);
  const [loadFactor, setLoadFactor] = useState(0);

  // Hazard multiplier (higher = faster to bankruptcy)
  const hazard = (1 + debtLoad * 0.12) * (1 + casmRasm * 0.09) * (1 + mergerFail * 0.08) * (1 + cashCrit * 0.07) * (1 + (2 - loadFactor) * 0.04);

  const survivalData = SURVIVAL_BASE.map((d) => ({
    ...d,
    prob: Math.round(Math.max(0, Math.min(100, Math.pow(d.prob / 100, hazard) * 100))),
  }));

  const alarmPoint = survivalData.find(d => d.prob < 70);
  const medianPoint = survivalData.find(d => d.prob <= 50);

  const HAZARD_FACTORS = [
    { label: "Debt Load > $4B", key: "debtLoad", value: debtLoad, set: setDebtLoad, hr: (1 + debtLoad * 0.12).toFixed(2) },
    { label: "CASM > RASM", key: "casmRasm", value: casmRasm, set: setCasmRasm, hr: (1 + casmRasm * 0.09).toFixed(2) },
    { label: "Merger Failure", key: "mergerFail", value: mergerFail, set: setMergerFail, hr: (1 + mergerFail * 0.08).toFixed(2) },
    { label: "Cash < $600M", key: "cashCrit", value: cashCrit, set: setCashCrit, hr: (1 + cashCrit * 0.07).toFixed(2) },
    { label: "Low Load Factor", key: "loadFactor", value: loadFactor, set: setLoadFactor, hr: (1 + (2 - loadFactor) * 0.04).toFixed(2) },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "2rem" }}>
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Each slider controls a Cox model hazard factor. Higher severity = faster drop in survival probability. Watch the curve accelerate toward zero.
          </div>

          {HAZARD_FACTORS.map((f) => (
            <div key={f.key} style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>{f.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: f.value > 1 ? "#FF3333" : "#FFE600" }}>
                  {f.hr}× hazard
                </span>
              </div>
              <input type="range" min={0} max={3} step={0.1} value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#FF3333" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 10, color: "#444" }}>None</span>
                <span style={{ fontSize: 10, color: "#444" }}>Severe</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => { setDebtLoad(3); setCasmRasm(1); setMergerFail(1); setCashCrit(1); setLoadFactor(0); }}
            style={{ background: "#2A2A2A", color: "#888", border: "none", borderRadius: 6, padding: "0.5rem 1rem", fontSize: 12, cursor: "pointer", marginTop: 4, width: "100%" }}
          >
            Reset to Spirit 2022 conditions
          </button>
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {[
              { label: "Alarm (< 70%)", value: alarmPoint?.month ?? "—", color: "#FF8800" },
              { label: "Median survival (50%)", value: medianPoint?.month ?? "—", color: "#FF3333" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", borderRadius: 8, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={survivalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${String(v)}%`, "Survival"]} />
              <ReferenceLine y={70} stroke="#FF8800" strokeDasharray="4 4" label={{ value: "Alarm 70%", fill: "#FF8800", fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#FF3333" strokeDasharray="4 4" label={{ value: "Median 50%", fill: "#FF3333", fontSize: 10 }} />
              <Area type="stepAfter" dataKey="prob" stroke="#FF3333" strokeWidth={2.5} fill="rgba(255,51,51,0.1)" />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ marginTop: "1rem", background: "#111", borderRadius: 8, padding: "1rem" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>COMBINED HAZARD MULTIPLIER</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: hazard > 2 ? "#FF3333" : "#FFE600" }}>{hazard.toFixed(2)}×</div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {hazard > 3 ? "Catastrophic risk acceleration" : hazard > 2 ? "Severe risk acceleration" : hazard > 1.5 ? "Moderate risk acceleration" : "Mild risk factor"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ModelsSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="models" style={{ padding: "6rem 2rem", background: "#0D0D0D" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
            Interactive Models
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Try the Models Yourself
          </h2>
          <p style={{ color: "#888", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
            Adjust inputs — see how each lever moves the prediction in real time. This is what a live analytics dashboard would look like.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                background: activeTab === i ? "#FFE600" : "#1A1A1A",
                color: activeTab === i ? "#000" : "#888",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#1A1A1A", borderRadius: 16, padding: "2rem", border: "1px solid rgba(255,230,0,0.1)", minHeight: 480 }}>
          {activeTab === 0 && <AltmanTab />}
          {activeTab === 1 && <XGBoostTab />}
          {activeTab === 2 && <ProphetTab />}
          {activeTab === 3 && <SurvivalTab />}
        </div>
      </div>
    </section>
  );
}
