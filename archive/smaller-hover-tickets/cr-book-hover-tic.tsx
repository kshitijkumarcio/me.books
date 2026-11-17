"use client";

import { motion, type MotionValue } from "motion/react";
import type { CurrentlyReadingBook, BookItem } from "@/books/books-index";
import TicketStamp from "@/components/ui-components/ticket-stamp";
import useTicketPerforations from "@/hooks/ui-hooks/use-ticket-perforations";
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
  const { ticketRef, maskStyle } = useTicketPerforations();

  if (!book) return null;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";

  const publishedYear =
    ("publishedYear" in book && book.publishedYear) ||
    ("firstPublishedYear" in book && book.firstPublishedYear) ||
    2015;

  const progress =
    propProgress ??
    ("progress" in book && typeof book.progress === "number"
      ? book.progress
      : 0);

  const totalPages =
    propTotalPages ??
    ("total_pages" in book && typeof book.total_pages === "number"
      ? book.total_pages
      : 100);

  const displayPercentage =
    propPercentage ??
    (totalPages > 0 ? Math.round((progress / totalPages) * 100) : 0);

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pointer-events-none absolute top-0 left-0 z-50 select-none"
    >
      {/* Outer Ticket Container with Paper-cut Perforated Holes */}
      <div
        ref={ticketRef}
        style={maskStyle}
        className={cn(
          "bg-ticket-neon relative max-w-52 min-w-44 overflow-hidden p-2",
          className
        )}
      >
        {/* Faint Stamp */}
        <div className="pointer-events-none absolute -right-2 -bottom-5 z-0 select-none">
          <TicketStamp text="READING" />
        </div>

        {/* Inner Grid Box with crisp black outline */}
        <div className="relative z-10 flex flex-col overflow-hidden border border-black">
          {/* Title Row */}
          <div className="flex h-auto items-center px-2 py-1.5">
            <h4 className="font-mona-sans line-clamp-2 text-[14.5px] leading-[1.15] font-bold tracking-tight text-black">
              {title}
            </h4>
          </div>

          {/* Author & Year */}
          <div className="flex h-5.5 items-center justify-between border-t border-black px-2">
            <span className="font-mona-sans mr-1 max-w-31.25 truncate text-[10px] font-semibold text-black">
              {author}
            </span>
            <span className="font-mona-sans shrink-0 text-[10px] font-semibold text-black tabular-nums">
              {publishedYear}
            </span>
          </div>

          {/* Reading Progress: Percentage & Pages read */}
          <div className="flex h-5.5 items-center justify-between border-t border-black px-2">
            <span className="font-mona-sans text-[10px] font-bold text-black tabular-nums">
              {displayPercentage}%
            </span>
            <span className="font-mona-sans text-[10px] font-semibold text-black tabular-nums">
              {progress}/{totalPages}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CRBookHoverCard;
