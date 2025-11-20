"use client";

import { CTAContainer, HeroContent } from "../molecules";

export const HeroSection = () => {
  return (
    <section className="relative w-screen h-screen snap-start snap-always flex flex-col items-center justify-center overflow-hidden">
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
        <CTAContainer />
      </div>
    </section>
  );
};
