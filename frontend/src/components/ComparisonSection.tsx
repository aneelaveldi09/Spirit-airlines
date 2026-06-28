"use client";
import { ImageComparison } from "@/components/ui/image-comparison-slider";

// Real Spirit Airlines aircraft photo (Airbus A320 yellow livery) — Unsplash
const SPIRIT_PLANE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80";

// Airport terminal with data overlay feel
const ANALYTICS_OVERLAY = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80";

export default function ComparisonSection() {
  return (
    <section style={{ padding: "5rem 2rem", background: "#0A0A0A" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
            The Difference
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: "1rem" }}>
            With Me vs Without Me
          </h2>
          <p style={{ color: "#888", fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Drag the slider. On the left — what Spirit had: no early warning system, no model running on public data. On the right — what 24 months of lead time looks like.
          </p>
        </div>

        <ImageComparison
          beforeImage={SPIRIT_PLANE}
          afterImage={ANALYTICS_OVERLAY}
          altBefore="Spirit Airlines aircraft — no analytics warning system"
          altAfter="Analytics dashboard — early warning 24 months before bankruptcy"
          beforeLabel="Without analytics team"
          afterLabel="With analytics team"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
          <div style={{ background: "rgba(255,51,51,0.06)", border: "1px solid rgba(255,51,51,0.2)", borderRadius: 12, padding: "1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3333", marginBottom: 12, letterSpacing: 1 }}>WITHOUT AN ANALYTICS TEAM</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "No model running on quarterly filings",
                "Z-Score never computed until it was too late",
                "Cash burn trajectory not formally tracked",
                "Merger dependency not flagged as systemic risk",
                "Chapter 11 filed with $87M cash — no runway",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#999" }}>
                  <span style={{ color: "#FF3333", marginTop: 2, flexShrink: 0 }}>✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: "rgba(255,230,0,0.04)", border: "1px solid rgba(255,230,0,0.2)", borderRadius: 12, padding: "1.5rem" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFE600", marginBottom: 12, letterSpacing: 1 }}>WITH AN ANALYTICS TEAM</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Altman Z-Score alarm fired in Q3 2021 — 38 months early",
                "XGBoost crossed 50% risk threshold in 2019",
                "Prophet projected $0 cash by Q3 2024 — in 2022",
                "Cox survival model: below 70% by Jul 2022",
                "Ensemble consensus: 5/5 models agreed on distress in 2023",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#ccc" }}>
                  <span style={{ color: "#00CC66", marginTop: 2, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
