"use client";

import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { WishlistBook, BookItem } from "@/books/books-index";
import BookCover from "@/components/book-block/book-cover";
import GenrePill from "@/components/current-reads/genres-pill";
import WishlistHoverCard from "./wishlist-hover-card";
import { cn } from "@/lib/utils";

export interface WishListBlockProps {
  book: WishlistBook | BookItem;
  size?: number;
  className?: string;
}

// Balanced natural positions around the cover in a 6x6 block
const PILL_POSITIONS_A = [
  { top: "calc(var(--cell-size) * 0.6)", left: "calc(var(--cell-size) * 0.5)" },
  {
    top: "calc(var(--cell-size) * 1.4)",
    right: "calc(var(--cell-size) * 0.5)",
  },
  {
    bottom: "calc(var(--cell-size) * 0.6)",
    right: "calc(var(--cell-size) * 0.6)",
  },
];

const PILL_POSITIONS_B = [
  {
    top: "calc(var(--cell-size) * 0.6)",
    right: "calc(var(--cell-size) * 0.5)",
  },
  { top: "calc(var(--cell-size) * 1.4)", left: "calc(var(--cell-size) * 0.5)" },
  {
    bottom: "calc(var(--cell-size) * 0.6)",
    left: "calc(var(--cell-size) * 0.6)",
  },
];

export const WishListBlock = ({
  book,
  size = 6,
  className,
}: WishListBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });
  const springY = useSpring(mouseY, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });

  if (!book) return null;

  const isWishlist = book.status === "wishlist";
  const coverElement = book.layout?.find((el) => el.type === "cover");
  const widthClass = coverElement?.widthClass || "w-40";
  const rotation = coverElement?.rotation || "rotate-0";

  const genres: string[] =
    book &&
    "genres" in book &&
    Array.isArray(book.genres) &&
    book.genres.length > 0
      ? book.genres
      : [];

  const bookNum =
    parseInt(book?.id ? book.id.replace(/\D/g, "") : "1", 10) || 1;
  const pillPositions = bookNum % 2 === 1 ? PILL_POSITIONS_A : PILL_POSITIONS_B;

  const OFFSET_X = 20;
  const OFFSET_Y = 20;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + OFFSET_X;
      const y = e.clientY - rect.top + OFFSET_Y;
      mouseX.set(x);
      mouseY.set(y);
      springX.jump(x);
      springY.jump(y);
    }
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + OFFSET_X;
      const y = e.clientY - rect.top + OFFSET_Y;
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        setIsHovered(true);
      } else {
        mouseX.set(x);
        mouseY.set(y);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const amazonUrl = isWishlist
    ? (book as WishlistBook).amazonUrl?.trim() ||
      `https://www.amazon.in/s?k=${encodeURIComponent(`${book.title} ${book.author} book`)}`
    : undefined;

  return (
    <div
      ref={blockRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "w-cell-6 h-cell-6",
        "relative flex items-center justify-center select-none",
        isHovered && "z-50",
        className
      )}
      style={{
        width: `calc(var(--cell-size) * ${size})`,
        height: `calc(var(--cell-size) * ${size})`,
      }}
    >
      <div className="relative h-full w-full">
        {/* Book Cover Container */}
        <div className="bottom-cell-[1.05] absolute left-1/2 -translate-x-1/2">
          {isWishlist && amazonUrl ? (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block cursor-pointer"
            >
              <BookCover
                src={book.coverImage}
                alt={book.title}
                widthClass={widthClass}
                format={book.format}
                rotation={rotation}
              />
            </a>
          ) : (
            <BookCover
              src={book.coverImage}
              alt={book.title}
              widthClass={widthClass}
              format={book.format}
              rotation={rotation}
            />
          )}
        </div>

        {/* Hover elements: Genre Pills & Floating Cursor Card */}
        {isWishlist && (
          <AnimatePresence>
            {isHovered && (
              <>
                {genres.map((g, i) => {
                  const pos = pillPositions[i] || pillPositions[0];
                  return (
                    <motion.div
                      key={`wishlist-genre-${book.id}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={pos}
                      className="pointer-events-none absolute z-20"
                    >
                      <GenrePill genre={g} />
                    </motion.div>
                  );
                })}

                <WishlistHoverCard
                  book={book as WishlistBook}
                  x={springX}
                  y={springY}
                />
              </>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default WishListBlock;
