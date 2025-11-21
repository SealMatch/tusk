import { cn } from "@/clients/shared/libs/styles.lib";
import { getSkillColor } from "@/clients/shared/utils/skill.utils";

interface SkillBadgeProps {
  skill: string;
  className?: string;
}


// 기술 스킬 뱃지 컴포넌트
export function SkillBadge({ skill, className }: SkillBadgeProps) {
  const color = getSkillColor(skill);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        color.bg,
        color.text,
        className
      )}
    >
      {skill}
    </span>
  );
}
