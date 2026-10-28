"use client";

import { cn } from "@/lib/utils";

export type GapType = "horizontal" | "vertical" | "intersection";

interface ShelfGapProps {
  type: GapType;
  rowIdx?: number;
  colIdx?: number;
  gapSize?: number; // In cells: 1 or 2
  className?: string;
  label?: string;
}

export const ShelfGap = ({
  type,
  rowIdx,
  colIdx,
  gapSize = 1,
  className,
  label,
}: ShelfGapProps) => {
  return (
    <div
      className={cn("relative flex h-full w-full items-center select-none")}
    ></div>
  );
};

export default ShelfGap;
