"use client";

import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import type { CurrentlyReadingBook, BookItem } from "@/books/books-index";
import { images } from "@/constants/images";
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

export const CRBookHoverCard = ({
  book,
  x,
  y,
  progress: propProgress,
  totalPages: propTotalPages,
  percentage: propPercentage,
  className,
}: CRBookHoverCardProps) => {
  if (!book) return null;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";

  const country = ("country" in book && book.country) || "United States";

  const publishedYear =
    ("publishedYear" in book && book.publishedYear) ||
    ("firstPublishedYear" in book && book.firstPublishedYear) ||
    2015;

  const ticketImage =
    ("ticketImage" in book && book.ticketImage) ||
    ("coverImage" in book && book.coverImage) ||
    images.MIAFC1;

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
        style={TICKET_MASK_STYLE}
        className={cn("bg-[#F1F1F1] w-52 p-2", className)}
      >
        {/* Inner Grid Box with crisp black outline */}
        <div className="flex flex-col overflow-hidden border border-black">
          {/* Top Row: Currently reading */}
          <div className="flex h-5 items-center border-b border-black px-1">
            <span className="font-mona-sans text-[10px] font-bold tracking-tight text-black">
              Currently reading
            </span>
          </div>

          {/* Lower Grid (Left Column: Image & Country, Right Column: Title, Author, Year, Reading Progress) */}
          <div className="flex flex-row">
            {/* Left Column */}
            <div className="flex w-16 shrink-0 flex-col border-r border-black">
              {/* Ticket Image */}
              <div className="relative h-14.5 w-full overflow-hidden">
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

              {/* Reading Progress: Percentage & Pages read */}
              <div className="flex h-5 items-center justify-between border-t border-black px-1.5">
                <span className="font-mona-sans text-[9.5px] font-bold text-black tabular-nums">
                  {displayPercentage}%
                </span>
                <span className="font-mona-sans text-[9.5px] font-semibold text-black tabular-nums">
                  {progress}/{totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CRBookHoverCard;
