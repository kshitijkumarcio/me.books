"use client";

import { useId } from "react";
import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import type { BookItem, ReadBook } from "@/books/books-index";
import { images } from "@/constants/images";
import { cn } from "@/lib/utils";

export interface ShelfBookHoverCardProps {
  book: ReadBook | BookItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
}

const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

// Paper-cut perforated ticket mask with see-through holes along all sides
const TICKET_MASK_STYLE: React.CSSProperties = (() => {
  const horizontalHoles = 18;
  const verticalHoles = 10;
  const holeRadius = "3px";

  const topGradients = Array.from({ length: horizontalHoles }).map((_, i) => {
    const position = 4 + i * (92 / (horizontalHoles - 1));
    return `radial-gradient(circle at ${position.toFixed(2)}% 0%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const bottomGradients = Array.from({ length: horizontalHoles }).map(
    (_, i) => {
      const position = 4 + i * (92 / (horizontalHoles - 1));
      return `radial-gradient(circle at ${position.toFixed(2)}% 100%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
    }
  );

  const leftGradients = Array.from({ length: verticalHoles }).map((_, i) => {
    const position = 6 + i * (88 / (verticalHoles - 1));
    return `radial-gradient(circle at 0% ${position.toFixed(2)}%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const rightGradients = Array.from({ length: verticalHoles }).map((_, i) => {
    const position = 6 + i * (88 / (verticalHoles - 1));
    return `radial-gradient(circle at 100% ${position.toFixed(2)}%, transparent 0, transparent ${holeRadius}, black ${holeRadius})`;
  });

  const maskImage = [
    ...topGradients,
    ...bottomGradients,
    ...leftGradients,
    ...rightGradients,
  ].join(",\n  ");

  return {
    maskImage,
    WebkitMaskImage: maskImage,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
})();

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

  if (!book) return null;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";

  const country = ("country" in book && book.country) || "International";

  const publishedYear =
    ("publishedYear" in book && book.publishedYear) ||
    ("firstPublishedYear" in book && book.firstPublishedYear) ||
    ("yearRead" in book && book.yearRead) ||
    2024;

  const rating =
    "rating" in book && typeof book.rating === "number" ? book.rating : 4.5;

  const ticketImage =
    ("ticketImage" in book && book.ticketImage) ||
    ("coverImage" in book && book.coverImage) ||
    images.MIAFC1;

  const genresList: string[] =
    book &&
    "genres" in book &&
    Array.isArray(book.genres) &&
    book.genres.length > 0
      ? book.genres
      : book?.genre
        ? book.genre
            .split("/")
            .map((g) => g.trim())
            .filter(Boolean)
        : ["Fiction"];

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
        style={TICKET_MASK_STYLE}
        className={cn("bg-neon w-52 p-2", className)}
      >
        {/* Inner Grid Box with crisp black outline */}
        <div className="bg-neon flex flex-col overflow-hidden border border-black">
          {/* Top Marquee Row (Genres) */}
          <div className="flex h-5 items-center border-b border-black px-1">
            <span className="font-mona-sans truncate text-[9.5px] font-bold tracking-tight text-black">
              Available for swap
            </span>
          </div>

          {/* Lower Grid (Left Column: Image & Country, Right Column: Title, Author, Year, Rating) */}
          <div className="flex flex-row">
            {/* Left Column */}
            <div className="flex w-16 shrink-0 flex-col border-r border-black">
              {/* Ticket Image */}
              <div className="bg-neon relative h-14.5 w-full overflow-hidden">
                <Image
                  src={ticketImage}
                  alt={title}
                  fill
                  className="object-cover mix-blend-multiply contrast-125 filter"
                  sizes="64px"
                />
              </div>

              {/* Country */}
              <div className="flex h-5 items-center border-t border-black px-1.5">
                <span className="font-mona-sans truncate text-[9.5px] font-bold tracking-tight text-black">
                  {country}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
              {/* Title */}
              <div className="flex min-h-9.5 flex-1 items-center px-1.5 py-1">
                <h4 className="font-mona-sans line-clamp-2 text-[12.5px] leading-[1.12] font-bold tracking-tight text-black">
                  {title}
                </h4>
              </div>

              {/* Author & Year */}
              <div className="flex h-5 items-center justify-between border-t border-black px-1.5">
                <span className="font-mona-sans mr-1 max-w-21.25 truncate text-[9.5px] font-semibold text-black">
                  {author}
                </span>
                <span className="font-mona-sans shrink-0 text-[9.5px] font-semibold text-black tabular-nums">
                  {publishedYear}
                </span>
              </div>

              {/* Star Rating & Numeric Value */}
              <div className="flex h-5 items-center justify-between border-t border-black px-1.5">
                <DynamicStarRating rating={rating} baseId={baseId} />
                <span className="font-mona-sans text-[9.5px] font-bold text-black tabular-nums">
                  {Number(rating).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShelfBookHoverCard;
