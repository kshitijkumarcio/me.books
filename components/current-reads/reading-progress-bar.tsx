"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface ReadingProgressBarProps {
  progress?: number;
  totalPages?: number;
  total_pages?: number;
  pagesRead?: number;
  className?: string;
  showText?: boolean;
  isHovered?: boolean;
}

export const ReadingProgressBar = ({
  progress = 0,
  totalPages = 100,
  total_pages,
  pagesRead,
  className,
  showText,
  isHovered,
}: ReadingProgressBarProps) => {
  const actualPagesRead = typeof pagesRead === "number" ? pagesRead : progress;
  const actualTotalPages =
    typeof total_pages === "number" && total_pages > 0
      ? total_pages
      : typeof totalPages === "number" && totalPages > 0
        ? totalPages
        : 100;

  const safeTotal = Math.max(1, actualTotalPages);
  const safeProgress = Math.min(safeTotal, Math.max(0, actualPagesRead));
  const percentage = Math.round((safeProgress / safeTotal) * 100);
  const isVisible = showText !== undefined ? showText : Boolean(isHovered);

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Capsule bar with rounded black border */}
      <div className="relative h-[calc(14px*var(--book-scale))] min-h-2.5 w-full rounded-full border-[1.5px] border-black bg-transparent p-[1.5px]">
        {/* Progress fill */}
        <div
          className="relative h-full overflow-hidden rounded-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Flash sheen animation on hover */}
          <AnimatePresence>
            {isHovered && percentage > 0 && (
              <motion.div
                key="progress-flash"
                initial={{ x: "-100%", skewX: -20, opacity: 0.8 }}
                animate={{ x: "130%", skewX: -20, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  x: { duration: 1, ease: [0.25, 1, 0.5, 1] },
                  opacity: { duration: 0.15 },
                }}
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 35%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.25) 65%, transparent 100%)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pages and percentage indicators */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="font-mona-sans pointer-events-none absolute top-full right-0 left-0 mt-[calc(6px*var(--book-scale))] flex w-full items-center justify-between text-[calc(12px*var(--book-scale))] leading-none font-semibold text-black"
          >
            <span className="tabular-nums">{safeProgress} of</span>
            <span className="tabular-nums">{safeTotal} pages</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadingProgressBar;
