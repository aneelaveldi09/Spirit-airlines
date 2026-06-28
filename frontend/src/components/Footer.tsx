"use client";

export default function Footer() {
  return (
    <footer style={{
      background: "#111",
      borderTop: "1px solid rgba(255,230,0,0.1)",
      padding: "3rem 2rem",
      textAlign: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#000", fontWeight: 900, fontSize: 14 }}>S</span>
        </div>
        <span style={{ color: "#FFE600", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>SPIRIT ANALYTICS</span>
      </div>

      <p style={{ color: "#666", fontSize: 13, maxWidth: 520, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
        A data-driven case study built to demonstrate how machine learning can predict corporate distress from public financial data. All data sourced from SEC EDGAR 10-K and 10-Q filings.
      </p>

      <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        {["Altman Z-Score", "XGBoost", "Prophet", "Cox Survival", "SEC EDGAR Data"].map((tag) => (
          <span key={tag} style={{
            fontSize: 11,
            color: "#555",
            background: "#1A1A1A",
            padding: "4px 10px",
            borderRadius: 100,
            border: "1px solid #2A2A2A",
          }}>
            {tag}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#444" }}>
        Built for portfolio purposes. Not financial advice.
      </p>
    </footer>
  );
}
