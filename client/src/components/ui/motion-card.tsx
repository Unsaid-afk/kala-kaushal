import { forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Motion-specific props
  delay?: number;
  variant?: 'default' | 'enhanced' | 'gradient' | 'interactive';
  enableHover?: boolean;
  // Override framer-motion props to allow custom defaults
  initial?: MotionProps['initial'];
  animate?: MotionProps['animate'];
  transition?: MotionProps['transition'];
  whileHover?: MotionProps['whileHover'];
  whileTap?: MotionProps['whileTap'];
  whileInView?: MotionProps['whileInView'];
  whileFocus?: MotionProps['whileFocus'];
  whileDrag?: MotionProps['whileDrag'];
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ 
    className, 
    delay = 0, 
    variant = 'default', 
    enableHover = true, 
    children,
    // Motion props with defaults
    initial = { opacity: 0, y: 30, scale: 0.95 },
    animate = { opacity: 1, y: 0, scale: 1 },
    transition = { 
      duration: 0.6, 
      delay,
      type: "spring",
      stiffness: 100,
      damping: 15
    },
    whileHover = enableHover ? { 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.3 }
    } : undefined,
    whileTap = { scale: 0.98 },
    whileInView,
    whileFocus,
    whileDrag,
    // Extract all other HTML attributes for forwarding
    ...restProps
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'enhanced':
          return 'enhanced-hover glow-border';
        case 'gradient':
          return 'gradient-border interactive-glow';
        case 'interactive':
          return 'hover-glow interactive-glow';
        default:
          return 'glow-border hover-glow';
      }
    };

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Prepare motion props - disable if user prefers reduced motion
    const motionProps = prefersReducedMotion ? {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
      whileHover: undefined,
      whileTap: undefined,
      whileInView: undefined,
      whileFocus: undefined,
      whileDrag: undefined,
    } : {
      initial,
      animate,
      transition,
      whileHover,
      whileTap,
      ...(whileInView && { whileInView }),
      ...(whileFocus && { whileFocus }),
      ...(whileDrag && { whileDrag }),
    };

    // Forward all HTML attributes except motion-specific ones
    const forwardedCardProps = restProps;

    return (
      <motion.div
        ref={ref}
        {...motionProps}
      >
        <Card 
          className={cn(getVariantClasses(), className)}
          {...forwardedCardProps}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export default MotionCard;
export type { MotionCardProps };
