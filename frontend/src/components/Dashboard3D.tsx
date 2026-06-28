"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

// Three.js imports are heavy — load only client-side
const AirplaneScene = dynamic(() => import("@/components/AirplaneScene"), { ssr: false });

const TT = {
  backgroundColor: "#0A0A0A",
  border: "1px solid rgba(255,230,0,0.3)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

const Z_DATA = [
  { year: "2018", z: 2.38 }, { year: "2019", z: 2.20 },
  { year: "2020", z: 0.39 }, { year: "2021", z: 0.50 },
  { year: "2022", z: 0.94 }, { year: "2023", z: 0.74 }, { year: "2024", z: -0.42 },
];

const CASH_DATA = [
  { q: "Q1'22", cash: 1098 }, { q: "Q2'22", cash: 1034 },
  { q: "Q3'22", cash: 912 }, { q: "Q4'22", cash: 854 },
  { q: "Q1'23", cash: 801 }, { q: "Q2'23", cash: 712 },
  { q: "Q3'23", cash: 634 }, { q: "Q4'23", cash: 612 },
  { q: "Q1'24", cash: 423 }, { q: "Q2'24", cash: 234 },
  { q: "Q3'24", cash: 123 }, { q: "Q4'24", cash: 87 },
];

const RISK_DATA = [
  { year: "2018", prob: 24 }, { year: "2019", prob: 24 },
  { year: "2020", prob: 92 }, { year: "2021", prob: 90 },
  { year: "2022", prob: 92 }, { year: "2023", prob: 92 },
];

const SURVIVAL_DATA = [
  { m: "Jan'22", p: 100 }, { m: "Jul'22", p: 85 },
  { m: "Jan'23", p: 68 }, { m: "Jul'23", p: 49 },
  { m: "Jan'24", p: 31 }, { m: "Jul'24", p: 14 },
  { m: "Nov'24", p: 5 }, { m: "Dec'24", p: 0 },
];

const KPIS = [
  { label: "Z-Score (2023)", value: "0.74", unit: "", status: "critical", sub: "Distress zone" },
  { label: "Bankruptcy Risk", value: "92", unit: "%", status: "critical", sub: "XGBoost model" },
  { label: "Peak Debt", value: "$4.3B", unit: "", status: "critical", sub: "2024 filing" },
  { label: "Cash Left", value: "$87M", unit: "", status: "critical", sub: "At bankruptcy" },
  { label: "Load Factor", value: "81.2", unit: "%", status: "warn", sub: "2023 avg" },
  { label: "Survival (Jan'24)", value: "31", unit: "%", status: "critical", sub: "Cox model" },
];

function StatusDot({ status }: { status: string }) {
  const c = status === "critical" ? "#FF3333" : status === "warn" ? "#FF8800" : "#00CC66";
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, marginRight: 6 }} />
  );
}

function KpiCard({ kpi }: { kpi: typeof KPIS[0] }) {
  const [hov, setHov] = useState(false);
  const c = kpi.status === "critical" ? "#FF3333" : kpi.status === "warn" ? "#FF8800" : "#00CC66";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#222" : "#141414",
        border: `1px solid ${hov ? c : c + "40"}`,
        borderRadius: 10,
        padding: "0.9rem 1rem",
        cursor: "default",
        transition: "all 0.2s",
        boxShadow: hov ? `0 0 16px ${c}30` : "none",
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 6, display: "flex", alignItems: "center" }}>
        <StatusDot status={kpi.status} />{kpi.label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1 }}>
        {kpi.value}<span style={{ fontSize: 14 }}>{kpi.unit}</span>
      </div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{kpi.sub}</div>
    </div>
  );
}

