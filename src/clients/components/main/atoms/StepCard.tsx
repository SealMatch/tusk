import { HTMLAttributes } from "react";

interface StepCardProps extends HTMLAttributes<HTMLDivElement> {
  step: {
    number: string;
    title: string;
    description: string;
  };
  index: number;
}

export const StepCard = ({ step, index, ...props }: StepCardProps) => {
  return (
    <div
      key={index}
      {...props}
      className="flex flex-col md:flex-row items-center w-full md:w-auto">
      {/* Card */}
      <div className="group relative w-full md:w-96">
        <div className="relative p-6 md:p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md hover:bg-black/30 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 min-h-[240px] md:min-h-[300px] flex flex-col">
          {/* Step Number Badge */}
          <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-base md:text-lg shadow-lg">
            {step.number}
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-2xl font-bold text-zinc-50 mb-3 md:mb-4 mt-1 md:mt-2 group-hover:text-white transition-colors">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
            {step.description}
          </p>

          {/* Decorative Gradient Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
