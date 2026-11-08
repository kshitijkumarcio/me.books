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
import {
  type ActivePillState,
  getRandomSidePosition,
  createBookPRNG,
  getCoverConfig,
  getReadingProgress,
} from "./cr-block-geometry";

export interface CRBlockProps {
  book: CurrentlyReadingBook | BookItem;
  className?: string;
  size?: 6;
}

export const CRBlock = ({ book, className }: CRBlockProps) => {
  const { widthClass, rotation, cellWidth } = getCoverConfig(book);
  const { progress, totalPages } = getReadingProgress(book);

  // Extract review pills (3 pills) and genres (3 genres)
  const pills: CurrentlyReadingPill[] =
    book &&
    "pills" in book &&
    Array.isArray(book.pills) &&
    book.pills.length > 0
      ? book.pills
      : [
          {
            text: "magical & provoking",
            pill_classnames: "bg-[#FFE500] text-black shadow-xs",
            text_classnames: "text-black font-semibold",
          },
        ];

  const genres: string[] =
    book &&
    "genres" in book &&
    Array.isArray(book.genres) &&
    book.genres.length > 0
      ? book.genres
      : [book?.genre || "Fiction"];

  const bookNum =
    parseInt(book?.id ? book.id.replace(/\D/g, "") : "1", 10) || 1;
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
    const timer = setTimeout(() => {
      setReviewPill((prev) => ({
        ...prev,
        coord: getRandomSidePosition(prev.side),
      }));
      setGenrePill((prev) => ({
        ...prev,
        coord: getRandomSidePosition(prev.side),
      }));
    }, 0);
    return () => clearTimeout(timer);
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

  if (!book) return null;

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