function ChartCard({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{
      background: "#141414",
      border: "1px solid rgba(255,230,0,0.1)",
      borderRadius: 12,
      padding: "1rem 1.25rem",
      gridColumn: span > 1 ? `span ${span}` : undefined,
    }}>
      <div style={{ fontSize: 12, color: "#FFE600", fontWeight: 700, letterSpacing: 1, marginBottom: "0.75rem", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

export default function Dashboard3D() {
  return (
    <div style={{ background: "#070707", minHeight: "100vh", color: "#fff" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "rgba(10,10,10,0.95)",
        borderBottom: "1px solid rgba(255,230,0,0.12)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: 13 }}>← Back</Link>
          <div style={{ width: 1, height: 20, background: "#333" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#000", fontWeight: 900, fontSize: 12 }}>S</span>
            </div>
            <span style={{ color: "#FFE600", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>SPIRIT ANALYTICS</span>
          </div>
          <span style={{ fontSize: 11, color: "#555", background: "#1A1A1A", padding: "2px 8px", borderRadius: 100 }}>3D COMMAND CENTER</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#555" }}>Data through Nov 2024</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3333", display: "inline-block", boxShadow: "0 0 8px #FF3333" }} />
            <span style={{ fontSize: 12, color: "#FF3333", fontWeight: 700 }}>BANKRUPT</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem" }}>

        {/* 3D Aircraft + KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", marginBottom: "1.5rem" }}>

          {/* 3D Scene */}
          <div style={{
            background: "#0A0A0A",
            border: "1px solid rgba(255,230,0,0.12)",
            borderRadius: 16,
            height: 420,
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
              <div style={{ fontSize: 11, color: "#FFE600", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Spirit Airlines N618NK</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Airbus A320 · Last flight Nov 2024</div>
            </div>
            <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 10, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#555", background: "#111", padding: "3px 8px", borderRadius: 100, border: "1px solid #222" }}>Drag to rotate</span>
              <span style={{ fontSize: 10, color: "#555", background: "#111", padding: "3px 8px", borderRadius: 100, border: "1px solid #222" }}>Scroll to zoom</span>
            </div>
            <AirplaneScene />
          </div>

          {/* KPI grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", alignContent: "start" }}>
            {KPIS.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
            <div style={{ gridColumn: "span 2", background: "rgba(255,51,51,0.06)", border: "1px solid rgba(255,51,51,0.25)", borderRadius: 10, padding: "0.9rem 1rem" }}>
              <div style={{ fontSize: 10, color: "#FF3333", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MODEL CONSENSUS ALARM</div>
              <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
                All 4 models flagged distress by <strong style={{ color: "#FFE600" }}>Q3 2022</strong> — 26 months before bankruptcy.
              </div>
            </div>
          </div>
        </div>

        {/* Chart grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          <ChartCard title="Altman Z-Score" span={2}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={Z_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 10 }} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} domain={[-1, 3]} />
                <Tooltip contentStyle={TT} formatter={(v: unknown) => [typeof v === "number" ? v.toFixed(2) : String(v), "Z"]} />
                <ReferenceLine y={1.81} stroke="#FFE600" strokeDasharray="3 3" />
                <ReferenceLine y={0} stroke="#FF3333" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="z" stroke="#FFE600" strokeWidth={2.5}
                  dot={(p: any) => {
                    const c = p.payload?.z > 1.81 ? "#00CC66" : p.payload?.z > 0 ? "#FFE600" : "#FF3333";
                    return <circle key={p.payload?.year} cx={p.cx ?? 0} cy={p.cy ?? 0} r={5} fill={c} stroke="#0A0A0A" strokeWidth={1.5} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cash Reserves">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={CASH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="q" tick={{ fill: "#666", fontSize: 9 }} interval={2} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip contentStyle={TT} formatter={(v: unknown) => [`$${String(v)}M`, "Cash"]} />
                <ReferenceLine y={200} stroke="#FF3333" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="cash" stroke="#00CC66" strokeWidth={2} fill="rgba(0,204,102,0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Survival Curve">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SURVIVAL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="m" tick={{ fill: "#666", fontSize: 9 }} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${String(v)}%`, "Survival"]} />
                <ReferenceLine y={50} stroke="#FFE600" strokeDasharray="3 3" />
                <Area type="stepAfter" dataKey="p" stroke="#FF3333" strokeWidth={2} fill="rgba(255,51,51,0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <ChartCard title="XGBoost Risk Score" span={2}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={RISK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 10 }} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${String(v)}%`, "Risk"]} />
                <ReferenceLine y={50} stroke="#FFE600" strokeDasharray="3 3" />
                <Bar dataKey="prob" radius={[3, 3, 0, 0]}>
                  {RISK_DATA.map((e) => <Cell key={e.year} fill={e.prob >= 50 ? "#FF3333" : "#FFE600"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Signal timeline */}
          <ChartCard title="Model Alarm Timeline" span={2}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { when: "Q3 2021", model: "Altman Z-Score", signal: "Entered distress zone", color: "#FFE600" },
                { when: "Q3 2022", model: "XGBoost", signal: "Risk > 50% threshold", color: "#FF8800" },
                { when: "Q4 2022", model: "Prophet", signal: "Cash forecast → $0 by Q3'24", color: "#FF8800" },
                { when: "Jul 2022", model: "Cox Survival", signal: "Survival below 70%", color: "#FF3333" },
              ].map((item) => (
                <div key={item.model} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "#0D0D0D", borderRadius: 8, borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.when}</div>
                    <div style={{ fontSize: 11, color: "#ccc" }}>{item.model} — {item.signal}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
