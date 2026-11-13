"use client";

import React, { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { WishlistBook } from "@/books/books-index";
import GridCursorHighlighter from "@/components/ui-components/grid-cursor-highlighter";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";

interface WishlistBookDetailProps {
  book: WishlistBook;
  /** If rendered inside modal interceptor vs direct standalone page */
  isIntercepted?: boolean;
}

export const WishlistBookDetail = ({
  book,
  isIntercepted = true,
}: WishlistBookDetailProps) => {
  const router = useRouter();
  const { isClosing, triggerClose, setIsInterceptedOpen } = useReadBookModal();
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

  if (!book) return null;

  const displayPrice = manualPrice || livePrice || "₹499";

  const isPriority =
    "priority" in book &&
    typeof book.priority === "string" &&
    book.priority.trim().length > 0 &&
    book.priority.toLowerCase() !== "normal";

  const displayTag = isPriority ? "Need this." : "Seems cool.";

  // Derived genres/tags fallback
  const genres =
    book.genres && book.genres.length > 0
      ? book.genres
      : book.genre
        ? book.genre.split("/").map((g) => g.trim())
        : ["Wishlist", "Books to Read"];

  // Derived paragraphs fallback
  const synopsisParagraphs: string[] = [
    `Currently on the wishlist: "${book.title}" by ${book.author}.`,
    isPriority
      ? `Marked as high priority — a title I'm eager to get my hands on next.`
      : `Discovered and added to the bookshelf wishlist (${displayTag.toLowerCase()}).`,
    `First published in ${book.publishedYear || 2024}${book.country ? ` (${book.country})` : ""}. Available in print and digital editions.`,
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
                <div key={idx} className={idx % 2 === 0 ? "md:translate-x-2" : "md:-translate-x-1"}>
                  <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                    {g}
                  </span>
                </div>
              ))}
            </div>

            {/* Center Column: Book Cover + Price & Amazon Button */}
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

              {/* Price, Status Tag & Amazon Action */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mona-sans rounded-md border border-black bg-white px-3 py-1 text-xs font-bold text-black tabular-nums shadow-xs sm:text-sm">
                    {displayPrice}
                  </span>
                  <span className="font-mona-sans rounded-md border border-black bg-white px-3 py-1 text-xs font-semibold text-black shadow-xs sm:text-sm">
                    {displayTag}
                  </span>
                </div>

                {book.amazonUrl && (
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mona-sans group inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 sm:text-sm"
                  >
                    <span>View on Amazon</span>
                    <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </a>
                )}
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

                {book.goodreadsUrl && (
                  <div className="pt-2">
                    <a
                      href={book.goodreadsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mona-sans inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 underline decoration-neutral-400 hover:text-black hover:decoration-black"
                    >
                      <span>View on Goodreads</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default WishlistBookDetail;
