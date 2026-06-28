"use client";

const TIMELINE = [
  {
    when: "Q3 2021",
    model: "Altman Z-Score",
    signal: "Z-Score crossed below 1.81 into distress zone",
    action: "Issue internal distress report. Begin scenario planning for debt restructuring.",
    color: "#FFE600",
    leadTime: "38 months",
  },
  {
    when: "Q3 2022",
    model: "XGBoost Classifier",
    signal: "Bankruptcy probability exceeded 50% threshold",
    action: "Escalate to C-suite. Model flags CASM > RASM as primary driver. Recommend aggressive cost-cutting.",
    color: "#FF8800",
    leadTime: "26 months",
  },
  {
    when: "Q4 2022",
    model: "Prophet (Cash Forecast)",
    signal: "Cash trajectory forecast: ~$0 by Q3 2024",
    action: "Trigger liquidity alarm. Initiate debt renegotiation. Explore Chapter 11 prep as contingency.",
    color: "#FF8800",
    leadTime: "24 months",
  },
  {
    when: "Q1 2023",
    model: "Cox Survival Model",
    signal: "Survival probability dropped below 70% — median survival 18 months",
    action: "Present 'Survive vs. Restructure' board memo. Last viable window for merger or capital raise.",
    color: "#FF3333",
    leadTime: "20 months",
  },
  {
    when: "Nov 18, 2024",
    model: "—",
    signal: "Chapter 11 bankruptcy filed",
    action: "$87M cash remaining. 4,000 employees affected. Stock delisted.",
    color: "#FF3333",
    leadTime: "0",
  },
];

export default function VerdictSection() {
  return (
    <section id="verdict" style={{ padding: "6rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
          The Verdict
        </div>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
          When I Would Have Sounded the Alarm
        </h2>
        <p style={{ color: "#888", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Not one model, not one quarter — a persistent, compounding signal from 4 independent methods.
        </p>
      </div>

      <div style={{ position: "relative", paddingLeft: 40 }}>
        <div style={{
          position: "absolute", left: 16, top: 0, bottom: 0, width: 2,
          background: "linear-gradient(180deg, #FFE600, #FF8800, #FF3333)",
        }} />

        {TIMELINE.map((item, i) => (
          <div key={i} style={{ position: "relative", marginBottom: "2.5rem", paddingLeft: "2rem" }}>
            <div style={{
              position: "absolute", left: -32, top: 4,
              width: 14, height: 14, borderRadius: "50%",
              background: item.color, boxShadow: `0 0 10px ${item.color}`,
            }} />

            <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "1.5rem", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontSize: 13, color: item.color, fontWeight: 700 }}>{item.when}</span>
                  {item.leadTime !== "0" && (
                    <span style={{ marginLeft: 12, fontSize: 11, background: "rgba(255,230,0,0.1)", color: "#FFE600", padding: "2px 8px", borderRadius: 100 }}>
                      {item.leadTime} lead time
                    </span>
                  )}
                </div>
                {item.model !== "—" && (
                  <span style={{ fontSize: 11, color: "#555", fontWeight: 600, background: "#2A2A2A", padding: "3px 10px", borderRadius: 100 }}>
                    {item.model}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, marginBottom: 8 }}>{item.signal}</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.7 }}>
                <strong style={{ color: "#FFE600" }}>Action: </strong>{item.action}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion box */}
      <div style={{
        marginTop: "3rem",
        background: "rgba(255,230,0,0.05)",
        border: "1px solid rgba(255,230,0,0.3)",
        borderRadius: 16,
        padding: "2.5rem",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💡</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "#FFE600" }}>
          The Business Analytics Lesson
        </h3>
        <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.8, maxWidth: 620, margin: "0 auto 1.5rem" }}>
          Spirit's downfall wasn't unpredictable — it was unmeasured. Every signal was in public filings. The Altman Z-Score entered distress in 2021. Costs exceeded revenue per seat in 2022. The cash model showed zero reserves by 2024.
        </p>
        <p style={{ color: "#ccc", fontSize: 15, lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>
          A proactive analytics team running these models quarterly would have had{" "}
          <strong style={{ color: "#FFE600" }}>24–38 months of lead time</strong>{" "}
          to restructure debt, pivot the business model, or execute a planned merger — rather than a forced bankruptcy.
        </p>
      </div>
    </section>
  );
}
