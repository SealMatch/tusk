import { CTAContainer, HeroContent } from "../molecules";

export const HeroSection = () => {
  return (
    <section className="relative w-screen h-screen snap-start snap-always flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-12 px-4">
        <HeroContent />
        <CTAContainer />
      </div>
    </section>
  );
};
