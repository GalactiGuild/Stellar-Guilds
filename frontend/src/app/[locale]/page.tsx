"use client";

import { useEffect } from "react";
import Navbar from "@/components/landing-page/layout/Navbar";
import HeroSection from "@/components/landing-page/sections/HeroSection";
import ProblemSolutionSection from "@/components/landing-page/sections/ProblemSolutionSection";
import FeaturesSection from "@/components/landing-page/sections/FeaturesSection";
import HowItWorksSection from "@/components/landing-page/sections/HowItWorksSection";
import BenefitsSection from "@/components/landing-page/sections/BenefitsSection";
import UseCasesSection from "@/components/landing-page/sections/UseCasesSection";
import CTASection from "@/components/landing-page/sections/CTASection";
import Footer from "@/components/landing-page/layout/Footer";

export default function HomePage() {
  useEffect(() => {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}