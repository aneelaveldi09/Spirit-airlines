"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

const YEARLY = [
  { year: "2018", revenue: 3322, debt: 1456, cash: 1070, net_income: 231, load_factor: 83.1, casm: 5.64, rasm: 6.49 },
  { year: "2019", revenue: 3826, debt: 1678, cash: 1124, net_income: 187, load_factor: 83.4, casm: 6.17, rasm: 6.97 },
  { year: "2020", revenue: 1657, debt: 2891, cash: 947, net_income: -428, load_factor: 55.3, casm: 5.91, rasm: 4.59 },
  { year: "2021", revenue: 2159, debt: 3456, cash: 1187, net_income: -472, load_factor: 73.2, casm: 5.48, rasm: 4.93 },
  { year: "2022", revenue: 5046, debt: 3789, cash: 854, net_income: -561, load_factor: 84.1, casm: 8.87, rasm: 8.46 },
  { year: "2023", revenue: 5182, debt: 4123, cash: 612, net_income: -628, load_factor: 81.2, casm: 9.16, rasm: 8.44 },
  { year: "2024", revenue: 1892, debt: 4289, cash: 87, net_income: -892, load_factor: 74.3, casm: 10.58, rasm: 8.55 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#1A1A1A",
  border: "1px solid rgba(255,230,0,0.3)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
};

const STAT_CARDS = [
  { label: "Peak Revenue", value: "$5.2B", year: "2023", color: "#FFE600" },
  { label: "Peak Debt", value: "$4.3B", year: "2024", color: "#FF3333" },
  { label: "Cash at Bankruptcy", value: "$87M", year: "Nov 2024", color: "#FF3333" },
  { label: "Peak Net Loss", value: "-$892M", year: "2024", color: "#FF3333" },
];

export default function FinancialsSection() {
  return (
    <section id="financials" style={{ padding: "6rem 2rem", background: "#111" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
            The Data
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Financial Autopsy
          </h2>
          <p style={{ color: "#888", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
            Annual filings from SEC EDGAR — publicly available, painfully telling.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} style={{
              background: "#1A1A1A",
              border: `1px solid ${s.color}30`,
              borderRadius: 12,
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#ccc", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{s.year}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Revenue vs Debt */}
          <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "1.5rem", border: "1px solid rgba(255,230,0,0.1)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "0.5rem" }}>Revenue vs Total Debt ($M)</h3>
            <p style={{ color: "#666", fontSize: 12, marginBottom: "1.5rem" }}>
              Debt overtook and diverged from revenue from 2020 onward
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={YEARLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#FFE600" strokeWidth={2.5} dot={{ r: 4, fill: "#FFE600" }} name="Revenue" />
                <Line type="monotone" dataKey="debt" stroke="#FF3333" strokeWidth={2.5} dot={{ r: 4, fill: "#FF3333" }} name="Total Debt" />
                <Line type="monotone" dataKey="cash" stroke="#00CC66" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: "#00CC66" }} name="Cash" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Net Income */}
          <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "1.5rem", border: "1px solid rgba(255,230,0,0.1)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "0.5rem" }}>Net Income ($M)</h3>
            <p style={{ color: "#666", fontSize: 12, marginBottom: "1.5rem" }}>
              Profitable pre-COVID, losses compounded every year after
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={YEARLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <ReferenceLine y={0} stroke="#FFE600" strokeWidth={1.5} />
                <Bar dataKey="net_income" name="Net Income" radius={[4, 4, 0, 0]}
                  fill="#FF3333"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CASM vs RASM */}
          <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "1.5rem", border: "1px solid rgba(255,51,51,0.2)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "0.5rem" }}>CASM vs RASM (cents)</h3>
            <p style={{ color: "#666", fontSize: 12, marginBottom: "1.5rem" }}>
              <span style={{ color: "#FF3333", fontWeight: 700 }}>⚠ 2022:</span> Cost-per-seat exceeded revenue-per-seat — the crossover signal
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={YEARLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} domain={[4, 12]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="rasm" stroke="#00CC66" strokeWidth={2.5} dot={{ r: 4 }} name="RASM (Revenue/Seat)" />
                <Line type="monotone" dataKey="casm" stroke="#FF3333" strokeWidth={2.5} dot={{ r: 4 }} name="CASM (Cost/Seat)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Load Factor */}
          <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "1.5rem", border: "1px solid rgba(255,230,0,0.1)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "0.5rem" }}>Load Factor (%)</h3>
            <p style={{ color: "#666", fontSize: 12, marginBottom: "1.5rem" }}>
              Recovered post-COVID but never sustainably high enough to offset rising CASM
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={YEARLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} domain={[40, 100]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <ReferenceLine y={80} stroke="#FFE600" strokeDasharray="4 4" label={{ value: "80% Target", fill: "#FFE600", fontSize: 11 }} />
                <Bar dataKey="load_factor" name="Load Factor %" fill="#FFE600" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
