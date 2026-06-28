"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { MoveRight, TrendingDown } from "lucide-react";

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  layer: number;
}

function createBeam(width: number, height: number, layer: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    width: 8 + layer * 4,
    length: height * 2.5,
    angle,
    speed: 0.18 + layer * 0.15 + Math.random() * 0.15,
    opacity: 0.06 + layer * 0.04 + Math.random() * 0.06,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.012,
    layer,
  };
}

export const PremiumHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animFrameRef = useRef<number>(0);
  const [titleNumber, setTitleNumber] = useState(0);

  const LAYERS = 3;
  const BEAMS_PER_LAYER = 8;

  // Spirit-themed rotating titles
  const titles = ["predictable", "measurable", "preventable", "data-driven", "inevitable"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const noiseCanvas = noiseRef.current;
    if (!canvas || !noiseCanvas) return;
    const ctx = canvas.getContext("2d");
    const nCtx = noiseCanvas.getContext("2d");
    if (!ctx || !nCtx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      for (const c of [canvas, noiseCanvas]) {
        c.width = window.innerWidth * dpr;
        c.height = window.innerHeight * dpr;
        c.style.width = `${window.innerWidth}px`;
        c.style.height = `${window.innerHeight}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      beamsRef.current = [];
      for (let layer = 1; layer <= LAYERS; layer++) {
        for (let i = 0; i < BEAMS_PER_LAYER; i++) {
          beamsRef.current.push(createBeam(window.innerWidth, window.innerHeight, layer));
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const noise = () => {
      const img = nCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 10;
      }
      nCtx.putImageData(img, 0, 0);
    };

    const drawBeam = (beam: Beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const op = Math.min(1, beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.4));
      const g = ctx.createLinearGradient(0, 0, 0, beam.length);
      // Spirit yellow beams
      g.addColorStop(0,   `rgba(255,230,0,0)`);
      g.addColorStop(0.2, `rgba(255,230,0,${op * 0.4})`);
      g.addColorStop(0.5, `rgba(255,230,0,${op})`);
      g.addColorStop(0.8, `rgba(255,230,0,${op * 0.4})`);
      g.addColorStop(1,   `rgba(255,230,0,0)`);
      ctx.fillStyle = g;
      ctx.filter = `blur(${2 + beam.layer * 2}px)`;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      bg.addColorStop(0, "#050505");
      bg.addColorStop(1, "#0A0A0A");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      beamsRef.current.forEach((beam) => {
        beam.y -= beam.speed * (beam.layer / LAYERS + 0.5);
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -50) {
          beam.y = window.innerHeight + 50;
          beam.x = Math.random() * window.innerWidth;
        }
        drawBeam(beam);
      });

      noise();
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTitleNumber((p) => (p + 1) % titles.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas ref={noiseRef} className="absolute inset-0 z-0 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      <div className="relative z-20 flex h-screen w-full items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-10 text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
            style={{ background: "rgba(255,51,51,0.1)", border: "1px solid rgba(255,51,51,0.4)", color: "#FF3333", letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>
            <TrendingDown className="w-3 h-3" />
            Chapter 11 Filed — November 18, 2024
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, color: "#fff" }}>
            Spirit Airlines was
            <span className="relative flex w-full justify-center overflow-hidden pb-2 pt-1" style={{ height: "1.2em" }}>
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-black"
                  style={{ color: "#FFE600" }}
                  initial={{ opacity: 0, y: 80 }}
                  transition={{ type: "spring", stiffness: 60, damping: 18 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -80 : 80, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#888", maxWidth: 600, lineHeight: 1.75 }}>
            If I had been on Spirit Airlines' Business Analytics team, I would have raised the alarm{" "}
            <strong style={{ color: "#FFE600" }}>24 months before bankruptcy</strong> using public SEC data alone. Here is the evidence.
          </p>

          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <Button size="sm" className="gap-2 text-sm px-5 py-2.5" asChild>
              <a href="#models">See the Models <MoveRight className="w-4 h-4" /></a>
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-sm px-5 py-2.5" asChild>
              <a href="#signals">View Warning Signals</a>
            </Button>
          </div>

          {/* Timeline strip */}
          <div className="flex items-start justify-center gap-0 flex-wrap mt-4">
            {[
              { year: "2018", label: "IPO High", color: "#00CC66", desc: "Z-score 2.38 — safe" },
              { year: "2021", label: "⚠ Distress", color: "#FFE600", desc: "Z-score 0.50 — alarm" },
              { year: "2022", label: "🔴 Critical", color: "#FF8800", desc: "CASM > RASM crossover" },
              { year: "2023", label: "All 5 agree", color: "#FF3333", desc: "Full model consensus" },
              { year: "Nov 2024", label: "BANKRUPT", color: "#FF3333", desc: "Chapter 11 filed" },
            ].map((item, i, arr) => (
              <div key={item.year} className="flex items-start">
                <div className="flex flex-col items-center w-32">
                  <div className="w-3 h-3 rounded-full mb-2" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.year}</div>
                  <div className="text-xs font-semibold text-white mb-1">{item.label}</div>
                  <div className="text-xs text-center" style={{ color: "#666", lineHeight: 1.4 }}>{item.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-8 h-px mt-1.5 shrink-0" style={{ background: "linear-gradient(90deg, rgba(255,230,0,0.3), rgba(255,51,51,0.3))" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
