"use client";

import { motion, type MotionValue } from "motion/react";
import type { BookItem, ReadBook } from "@/books/books-index";
import { cn } from "@/lib/utils";

export interface ShelfBookHoverCardProps {
  book: ReadBook | BookItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
}

export const ShelfBookHoverCard = ({
  book,
  x,
  y,
  className,
}: ShelfBookHoverCardProps) => {
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
        {/* Book Title */}
        <div className="flex items-center gap-1.5 leading-none">
          <div className="font-mona-sans gap-1 text-[12px] leading-none font-semibold text-black">
            <div className="flex items-center gap-1.5">
              <p className="text-[18px] leading-none font-medium">+</p>
              <p className="">{book.title}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShelfBookHoverCard;
