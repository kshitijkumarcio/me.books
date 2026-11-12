"use client";

import React, { useEffect, useCallback, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { ReadBook } from "@/books/books-index";
import GridCursorHighlighter from "@/components/ui-components/grid-cursor-highlighter";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";

interface ReadBookDetailProps {
  book: ReadBook;
  /** If rendered inside modal interceptor vs direct standalone page */
  isIntercepted?: boolean;
}

const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

// Star Icon component supporting fractional / partial star ratings up to 2 decimal places
const StarRating = ({ rating = 4.5 }: { rating: number }) => {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const stars = [1, 2, 3, 4, 5];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const OFFSET_X = 20;
  const OFFSET_Y = 20;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
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
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
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

  // Format rating in digits and decimals (e.g. 3.8, 4.25, or 5.0 for integers)
  const formattedRating = Number.isInteger(rating)
    ? rating.toFixed(1)
    : `${Math.round(rating * 100) / 100}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex cursor-default flex-col items-center justify-center select-none"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {/* Stars row */}
      <div className="flex items-center justify-center gap-1.5">
        {stars.map((star) => {
          // Calculate fill fraction for this specific star (0 to 1)
          // e.g. for star 4 with rating 3.68 -> (3.68 - 3) = 0.68 (68% width)
          const fillFraction = Math.max(0, Math.min(1, rating - (star - 1)));
          // Round to 2 decimal places to avoid floating point imprecision
          const roundedFraction = Math.round(fillFraction * 100) / 100;

          if (roundedFraction >= 1) {
            // Fully filled star
            return (
              <svg
                key={star}
                className="h-5 w-5 transition-transform hover:scale-110 sm:h-6 sm:w-6"
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
                className="h-5 w-5 transition-transform hover:scale-110 sm:h-6 sm:w-6"
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

          // Partially filled star (e.g. 0.68 width for rating 3.68)
          const clipId = `star-clip-${baseId}-${star}`;
          return (
            <svg
              key={star}
              className="h-5 w-5 transition-transform hover:scale-110 sm:h-6 sm:w-6"
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
              {/* Clipped filled portion of the star */}
              <polygon
                points={STAR_POINTS}
                fill="currentColor"
                stroke="none"
                clipPath={`url(#${clipId})`}
              />
              {/* Full outline of the star */}
              <polygon points={STAR_POINTS} fill="none" />
            </svg>
          );
        })}
      </div>

      {/* Floating cursor-following rating label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-none absolute top-0 left-0 z-50 select-none"
          >
            <div className="bg-neon flex items-center gap-2 rounded-lg border border-neutral-600 px-2 py-1.5 whitespace-nowrap">
              <div className="flex items-center gap-1.5 leading-none">
                <div className="font-mona-sans flex items-center gap-1.5 text-[14px] leading-none font-semibold text-black">
                  <p className="text-[16px] leading-none font-medium">+</p>
                  <p>{formattedRating}</p>
                  <p className="text-[16px] leading-none font-medium">+</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ReadBookDetail = ({
  book,
  isIntercepted = true,
}: ReadBookDetailProps) => {
  const router = useRouter();
  const { isClosing, triggerClose, setIsInterceptedOpen } = useReadBookModal();

  useEffect(() => {
    if (isIntercepted) {
      setIsInterceptedOpen(true);
      return () => {
        setIsInterceptedOpen(false);
      };
    } else {
      setIsInterceptedOpen(false);
    }
  }, [isIntercepted, setIsInterceptedOpen]);

  const handleClose = useCallback(() => {
    triggerClose(() => {
      if (isIntercepted) {
        router.back();
      } else {
        router.push("/");
      }
    });
  }, [isIntercepted, triggerClose, router]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Derived genres/tags fallback
  const genres =
    book.genres && book.genres.length > 0
      ? book.genres
      : book.genre
        ? book.genre.split("/").map((g) => g.trim())
        : ["Classic", "Literature"];

  // Derived synopsis fallback
  const synopsisParagraphs: string[] = Array.isArray(book.synopsis)
    ? book.synopsis
    : book.synopsis
      ? [book.synopsis]
      : [
          `A profound exploration of human connection, memory, and longing by ${book.author}.`,
          `Set against a poignant historical backdrop, this masterpiece captures quiet intensity and emotional vulnerability at every turn.`,
          `An unforgettable read from my bookshelf that lingers long after turning the final page.`,
        ];

  return (
    <motion.div
      initial={
        isIntercepted
          ? {
              y: "100%",
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }
          : {
              y: "0%",
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }
      }
      animate={{
        y: isClosing ? "100%" : "0%",
        clipPath: isClosing
          ? "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
          : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transition: {
          duration: READ_BOOK_TRANSITION_DURATION,
          ease: READ_BOOK_TRANSITION_EASE,
        },
      }}
      style={{
        transformOrigin: "top",
        willChange: "transform, clip-path",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      className="bg-grid-dashed-accurate no-scrollbar fixed inset-0 isolate z-50 flex h-dvh w-dvw origin-top transform-gpu flex-col overflow-x-clip overflow-y-auto text-black will-change-[transform,clip-path] backface-hidden"
    >
      <GridCursorHighlighter dynamicGrid className="fixed inset-0" />

      {/* Main Content Area - padded to clear the fixed overlay navigators */}
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 pt-24 pb-28 sm:px-8 sm:pt-28 sm:pb-32">
        <div className="flex h-full w-full max-w-6xl flex-col items-center">
          {/* Title and Author Header */}
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="font-mona-sans text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              {book.title}
            </h1>
            <p className="font-mona-sans mt-2 text-base font-medium text-neutral-800 sm:text-lg">
              {book.author}
            </p>
          </div>

          {/* Three-Column Grid / Layout */}
          <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-14">
            {/* Left Column: Genre Tags (Staggered like in the design) */}
            <div className="flex flex-row flex-wrap justify-center gap-2.5 md:flex-col md:items-end md:gap-3">
              {genres[1] && (
                <div className="md:translate-x-4">
                  <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                    {genres[1]}
                  </span>
                </div>
              )}
              {genres[0] && (
                <div className="md:-translate-x-2">
                  <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                    {genres[0]}
                  </span>
                </div>
              )}
              {genres[2] && (
                <div className="md:translate-x-1">
                  <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                    {genres[2]}
                  </span>
                </div>
              )}
              {/* Additional genres if any */}
              {genres.slice(3).map((g, idx) => (
                <div key={idx}>
                  <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                    {g}
                  </span>
                </div>
              ))}
            </div>

            {/* Center Column: Book Cover + Stars */}
            <div className="flex flex-col items-center">
              {/* Book Cover */}
              <div className="shadow-book relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  draggable={false}
                  priority
                  className="h-auto w-44 object-cover select-none sm:w-52 lg:w-56"
                />
                {/* Subtle spine glare */}
                <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-2 bg-linear-to-r from-black/25 via-white/20 to-transparent" />
              </div>

              {/* Star Rating */}
              <div className="mt-4 sm:mt-8">
                <StarRating rating={book.rating ?? 5} />
              </div>
            </div>

            {/* Right Column: Explanatory / Synopsis Paragraphs with Blue Underline */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <div className="mx-auto max-w-sm space-y-5 md:mx-0">
                {synopsisParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="font-mona-sans text-[14px] leading-[1.8] font-normal text-black underline decoration-[#2b7fff] decoration-1 underline-offset-[5px] select-text sm:text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default ReadBookDetail;
