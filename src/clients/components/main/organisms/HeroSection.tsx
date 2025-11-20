"use client";

import { HeroButtonContainer, HeroContent } from "../molecules";

export const HeroSection = () => {
  return (
    <section className="relative w-screen min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* <div className="absolute inset-0 z-0">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
      </div> */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-4">
        <HeroContent />
        <HeroButtonContainer />
      </div>
    </section>
  );
};
