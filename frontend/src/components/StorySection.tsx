"use client";

const EVENTS = [
  {
    year: "2013", color: "#00CC66",
    title: "Spirit Goes Public",
    body: "IPO at $12/share. The ultra-low-cost carrier model promises: strip out every amenity, undercut everyone on price, win on volume.",
  },
  {
    year: "2019", color: "#00CC66",
    title: "Peak Performance",
    body: "$3.8B revenue. 83% load factor. The ULCC model looks unbeatable. But the cracks are forming: $1.7B in debt, razor-thin margins.",
  },
  {
    year: "2020", color: "#FFE600",
    title: "COVID Hits Hard",
    body: "Revenue collapses 57% to $1.6B. Debt balloons to $2.9B as Spirit takes emergency loans. The balance sheet never recovers.",
  },
  {
    year: "2022", color: "#FF8800",
    title: "The Merger Trap",
    body: "Frontier merger collapses. JetBlue swoops in — offer accepted. But the DOJ blocks it in Jan 2024. Spirit is left with $3.8B in debt and no exit.",
  },
  {
    year: "2023", color: "#FF3333",
    title: "Competitors Adapt",
    body: "Delta, United, American launch 'Basic Economy' — matching Spirit's price, while offering a better product. Spirit's core value proposition evaporates.",
  },
  {
    year: "Nov 2024", color: "#FF3333",
    title: "Chapter 11",
    body: "Spirit files for bankruptcy. $87M cash remaining. $4.3B in debt. 70% stock decline from peak. The end of a 10-year run.",
  },
];

export default function StorySection() {
  return (
    <section id="story" style={{ padding: "6rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "1rem" }}>
          The Case
        </div>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}>
          How Spirit Airlines Fell
        </h2>
        <p style={{ color: "#888", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          A decade of growth, then a perfect storm. Each event left measurable signals in the financial data.
        </p>
      </div>

      <div style={{ position: "relative", paddingLeft: 40 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 16, top: 0, bottom: 0,
          width: 2,
          background: "linear-gradient(180deg, #00CC66, #FFE600, #FF8800, #FF3333)",
        }} />

        {EVENTS.map((event, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              marginBottom: "2.5rem",
              paddingLeft: "2rem",
            }}
          >
            {/* Dot */}
            <div style={{
              position: "absolute",
              left: -32,
              top: 4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: event.color,
              boxShadow: `0 0 10px ${event.color}`,
            }} />

            <div style={{ fontSize: 11, color: event.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              {event.year}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{event.title}</h3>
            <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, maxWidth: 640 }}>{event.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
