import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spirit Airlines | Bankruptcy Prediction Case Study",
  description: "How machine learning could have predicted Spirit Airlines' bankruptcy 2 years before it happened.",
  openGraph: {
    title: "Spirit Airlines Bankruptcy Prediction",
    description: "A data-driven case study — signals the market missed.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full" style={{ background: "#0A0A0A", color: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}
