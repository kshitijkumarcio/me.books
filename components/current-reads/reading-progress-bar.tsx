"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ReadingProgressBarProps {
  progress?: number;
  totalPages?: number;
  className?: string;
  showText?: boolean;
}

export const ReadingProgressBar = ({
  progress = 0,
  totalPages = 100,
  className,
}: ReadingProgressBarProps) => {
  const safeTotal = Math.max(1, totalPages);
  const safeProgress = Math.min(safeTotal, Math.max(0, progress));
  const percentage = Math.round((safeProgress / safeTotal) * 100);
  // const formattedPercentage = String(percentage).padStart(2, "0");

  return (
    <div className={cn("w-full select-none", className)}>
      {/* Capsule bar with rounded black border */}
      <div className="relative h-[calc(14px*var(--book-scale))] min-h-2.5 w-full rounded-full border-[1.5px] border-black bg-transparent p-[1.5px]">
        {/* Progress fill */}
        <div
          className="h-full rounded-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Pages and percentage indicators */}
      {/* {showText && (
        <div className="mt-[calc(6px*var(--book-scale))] flex w-full items-center justify-between font-mona-sans uppercase text-[calc(12px*var(--book-scale))] leading-none font-[600] text-black">
          <span>
            progress
          </span>
          <span>{formattedPercentage}%</span>
        </div>
      )} */}
    </div>
  );
};

export default ReadingProgressBar;
