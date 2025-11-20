"use client";

import {
  FunnelIcon,
  KeyIcon,
  LockIcon,
} from "@/clients/shared/components/icons";
import { useScrollAnimation } from "@/clients/shared/hooks";
import { FeatureCard, SplitText } from "../atoms";

const CANDIDATE_PRIVACY_CONTENT = [
  {
    title: "Access Approval, 100% Applicant Consent",
    description:
      "Recruiters must request permission from the applicant to view the resume. No one can access the document until the applicant grants explicit approval.",
    icon: KeyIcon,
  },
  {
    title: "Absolute Encryption via Blockchain",
    description:
      "Your resume is encrypted with a Seal Server key and stored securely on Walrus. The SUI policy contract governs all data access rules.",
    icon: LockIcon,
  },
  {
    title: "Filtering Only Genuine Recruiters",
    description:
      "Recruiters can only view a brief overview after searching. This filters out spam and ensures access requests come only from recruiters with a genuine hiring intent.",
    icon: FunnelIcon,
  },
] as const;

export const CandidatePrivacySection = () => {
  const cardsRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="relative w-screen h-screen snap-start snap-always flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-16">
        <div className="flex flex-col text-center gap-y-8">
          <SplitText
            text="Your Career, Your Decision to Reveal."
            className="text-7xl text-zinc-50 font-bold text-center"
            delay={100}
            duration={0.3}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <p className="text-lg text-zinc-50/90 pt-4">
            Your resume is secured by SUI contract-based encryption. No unwanted
            disclosure—you grant access only to companies that show genuine
            interest.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CANDIDATE_PRIVACY_CONTENT.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={Icon}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
