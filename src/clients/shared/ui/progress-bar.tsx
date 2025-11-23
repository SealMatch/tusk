import * as React from "react";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  showPercentage?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value = 0, showPercentage = true, ...props }, ref) => {
    // 0-100 범위로 제한
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        className={`max-w-[300px] ${className || ""}`}
        {...props}
      >
        <div className="flex items-center justify-between mb-1">
          {showPercentage && (
            <span className="text-xs font-medium text-purple-300">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer wave effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
