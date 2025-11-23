import { LogoIcon } from "@/clients/shared/components/icons";
import { SplitText } from "../atoms";

export const HeroContent = () => {
  return (
    <div className="text-center flex flex-col items-center gap-8">
      <div className="flex items-center gap-6">
        <LogoIcon className="w-16 h-16 text-white" />
        <SplitText
          text="Tusk"
          className="text-8xl text-zinc-50 font-bold"
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
      </div>

      <SplitText
        text="The safest recruitment platform on blockchain"
        className="text-3xl text-zinc-50/80 font-medium max-w-5xl"
        delay={100}
        duration={0.2}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />
      <div className="max-w-3xl mx-auto space-y-2 mt-4">
        <p className="text-lg text-zinc-50/90">
          Leveraging policy contracts and Walrus distributed repositories
        </p>
        <p className="text-lg text-zinc-50/90">
          in the Sui network, we build a next-generation recruitment environment
        </p>
        <p className="text-lg text-zinc-50/90">
          where no one can access their resume without job seeker approval.
        </p>
      </div>
    </div>
  );
};
