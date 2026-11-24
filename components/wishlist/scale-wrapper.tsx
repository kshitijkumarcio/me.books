"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { easing022 } from "@/constants";
import { cn } from "@/lib/utils";

const HIDE_DURATION_MS = 700;

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
      duration: HIDE_DURATION_MS / 1000,
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
  const onCompleteRef = useRef(onScaleOutComplete);
  useEffect(() => {
    onCompleteRef.current = onScaleOutComplete;
  }, [onScaleOutComplete]);

  // Preempts ghost slots: if a book shifts rows mid-exit (remounting with
  // initial={false} + animate="hide"), Motion skips the animation and never
  // fires onAnimationComplete. This guarantees the slot always unmounts.
  useEffect(() => {
    if (!isScalingOut) return;

    const timer = setTimeout(() => {
      onCompleteRef.current?.();
    }, HIDE_DURATION_MS + 60);

    return () => clearTimeout(timer);
  }, [isScalingOut]);

  return (
    <motion.div
      variants={scaleVariants}
      initial={isNewlyMounted ? "hide" : false}
      animate={isScalingOut ? "hide" : "show"}
      onAnimationComplete={(definition) => {
        if (definition === "hide") {
          onCompleteRef.current?.();
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
