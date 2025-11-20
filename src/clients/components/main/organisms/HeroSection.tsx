"use client";

import { HeroContent } from "@/clients/components/main/molecules";
import { SearchIcon, ShieldIcon } from "@/clients/shared/components/icons";
import { Button } from "@/clients/shared/ui/button";
import { Galaxy } from "../atoms";

export const HeroSection = () => {
  return (
    <section className="relative w-screen min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-12 px-4">
        <HeroContent />
        <div className="flex gap-4">
          <Button variant="secondary" size="lg">
            <ShieldIcon />
            Start as a Job Seeker
          </Button>
          <Button variant="secondary" size="lg">
            <SearchIcon />
            Search as a Recruiter
          </Button>
        </div>
      </div>
    </section>
  );
};
