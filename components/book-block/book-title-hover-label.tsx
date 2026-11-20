"use client";

import { motion, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export interface BookTitleHoverLabelProps {
  title: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
  price?: number;
  progress?: number;
  totalPages?: number;
  availability?: "Available" | "Taken" | "Not for borrowing";
  type?: "Wishlist" | "Current-read" | "Shelf";
}

export const BookTitleHoverLabel = ({
  title,
  x,
  y,
  className,
  price,
  progress,
  totalPages,
  type,
  availability,
}: BookTitleHoverLabelProps) => {
  const progressPercentage =
    progress !== undefined
      ? totalPages && totalPages > 0
        ? Math.round(
            (Math.min(totalPages, Math.max(0, progress)) / totalPages) * 100
          )
        : Math.round(progress)
      : undefined;

  const hasExtraInfo =
    (type === "Shelf" && !!availability) ||
    (type === "Current-read" && progressPercentage !== undefined) ||
    (type === "Wishlist" && price !== undefined);

  return (
    <motion.div
      style={{ x, y, zIndex: 999 }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="pointer-events-none absolute top-0 left-0 z-999 select-none"
    >
      <div
        data-book-hover-label
        className={cn(
          "bg-neon flex items-center gap-1.5 rounded-lg border border-black/50 py-1 pr-2 pl-2 whitespace-nowrap",
          className
        )}
      >
        <span className="font-mona-sans text-[18px] leading-none font-medium text-black">
          +
        </span>
        <span className="font-mona-sans max-w-64 truncate text-[12px] font-semibold text-black">
          {title}
        </span>

        {hasExtraInfo && (
          <div className="mx-1 aspect-square h-1 bg-black"></div>
        )}

        {type === "Shelf" && availability && (
          <span className="font-mona-sans max-w-60 truncate text-[12px] font-semibold text-black">
            {availability}
          </span>
        )}

        {type === "Current-read" && progressPercentage !== undefined && (
          <span className="font-mona-sans max-w-60 truncate text-[12px] font-semibold text-black">
            {progressPercentage}% finished
          </span>
        )}

        {type === "Wishlist" && price !== undefined && (
          <span className="font-mona-sans max-w-60 truncate text-[12px] font-semibold text-black">
            ~₹{price}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default BookTitleHoverLabel;
