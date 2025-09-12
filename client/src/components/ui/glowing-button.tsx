import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GlowingButtonProps extends ButtonProps {
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
}

const GlowingButton = forwardRef<HTMLButtonElement, GlowingButtonProps>(
  ({ className, glowColor = "hsl(var(--primary))", intensity = "medium", children, ...props }, ref) => {
    const getIntensityClass = () => {
      switch (intensity) {
        case "low":
          return "hover:shadow-md";
        case "high":
          return "hover:shadow-2xl animate-glow";
        default:
          return "hover:shadow-lg hover-glow";
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "ripple transition-all duration-300",
          "border-2 border-transparent",
          "hover:border-primary/30",
          getIntensityClass(),
          className
        )}
        style={{
          boxShadow: intensity === "high" 
            ? `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`
            : undefined
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GlowingButton.displayName = "GlowingButton";

export default GlowingButton;
