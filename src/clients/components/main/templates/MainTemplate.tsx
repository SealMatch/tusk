import { Header } from "@/clients/shared/components/header";
import { Galaxy } from "../atoms";
import {
  CandidatePrivacySection,
  HeroSection,
  MatchSmarterSection,
} from "../organisms";

export const MainTemplate = () => {
  return (
    <div className="flex-1">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="fixed inset-0 z-0">
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
    </div>
  );
};
