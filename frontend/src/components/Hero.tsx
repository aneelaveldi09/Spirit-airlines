"use client";
import { useEffect, useState } from "react";

const TIMELINE = [
  { year: "2018", label: "IPO High", color: "#00CC66", desc: "Revenue growing, Z-score healthy" },
  { year: "2020", label: "COVID Shock", color: "#FFE600", desc: "Debt doubles, cash burns" },
  { year: "2022", label: "⚠ First Alarm", color: "#FF8800", desc: "CASM > RASM. Model flags distress." },
  { year: "2023", label: "🔴 Critical", color: "#FF3333", desc: "Survival probability drops below 50%" },
  { year: "Nov 2024", label: "BANKRUPT", color: "#FF3333", desc: "Chapter 11 filed" },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,230,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,230,0,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(255,230,0,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        textAlign: "center", maxWidth: 860,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.8s ease",
        position: "relative",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,51,51,0.1)",
          border: "1px solid rgba(255,51,51,0.4)",
          borderRadius: 100,
          padding: "0.35rem 1rem",
          fontSize: 12,
          color: "#FF3333",
          fontWeight: 600,
          letterSpacing: 2,
          marginBottom: "2rem",
          textTransform: "uppercase",
        }}>
          Chapter 11 Filed — November 18, 2024
        </div>

        <h1 style={{
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 900,
          lineHeight: 1.05,
          marginBottom: "1.5rem",
          letterSpacing: -1,
        }}>
          The Data Was{" "}
          <span style={{ color: "#FFE600" }}>Screaming.</span>
          <br />
          Nobody Listened.
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.3rem)",
          color: "#999",
          maxWidth: 620,
          margin: "0 auto 3rem",
          lineHeight: 1.7,
        }}>
          If I had been on Spirit Airlines' Business Analytics team, I would have raised the alarm{" "}
          <strong style={{ color: "#FFE600" }}>24 months before bankruptcy</strong>. Here's the model, the signals, and the data that prove it.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
          <a href="#models" style={{
            background: "#FFE600", color: "#000", padding: "0.85rem 2rem",
            borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none",
            transition: "transform 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            See the Models →
          </a>
          <a href="#signals" style={{
            background: "transparent", color: "#FFE600", padding: "0.85rem 2rem",
            borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none",
            border: "1px solid rgba(255,230,0,0.4)",
          }}>
            View Warning Signals
          </a>
        </div>

        {/* Timeline */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          gap: 0, flexWrap: "wrap", position: "relative",
        }}>
          {TIMELINE.map((item, i) => (
            <div key={item.year} style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 140 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: item.color,
                  boxShadow: `0 0 12px ${item.color}`,
                  marginBottom: 8,
                  flexShrink: 0,
                }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.year}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: "#777", textAlign: "center", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
              {i < TIMELINE.length - 1 && (
                <div style={{
                  height: 2,
                  width: 40,
                  background: "linear-gradient(90deg, rgba(255,230,0,0.3), rgba(255,51,51,0.3))",
                  marginTop: 6,
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
