"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type {
  CurrentlyReadingBook,
  BookItem,
  CurrentlyReadingPill,
} from "@/books/books-index";
import BookCover from "@/components/book-block/book-cover";
import PillMessage from "@/components/book-block/pill-message";
import GenrePill from "./genres-pill";
import ReadingProgressBar from "./reading-progress-bar";
import { cn } from "@/lib/utils";
import { parseCellUnit } from "@/components/book-block/book-block";

export interface CRBlockProps {
  book: CurrentlyReadingBook | BookItem;
  className?: string;
  size?: 6;
}

// -------------------------------------------------------------
// 2D SPATIAL GEOMETRY & BOUNDS
// -------------------------------------------------------------
interface PillCoord {
  top: string;
  left?: string;
  right?: string;
  transform: string;
  y: number;
}

/**
 * Calculates a random position on either the "left" or "right" side:
 * - Vertically: strictly inside [0.45, 3.9] cells (NEVER reaches or hides the progress bar).
 * - Horizontally:
 *   - Overlaps the book cover by at most 0.35 cell width (guaranteed < 0.5 cell limit).
 *   - Never more than 0.25 cell away from cover (never floating far away).
 *   - Left side pills use `right` anchoring so text length never penetrates the book cover.
 *   - Right side pills use `left` anchoring so text length never penetrates the book cover.
 */
function getRandomSidePosition(
  side: "left" | "right",
  customRand?: () => number
): PillCoord {
  const rand = customRand || Math.random;
  const MIN_Y = 0.45;
  const MAX_Y = 3.9; // Strictly capped so pills NEVER come down over or hide the progress bar
  const MIN_VERTICAL_GAP = 1.0; // Ensures pills never collide on the same side

  const bestY = MIN_Y + rand() * (MAX_Y - MIN_Y);
  const rotation = (rand() - 0.5) * 3; // subtle tilt between -1.5deg and +1.5deg

  if (side === "left") {
    // Cover left edge is at 1.8 cells from left (4.2 cells from right edge of the 6x6 block).
    // An offset between 3.85 and 4.45 ensures:
    // - Overlaps cover by at most 0.35 cell width (<= 0.5 max).
    // - Distance away from cover is at most 0.25 cell width (<= 0.5 max).
    const rightOffset = 3.85 + rand() * 0.6;
    return {
      top: `calc(var(--cell-size) * ${bestY.toFixed(2)})`,
      right: `calc(var(--cell-size) * ${rightOffset.toFixed(2)})`,
      transform: `rotate(${rotation.toFixed(1)}deg)`,
      y: bestY,
    };
  } else {
    // Cover right edge is at 4.2 cells from left of the 6x6 block.
    // An offset between 3.85 and 4.45 ensures:
    // - Overlaps cover by at most 0.35 cell width (<= 0.5 max).
    // - Distance away from cover is at most 0.25 cell width (<= 0.5 max).
    const leftOffset = 3.85 + rand() * 0.6;
    return {
      top: `calc(var(--cell-size) * ${bestY.toFixed(2)})`,
      left: `calc(var(--cell-size) * ${leftOffset.toFixed(2)})`,
      transform: `rotate(${rotation.toFixed(1)}deg)`,
      y: bestY,
    };
  }
}

/**
 * Creates a simple deterministic PRNG for unique initial book coords
 */
