"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useOverlayButtons } from "@/hooks/layout-hooks/useoverlaybuttons";
import { easing016, easing022 } from "@/constants";
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

interface VisibleByStateProps {
  children?: ReactNode;
  className?: string;
  visibleOn?: "index" | "moodboard";
}

const VisibleByState = ({
  children,
  className,
  visibleOn = "moodboard",
}: VisibleByStateProps) => {
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

export default VisibleByState;
