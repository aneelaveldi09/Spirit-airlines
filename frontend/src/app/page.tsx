"use client";

import Hero from "@/components/Hero";
import StorySection from "@/components/StorySection";
import FinancialsSection from "@/components/FinancialsSection";
import SignalsSection from "@/components/SignalsSection";
import ModelsSection from "@/components/ModelsSection";
import AdvancedModelsSection from "@/components/AdvancedModelsSection";
import VerdictSection from "@/components/VerdictSection";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#0A0A0A" }}>
      <Nav />
      <Hero />
      <StorySection />
      <FinancialsSection />
      <SignalsSection />
      <ModelsSection />
      <AdvancedModelsSection />
      <VerdictSection />
      <Footer />
    </main>
  );
}
