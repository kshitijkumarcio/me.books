"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useOverlayButtons } from "@/hooks/layout-hooks/use-active-book-route";
import { easing022 } from "@/constants";
import { cn } from "@/lib/utils";

const variants: Variants = {
  show: {
    scale: 1,
    transition: { duration: 1, ease: easing022 },
  },
  hide: {
    scale: 0,
    transition: { duration: 1, ease: easing022 },
  },
};

interface ScaleWrapperProps {
  children?: ReactNode;
  className?: string;
  visibleOn?: "index" | "moodboard";
}

const ScaleWrapper = ({
  children,
  className,
  visibleOn = "moodboard",
}: ScaleWrapperProps) => {
  const { pageView } = useOverlayButtons();

  return (
    <motion.div
      variants={variants}
      initial={pageView === visibleOn ? "show" : "hide"}
      animate={pageView === visibleOn ? "show" : "hide"}
      style={{ originX: 0.5, originY: 0.5 }}
      className={cn("w-fit origin-center", className)}
    >
      {children}
    </motion.div>
  );
};

export default ScaleWrapper;
