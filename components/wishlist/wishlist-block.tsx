"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { WishlistBook, BookItem } from "@/books/books-index";
import BookCover from "@/components/book-block/book-cover";
import GenrePill from "@/components/current-reads/genres-pill";
import {
  getRandomSidePosition,
  type PillCoord,
} from "@/components/current-reads/cr-block-geometry";
import WishlistHoverCard from "./wishlist-hover-card";
import { calculateHoverCardPosition } from "@/lib/hover-card-utils";
import { cn } from "@/lib/utils";

export interface WishListBlockProps {
  book: WishlistBook | BookItem;
  size?: number;
  className?: string;
}

interface ActiveWishlistPill {
  genre: string;
  coord: PillCoord;
  key: string;
}

export const WishListBlock = ({
  book,
  size = 6,
  className,
}: WishListBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [leftPill, setLeftPill] = useState<ActiveWishlistPill | null>(null);
  const [rightPill, setRightPill] = useState<ActiveWishlistPill | null>(null);
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

  const isWishlist = book?.status === "wishlist";
  const coverElement = book?.layout?.find((el) => el.type === "cover");
  const widthClass = coverElement?.widthClass || "w-40";
  const rotation = coverElement?.rotation || "rotate-0";

  const availableGenres = useMemo(() => {
    if (
      book &&
      "genres" in book &&
      Array.isArray(book.genres) &&
      book.genres.length > 0
    ) {
      return book.genres;
    }
    if (book?.genre) {
      const parts = book.genre
        .split("/")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (parts.length >= 2) return parts;
      if (parts.length === 1) return [parts[0], "wishlist"];
    }
    return ["must read", "wishlist"];
  }, [book]);

  const spawnHoverPills = useCallback(() => {
    if (availableGenres.length === 0) return;

    // Pick two distinct genre indices
    const idx1 = Math.floor(Math.random() * availableGenres.length);
    let idx2 = Math.floor(Math.random() * (availableGenres.length - 1));
    if (idx2 >= idx1) idx2 = (idx2 + 1) % availableGenres.length;

    // Side position ranges: vertically 0.6 to 3.8 cells, flanking either side
    const leftCoord = getRandomSidePosition("left", undefined, 0.6, 3.8);
    let rightCoord = getRandomSidePosition("right", undefined, 0.6, 3.8);

    // Stagger heights so both sides are not at the same vertical level
    let attempts = 0;
    while (Math.abs(leftCoord.y - rightCoord.y) < 0.7 && attempts < 5) {
      rightCoord = getRandomSidePosition("right", undefined, 0.6, 3.8);
      attempts++;
    }

    const stamp = Date.now();
    setLeftPill({
      genre: availableGenres[idx1],
      coord: leftCoord,
      key: `left-${stamp}`,
    });
    setRightPill({
      genre: availableGenres[idx2],
      coord: rightCoord,
      key: `right-${stamp}`,
    });
  }, [availableGenres]);

  // Periodically cycle one pill if user stays hovered and there are 3+ genres
  useEffect(() => {
    if (!isHovered || availableGenres.length <= 2) return;

    let activeSide: "left" | "right" = "left";
    const interval = setInterval(() => {
      const sideToUpdate = activeSide;
      activeSide = activeSide === "left" ? "right" : "left";

      if (sideToUpdate === "left") {
        setLeftPill((current) => {
          const currentGenre = current?.genre;
          const otherGenre = rightPill?.genre;
          const candidates = availableGenres.filter(
            (g) => g !== currentGenre && g !== otherGenre
          );
          const nextGenre =
            candidates[Math.floor(Math.random() * candidates.length)] ||
            availableGenres[0];
          return {
            genre: nextGenre,
            coord: getRandomSidePosition("left", undefined, 0.6, 3.8),
            key: `left-${Date.now()}`,
          };
        });
      } else {
        setRightPill((current) => {
          const currentGenre = current?.genre;
          const otherGenre = leftPill?.genre;
          const candidates = availableGenres.filter(
            (g) => g !== currentGenre && g !== otherGenre
          );
          const nextGenre =
            candidates[Math.floor(Math.random() * candidates.length)] ||
            availableGenres[1 % availableGenres.length];
          return {
            genre: nextGenre,
            coord: getRandomSidePosition("right", undefined, 0.6, 3.8),
            key: `right-${Date.now()}`,
          };
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, availableGenres, leftPill?.genre, rightPill?.genre]);

  if (!book) return null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      mouseX.set(x);
      mouseY.set(y);
      springX.jump(x);
      springY.jump(y);
    }
    spawnHoverPills();
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        spawnHoverPills();
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
          <BookCover
            src={book.coverImage}
            alt={book.title}
            widthClass={widthClass}
            format={book.format}
            rotation={rotation}
            href={`/wishlist/${book.id}`}
          />
        </div>

        {/* Hover elements: Genre Pills (one on each side) & Floating Cursor Card */}
        {isWishlist && (
          <AnimatePresence>
            {isHovered && leftPill && (
              <motion.div
                key={`wishlist-left-${book.id}-${leftPill.key}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  top: leftPill.coord.top,
                  right: leftPill.coord.right,
                  transform: leftPill.coord.transform,
                }}
                className="pointer-events-none absolute z-20"
              >
                <GenrePill genre={leftPill.genre} />
              </motion.div>
            )}

            {isHovered && rightPill && (
              <motion.div
                key={`wishlist-right-${book.id}-${rightPill.key}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  top: rightPill.coord.top,
                  left: rightPill.coord.left,
                  transform: rightPill.coord.transform,
                }}
                className="pointer-events-none absolute z-20"
              >
                <GenrePill genre={rightPill.genre} />
              </motion.div>
            )}

            {isHovered && (
              <WishlistHoverCard
                book={book as WishlistBook}
                x={springX}
                y={springY}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default WishListBlock;
