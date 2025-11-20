import { cn } from "@/clients/shared/libs/styles.lib";
import { getSkillColor } from "@/clients/shared/utils/skill.utils";

interface SkillBadgeProps {
  skill: string;
  className?: string;
}

/**
 * 기술 스킬 뱃지 컴포넌트
 * - 각 스킬마다 고유한 배경색과 텍스트 색상을 가짐
 * - 등록되지 않은 스킬은 기본 회색 사용
 */
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
