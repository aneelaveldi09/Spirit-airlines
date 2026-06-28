"use client";

const SIGNALS = [
  {
    id: "01",
    color: "#FF3333",
    title: "Altman Z-Score Entered Distress Zone",
    when: "Detectable from: 2021",
    body: "The Z-Score — a weighted formula of 5 financial ratios — dropped from 3.2 (safe) in 2018 to 1.38 by 2021, crossing the 1.81 distress threshold. By 2023 it was 0.64.",
    metric: "Z = 0.64",
    metricLabel: "by 2023 (Distress < 1.81)",
  },
  {
    id: "02",
    color: "#FF8800",
    title: "CASM Crossed RASM — Cost Exceeded Revenue Per Seat",
    when: "Detectable from: Q3 2022",
    body: "For a ULCC, this is the most critical signal. The business model relies on earning more per seat than it costs to operate one. In 2022, costs overtook revenue on a per-seat basis — and kept widening.",
    metric: "+$2.03",
    metricLabel: "CASM over RASM by 2024",
  },
  {
    id: "03",
    color: "#FFE600",
    title: "Cash Burn Trajectory",
    when: "Detectable from: Q4 2022",
    body: "From peak cash of $1.2B in 2021, reserves fell to $87M by bankruptcy — a 93% decline in 3 years. A linear regression on quarterly cash data would have projected near-zero by Q3 2024.",
    metric: "93%",
    metricLabel: "cash decline from peak",
  },
  {
    id: "04",
    color: "#FF3333",
    title: "Debt-to-Assets Ratio Exceeded Critical Threshold",
    when: "Detectable from: 2022",
    body: "Debt grew from $1.5B (2018) to $4.3B (2024) while assets stagnated. By 2022, the debt-to-assets ratio hit 0.72 — airlines typically collapse when this exceeds 0.70.",
    metric: "0.82",
    metricLabel: "D/A ratio at bankruptcy",
  },
  {
    id: "05",
    color: "#FF8800",
    title: "Merger Dependency = Single Point of Failure",
    when: "Detectable from: 2022",
    body: "The Frontier and JetBlue merger negotiations signaled Spirit's leadership knew the standalone model was broken. Merger arbitrage ≠ business strategy. When DOJ blocked JetBlue, no Plan C existed.",
    metric: "2 failed",
    metricLabel: "merger attempts in 2 years",
  },
  {
    id: "06",
    color: "#FFE600",
    title: "Competitors Commoditized the ULCC Model",
    when: "Detectable from: 2022-2023",
    body: "Major carriers launched Basic Economy fares that matched Spirit's ticket prices while offering more reliability and amenity options. Spirit's NPS scores (customer satisfaction) declined sharply — a leading indicator of revenue pressure.",
    metric: "-34pts",
    metricLabel: "customer satisfaction decline",
  },
];

export default function SignalsSection() {
  return (
    <section id="signals" style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
          Early Warning System
        </div>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
          6 Signals The Data Showed
        </h2>
        <p style={{ color: "#888", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
          Every one of these was measurable from public filings. No insider knowledge required.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {SIGNALS.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#1A1A1A",
              border: `1px solid ${s.color}25`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: 12,
              padding: "1.75rem",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = s.color;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${s.color}25`;
              (e.currentTarget as HTMLDivElement).style.borderLeftColor = s.color;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span style={{ fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 2 }}>SIGNAL {s.id}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.metric}</div>
                <div style={{ fontSize: 10, color: "#666" }}>{s.metricLabel}</div>
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.4 }}>{s.title}</h3>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 10, letterSpacing: 1 }}>{s.when}</div>
            <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
