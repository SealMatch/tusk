import {
  BoltIcon,
  CPUChipIcon,
  HandRaiseIcon,
  ViewFinderIcon,
} from "@/clients/shared/components/icons";
import { FeatureCard, SplitText } from "../atoms";

const MATCH_SMARTER_CONTENT = [
  {
    title: "Contextual Analysis, Not Keywords",
    description:
      "We analyze uploaded resumes by considering the depth of your potential and experience, not just simple keywords.",
    icon: CPUChipIcon,
  },
  {
    title: "Culture and Values Fit Prediction",
    description:
      "By comparing company culture with your core values, we predict a match that can lead to long-term success.",
    icon: HandRaiseIcon,
  },
  {
    title: "LLM-Powered Precision Matching",
    description:
      "The LLM analyzes data to recommend talent. Recruiters review a brief tech stack and overview, then request permission for detailed information.",
    icon: ViewFinderIcon,
  },
  {
    title: "Time-Saving, High-Speed Process",
    description:
      "We reduce unnecessary document review time, enabling both recruiters and applicants to make faster, more efficient decisions.",
    icon: BoltIcon,
  },
] as const;
export const MatchSmarterSection = () => {
  return (
    <section className="relative w-screen min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-16">
        <div className="flex flex-col text-center gap-y-8">
          <SplitText
            text="Achieve Smarter, More Precise Matching."
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
            Accurately identify hidden talent within massive data pools and
            achieve the precise matching required for your company&apos;s
            success.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {MATCH_SMARTER_CONTENT.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={Icon}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
