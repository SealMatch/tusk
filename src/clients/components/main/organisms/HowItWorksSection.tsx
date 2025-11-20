"use client";

import { CTAContainer } from "@/clients/components/main/molecules";
import {
  DownArrowIcon,
  RightAngleIcon,
} from "@/clients/shared/components/icons";
import { useScrollAnimation } from "@/clients/shared/hooks";
import { SectionDescriptionText, SplitText, StepCard } from "../atoms";

const STEP_CONTENTS = [
  {
    number: "01",
    title: "Register & Encrypt Your Resume",
    description:
      "Upload your resume. It is immediately encrypted with SUI contract-based keys and securely stored on Walrus.",
  },
  {
    number: "02",
    title: "LLM Matching & Recruiter Search",
    description:
      "Based on the LLM-analyzed overview, recruiters search for suitable talent and request access permission from interested applicants.",
  },
  {
    number: "03",
    title: "Approve Access (Your Final Decision)",
    description:
      "Review the recruiter's request. Only upon your approval is the encryption unlocked and your detailed history revealed.",
  },
];

export const HowItWorksSection = () => {
  const cardsRef = useScrollAnimation<HTMLDivElement>();
  const arrowsRef = useScrollAnimation<SVGSVGElement>({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
    stagger: 0.2,
  });

  return (
    <section className="relative w-screen h-screen snap-start snap-always flex flex-col items-center justify-around overflow-hidden px-4 py-20">
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="flex flex-col text-center gap-y-6">
          <SplitText
            text="How It Works"
            className="text-5xl md:text-6xl text-zinc-50 font-bold text-center"
            delay={100}
            duration={0.5}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <SectionDescriptionText>
            3 Simple Steps to Take Control of Your Information
          </SectionDescriptionText>
        </div>

        {/* Steps Container */}
        <div className="flex flex-col md:flex-row items-center justify-center md:gap-6 pt-8">
          {STEP_CONTENTS.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center w-full md:w-auto">
              {/* Card */}
              <StepCard step={step} index={index} cardsRef={cardsRef} />

              {/* Arrow between cards - Desktop (horizontal) */}
              {index < STEP_CONTENTS.length - 1 && (
                <div className="hidden md:flex items-center justify-center mx-4 shrink-0">
                  <RightAngleIcon
                    ref={(el) => {
                      arrowsRef.current[index] = el;
                    }}
                    className="text-white/80"
                  />
                </div>
              )}

              {/* Arrow for mobile - Vertical (below card) */}
              {index < STEP_CONTENTS.length - 1 && (
                <div className="md:hidden flex items-center justify-center my-8">
                  <DownArrowIcon />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <CTAContainer />
      </div>
    </section>
  );
};
