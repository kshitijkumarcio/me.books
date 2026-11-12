"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import type { WishlistBook, BookItem } from "@/books/books-index";
import { images } from "@/constants/images";
import { cn } from "@/lib/utils";

export interface WishlistHoverCardProps {
  book: WishlistBook | BookItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
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

export const WishlistHoverCard = ({
  book,
  x,
  y,
  className,
}: WishlistHoverCardProps) => {
  const [livePrice, setLivePrice] = useState<string | null>(null);

  const rawPrice = (book && "price" in book && book.price) ?? null;
  const manualPrice =
    rawPrice !== null && rawPrice !== undefined && rawPrice !== ""
      ? typeof rawPrice === "number"
        ? `₹${rawPrice}`
        : String(rawPrice).startsWith("₹")
          ? String(rawPrice)
          : `₹${rawPrice}`
      : null;

  const isbn = book && "isbn" in book ? book.isbn : undefined;

  useEffect(() => {
    if (manualPrice || !isbn) return;

    let isMounted = true;
    fetch(`/book-shelf/api/book-price?isbn=${encodeURIComponent(isbn)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.price) {
          setLivePrice(data.price);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isbn, manualPrice]);

  if (!book) return null;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";

  const country = ("country" in book && book.country) || "UK";

  const publishedYear =
    ("publishedYear" in book && book.publishedYear) ||
    ("firstPublishedYear" in book && book.firstPublishedYear) ||
    2026;

  const ticketImage =
    ("ticketImage" in book && book.ticketImage) ||
    ("coverImage" in book && book.coverImage) ||
    images.MIAFC1;

  const displayPrice = manualPrice || livePrice || "₹499";

  const isPriority =
    "priority" in book &&
    typeof book.priority === "string" &&
    book.priority.trim().length > 0 &&
    book.priority.toLowerCase() !== "normal";

  const displayTag = isPriority ? "Need this." : "Seems cool.";

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
          {/* Top Row: Wishlist. */}
          <div className="flex h-5 items-center border-b border-black px-1">
            <span className="font-mona-sans text-[10px] font-bold tracking-tight text-black">
              Wishlist.
            </span>
          </div>

          {/* Lower Grid (Left Column: Image & Country, Right Column: Title, Author, Year, Price, Note) */}
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
              <div className="flex h-5 items-center border-t border-black px-1">
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

              {/* Price & Tag */}
              <div className="flex h-5 items-center justify-between border-t border-black px-1.5">
                <span className="font-mona-sans text-[9.5px] font-bold text-black tabular-nums">
                  {displayPrice}
                </span>
                <span className="font-mona-sans max-w-23.75 truncate text-[9.5px] font-semibold text-black">
                  {displayTag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistHoverCard;
