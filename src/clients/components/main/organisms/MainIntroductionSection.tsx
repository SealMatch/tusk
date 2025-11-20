"use client";

import { Galaxy, SplitText } from "../atoms";

export const MainIntroductionSection = () => {
  return (
    <section className="relative w-screen min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
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
      <div className="relative z-10 text-center">
        <SplitText
          text="Seal Match"
          className="text-4xl text-zinc-50 font-bold mb-4"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
        <p className="text-lg text-zinc-50">
          Seal Match is a web application that allows users to find and connect
          with other users who share their interests.
        </p>
      </div>
    </section>
  );
};
