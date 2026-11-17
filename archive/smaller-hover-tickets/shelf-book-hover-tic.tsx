"use client";

import { useId } from "react";
import { motion, type MotionValue } from "motion/react";
import type { BookItem, ReadBook } from "@/books/books-index";
import TicketStamp from "@/components/ui-components/ticket-stamp";
import useTicketPerforations from "@/hooks/ui-hooks/use-ticket-perforations";
import { cn } from "@/lib/utils";

export interface ShelfBookHoverCardProps {
  book: ReadBook | BookItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
}

const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

const DynamicStarRating = ({
  rating,
  baseId,
}: {
  rating: number;
  baseId: string;
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const fillFraction = Math.max(0, Math.min(1, rating - (star - 1)));
        const roundedFraction = Math.round(fillFraction * 100) / 100;

        if (roundedFraction >= 1) {
          // Fully filled star
          return (
            <svg
              key={star}
              className="h-2.5 w-2.5 text-black"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points={STAR_POINTS} />
            </svg>
          );
        }

        if (roundedFraction <= 0) {
          // Fully empty star
          return (
            <svg
              key={star}
              className="h-2.5 w-2.5 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points={STAR_POINTS} />
            </svg>
          );
        }

        // Dynamically partially filled star
        const clipId = `shelf-star-clip-${baseId}-${star}`;
        return (
          <svg
            key={star}
            className="h-2.5 w-2.5 text-black"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <rect x="0" y="0" width={roundedFraction} height="1" />
              </clipPath>
            </defs>
            <polygon
              points={STAR_POINTS}
              fill="currentColor"
              stroke="none"
              clipPath={`url(#${clipId})`}
            />
            <polygon points={STAR_POINTS} fill="none" />
          </svg>
        );
      })}
    </div>
  );
};

export const ShelfBookHoverCard = ({
  book,
  x,
  y,
  className,
}: ShelfBookHoverCardProps) => {
  const rawId = useId();
  const baseId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const { ticketRef, maskStyle } = useTicketPerforations();

  if (!book) return null;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";

  const publishedYear =
    ("publishedYear" in book && book.publishedYear) ||
    ("firstPublishedYear" in book && book.firstPublishedYear) ||
    ("yearRead" in book && book.yearRead) ||
    2024;

  const rating =
    "rating" in book && typeof book.rating === "number" ? book.rating : 4.5;

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
          <TicketStamp text="FINISHED" />
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

          {/* Star Rating & Numeric Value */}
          <div className="flex h-5.5 items-center justify-between border-t border-black px-2">
            <DynamicStarRating rating={rating} baseId={baseId} />
            <span className="font-mona-sans text-[10px] font-bold text-black tabular-nums">
              {Number(rating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShelfBookHoverCard;