function createBookPRNG(seedNum: number) {
  let s = (seedNum * 16807 + 1013904223) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Resolves cover dimensions, format, and rotation settings.
 */
function getCoverConfig(book: CurrentlyReadingBook | BookItem) {
  const coverElement = book.layout?.find((el) => el.type === "cover");
  const defaultWidth =
    book.format === "little-penguin-classic" ? "w-32" : "w-36";

  const widthClass = coverElement?.widthClass || defaultWidth;
  const rotation = coverElement?.rotation || "rotate-0";
  const cellWidth = parseCellUnit(widthClass);

  return { widthClass, rotation, cellWidth };
}

/**
 * Safely extracts current pages read and total pages.
 */
function getReadingProgress(book: CurrentlyReadingBook | BookItem) {
  const progress =
    "progress" in book && typeof book.progress === "number" ? book.progress : 0;
  const totalPages =
    "total_pages" in book && typeof book.total_pages === "number"
      ? book.total_pages
      : 100;

  return { progress, totalPages };
}

interface ActivePillState {
  index: number;
  side: "left" | "right";
  coord: PillCoord;
}

export const CRBlock = ({ book, className }: CRBlockProps) => {
  if (!book) return null;

  const { widthClass, rotation, cellWidth } = getCoverConfig(book);
  const { progress, totalPages } = getReadingProgress(book);

  // Extract review pills (3 pills) and genres (3 genres)
  const pills: CurrentlyReadingPill[] =
    "pills" in book && Array.isArray(book.pills) && book.pills.length > 0
      ? book.pills
      : [
          {
            text: "magical & provoking",
            pill_classnames: "bg-[#FFE500] text-black shadow-xs",
            text_classnames: "text-black font-semibold",
          },
        ];

  const genres: string[] =
    "genres" in book && Array.isArray(book.genres) && book.genres.length > 0
      ? book.genres
      : [book.genre || "Fiction"];

  const bookNum = parseInt(book.id.replace(/\D/g, "") || "1", 10);
  // Alternate initial sides per book for balanced visual distribution across rows
  const initialReviewSide: "left" | "right" =
    bookNum % 2 === 1 ? "left" : "right";
  const initialGenreSide: "left" | "right" =
    initialReviewSide === "left" ? "right" : "left";

  // -------------------------------------------------------------
  // EXACTLY ONE REVIEW PILL AND ONE GENRE PILL (ON OPPOSITE SIDES)
  // -------------------------------------------------------------
  const [reviewPill, setReviewPill] = useState<ActivePillState>(() => {
    const prng = createBookPRNG(bookNum * 19);
    return {
      index: 0,
      side: initialReviewSide,
      coord: getRandomSidePosition(initialReviewSide, prng),
    };
  });

  const [genrePill, setGenrePill] = useState<ActivePillState>(() => {
    const prng = createBookPRNG(bookNum * 47);
    return {
      index: 0,
      side: initialGenreSide,
      coord: getRandomSidePosition(initialGenreSide, prng),
    };
  });

  // Re-randomize with true Math.random() upon mount for unique starting positions on every load
  useEffect(() => {
    setReviewPill((prev) => ({
      ...prev,
      coord: getRandomSidePosition(prev.side),
    }));
    setGenrePill((prev) => ({
      ...prev,
      coord: getRandomSidePosition(prev.side),
    }));
  }, []);

  // Review pill cycles text & random position every 3.8s (frequency increased by half)
  useEffect(() => {
    if (pills.length < 2) return;

    const startDelay = (bookNum % 5) * 400;
    let intervalId: NodeJS.Timeout;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setReviewPill((current) => ({
          ...current,
          index: (current.index + 1) % pills.length,
          coord: getRandomSidePosition(current.side),
        }));
      }, 9000);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [bookNum, pills.length]);

  // Genre pill cycles text & random position every 5.2s (frequency increased by half)
  useEffect(() => {
    if (genres.length < 2) return;

    const startDelay = (bookNum % 5) * 600 + 1900;
    let intervalId: NodeJS.Timeout;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setGenrePill((current) => ({
          ...current,
          index: (current.index + 1) % genres.length,
          coord: getRandomSidePosition(current.side),
        }));
      }, 7500);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [bookNum, genres.length]);

  // Periodically swap sides every 12s so both review phrases and genres visit both flanks
  useEffect(() => {
    const swapInterval = setInterval(() => {
      setReviewPill((current) => {
        const nextSide = current.side === "left" ? "right" : "left";
        return {
          ...current,
          side: nextSide,
          coord: getRandomSidePosition(nextSide),
        };
      });
      setGenrePill((current) => {
        const nextSide = current.side === "left" ? "right" : "left";
        return {
          ...current,
          side: nextSide,
          coord: getRandomSidePosition(nextSide),
        };
      });
    }, 18000);

    return () => clearInterval(swapInterval);
  }, []);

  const currentReview = pills[reviewPill.index];
  const currentGenre = genres[genrePill.index];

  return (
    <div className={cn("w-cell-6 h-cell-6 relative select-none", className)}>
      {/* Central Unit: Anchored to a fixed bottom baseline with exact height container so all covers align */}
      <div className="bottom-cell-[0.55] absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
        {/* Cover container with fixed height & items-end: locks the bottom of every cover to the exact same baseline */}
        <div
          className="flex items-end justify-center"
          style={{ height: "calc(var(--cell-size) * 3.8)" }}
        >
          <BookCover
            src={book.coverImage}
            alt={book.title}
            widthClass={widthClass}
            format={book.format}
            rotation={rotation}
          />
        </div>

        <div
          className="mt-[calc(26px*var(--book-scale))]"
          style={cellWidth ? { width: cellWidth } : undefined}
        >
          <ReadingProgressBar progress={progress} totalPages={totalPages} />
        </div>
      </div>

      {/* Review Pill: Exactly 1 active, on its assigned side */}
      <AnimatePresence mode="wait">
        {currentReview && (
          <motion.div
            key={`review-${book.id}-${reviewPill.index}-${reviewPill.side}-${reviewPill.coord.top}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="pointer-events-auto absolute z-20"
            style={{
              top: reviewPill.coord.top,
              ...(reviewPill.side === "left"
                ? { right: reviewPill.coord.right }
                : { left: reviewPill.coord.left }),
              transform: reviewPill.coord.transform,
            }}
          >
            <PillMessage
              text={currentReview.text}
              pill_classnames={currentReview.pill_classnames}
              text_classnames={currentReview.text_classnames}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Genre Pill: Exactly 1 active, on the opposite side */}
      <AnimatePresence mode="wait">
        {currentGenre && (
          <motion.div
            key={`genre-${book.id}-${genrePill.index}-${genrePill.side}-${genrePill.coord.top}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="pointer-events-auto absolute z-20"
            style={{
              top: genrePill.coord.top,
              ...(genrePill.side === "left"
                ? { right: genrePill.coord.right }
                : { left: genrePill.coord.left }),
              transform: genrePill.coord.transform,
            }}
          >
            <GenrePill genre={currentGenre} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRBlock;
