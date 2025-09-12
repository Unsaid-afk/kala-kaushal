import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: string;
}

const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ 
    value, 
    size = 120, 
    strokeWidth = 8, 
    className, 
    showValue = true,
    color = "hsl(var(--primary))",
    ...props 
  }, ref) => {
    const normalizedValue = Math.max(0, Math.min(100, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

    return (
      <div 
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out animate-glow"
            style={{
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {normalizedValue.toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";

export default ProgressRing;
