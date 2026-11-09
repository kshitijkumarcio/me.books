"use client";

import { motion, type MotionValue } from "motion/react";
import type { CurrentlyReadingBook, BookItem } from "@/books/books-index";
import { cn } from "@/lib/utils";

export interface CRBookHoverCardProps {
  book: CurrentlyReadingBook | BookItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
  progress?: number;
  totalPages?: number;
  percentage?: number;
  className?: string;
}

export const CRBookHoverCard = ({
  book,
  x,
  y,
  progress: propProgress,
  totalPages: propTotalPages,
  percentage: propPercentage,
  className,
}: CRBookHoverCardProps) => {
  const progress =
    propProgress ??
    ("progress" in book && typeof book.progress === "number"
      ? book.progress
      : 0);
  const totalPages =
    propTotalPages ??
    ("total_pages" in book && typeof book.total_pages === "number"
      ? book.total_pages
      : 0);
  const displayPercentage =
    propPercentage ??
    (totalPages > 0 ? Math.round((progress / totalPages) * 100) : 0);

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-none absolute top-0 left-0 z-50 select-none"
    >
      <div
        className={cn(
          "bg-neon flex items-center gap-2 rounded-lg border border-neutral-600 px-2 py-1 whitespace-nowrap",
          className
        )}
      >
        {/* Book Title & Progress */}
        <div className="flex items-center gap-1.5 leading-none">
          <div className="font-mona-sans gap-1 text-[12px] leading-none font-semibold text-black">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-[18px] leading-none font-medium">+</p>
                <p className="">{book.title}</p>
              </div>

              <div className="aspect-square h-1 bg-black" />
              <div className="flex items-center gap-1 font-mono leading-none">
                {displayPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CRBookHoverCard;
