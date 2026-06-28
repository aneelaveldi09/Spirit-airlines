"use client";
import { useState, useEffect } from "react";

const links = [
  { label: "Story", href: "#story" },
  { label: "Financials", href: "#financials" },
  { label: "Signals", href: "#signals" },
  { label: "Models", href: "#models" },
  { label: "Deep ML", href: "#advanced" },
  { label: "Verdict", href: "#verdict" },
  { label: "3D Dashboard →", href: "/dashboard", highlight: true },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,230,0,0.15)" : "none",
        transition: "all 0.3s ease",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#000", fontWeight: 900, fontSize: 14 }}>S</span>
        </div>
        <span style={{ color: "#FFE600", fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
          SPIRIT ANALYTICS
        </span>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              color: (l as { highlight?: boolean }).highlight ? "#000" : "#aaa",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: (l as { highlight?: boolean }).highlight ? 700 : 500,
              transition: "all 0.2s",
              background: (l as { highlight?: boolean }).highlight ? "#FFE600" : "transparent",
              padding: (l as { highlight?: boolean }).highlight ? "0.35rem 0.9rem" : "0",
              borderRadius: (l as { highlight?: boolean }).highlight ? 6 : 0,
            }}
            onMouseEnter={(e) => { if (!(l as { highlight?: boolean }).highlight) e.currentTarget.style.color = "#FFE600"; }}
            onMouseLeave={(e) => { if (!(l as { highlight?: boolean }).highlight) e.currentTarget.style.color = "#aaa"; }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
