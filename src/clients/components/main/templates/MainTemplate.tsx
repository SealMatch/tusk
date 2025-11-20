"use client";
import { Header } from "@/clients/shared/components/header";
import { useSectionSnap } from "@/clients/shared/hooks";
import { Galaxy } from "../atoms";
import {
  CandidatePrivacySection,
  HeroSection,
  HowItWorksSection,
  MatchSmarterSection,
} from "../organisms";

export const MainTemplate = () => {
  useSectionSnap();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
      </div>
      <HeroSection />
      <CandidatePrivacySection />
      <MatchSmarterSection />
      <HowItWorksSection />
    </>
  );
};
