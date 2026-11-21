"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { easing022 } from "@/constants";
import { cn } from "@/lib/utils";

const scaleVariants: Variants = {
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1,
      ease: easing022,
    },
  },
  hide: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.7,
      ease: easing022,
    },
  },
};

export interface ScaleWrapperProps {
  children?: ReactNode;
  className?: string;
  isScalingOut?: boolean;
  isNewlyMounted?: boolean;
  onScaleOutComplete?: () => void;
}

export const ScaleWrapper = ({
  children,
  className,
  isScalingOut = false,
  isNewlyMounted = false,
  onScaleOutComplete,
}: ScaleWrapperProps) => {
  return (
    <motion.div
      variants={scaleVariants}
      initial={isNewlyMounted ? "hide" : false}
      animate={isScalingOut ? "hide" : "show"}
      onAnimationComplete={(definition) => {
        if (definition === "hide" && onScaleOutComplete) {
          onScaleOutComplete();
        }
      }}
      style={{ originX: 0.5, originY: 0.5 }}
      className={cn("w-fit origin-center", className)}
    >
      {children}
    </motion.div>
  );
};

export default ScaleWrapper;
