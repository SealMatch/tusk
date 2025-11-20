import { cn } from "../../libs";

export const RightAngleIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    {...props}
    className={cn("text-white/80", className)}>
    <path
      d="M20 14L30 24L20 34"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
