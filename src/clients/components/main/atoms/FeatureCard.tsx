interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) => {
  return (
    <div className="group relative p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md hover:bg-black/30 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-zinc-50" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-50 whitespace-pre-line">
          {title}
        </h3>
        <p className="text-zinc-50/70 leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
