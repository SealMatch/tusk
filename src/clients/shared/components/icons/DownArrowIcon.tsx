import { cn } from "../../libs";

export const DownArrowIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    {...props}
    className={cn("text-white/80", className)}>
    <path
      d="M16 8L16 24M16 24L22 18M16 24L10 18"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
