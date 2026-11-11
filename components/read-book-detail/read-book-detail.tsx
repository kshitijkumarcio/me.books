"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { ReadBook } from "@/books/books-index";
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

// Star Icon component
const StarRating = ({ rating = 4.5 }: { rating: number }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-center gap-1.5 select-none">
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <svg
            key={star}
            className="h-5 w-5 transition-transform hover:scale-110 sm:h-6 sm:w-6"
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
};

export const ReadBookDetail = ({
  book,
  isIntercepted = true,
}: ReadBookDetailProps) => {
  const router = useRouter();
  const { isClosing, triggerClose } = useReadBookModal();

  const handleClose = useCallback(() => {
    if (isIntercepted) {
      triggerClose(() => {
        router.back();
      });
    } else {
      router.push("/");
    }
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
      {/* Main Content Area - padded to clear the fixed overlay navigators */}
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 pt-24 pb-28 sm:px-8 sm:pt-28 sm:pb-32">
        <div className="flex w-full max-w-6xl flex-col items-center">
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
              <div className="mt-4 sm:mt-5">
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
