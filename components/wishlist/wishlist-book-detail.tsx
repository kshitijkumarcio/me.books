"use client";

import React, { useEffect, useCallback, useRef } from "react";
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
  const {
    isClosing,
    triggerClose,
    setIsInterceptedOpen,
    clearActiveModal,
    setHeroCoverRect,
    transitionPhase,
  } = useReadBookModal();
  const heroContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isIntercepted || !heroContainerRef.current) return;
    const heroEl = heroContainerRef.current;
    const drawerEl = heroEl.closest('[data-drawer="true"]');

    const measure = () => {
      const rect = heroEl.getBoundingClientRect();
      const drawerRect = drawerEl?.getBoundingClientRect();
      const drawerTop = drawerRect ? drawerRect.top : 0;
      const drawerLeft = drawerRect ? drawerRect.left : 0;

      setHeroCoverRect({
        top: Math.round(rect.top - drawerTop),
        left: Math.round(rect.left - drawerLeft),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isIntercepted, setHeroCoverRect]);

  const handleClose = useCallback(() => {
    triggerClose(() => {
      clearActiveModal();
      if (isIntercepted) {
        router.back();
      } else {
        router.push("/");
      }
    });
  }, [isIntercepted, triggerClose, router, clearActiveModal]);

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

  const displayPrice = book.price ? `~${book.price}` : "~500";

  const priorityNormalized =
    typeof book?.priority === "string"
      ? book.priority.trim().toLowerCase()
      : "";

  const displayTag =
    priorityNormalized === "top"
      ? "I need this!!"
      : priorityNormalized === "high"
        ? "I love this!"
        : "I like this.";

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
    priorityNormalized === "top"
      ? `Marked as top priority — a title I'm eager to get my hands on next.`
      : priorityNormalized === "high"
        ? `Marked as high priority — a title I'm excited to read soon.`
        : `Discovered and added to the bookshelf wishlist.`,
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
      data-drawer="true"
      className="bg-grid-dashed-accurate no-scrollbar fixed inset-0 isolate z-50 flex h-dvh w-dvw origin-top transform-gpu flex-col overflow-x-clip overflow-y-auto text-black will-change-[transform,clip-path] backface-hidden"
    >
      <GridCursorHighlighter dynamicGrid className="fixed inset-0" />

      {/* Main Content Area - padded to clear the fixed overlay navigators */}
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 pt-24 pb-28 sm:px-8 sm:pt-28 sm:pb-32">
        <div className="flex h-full w-full max-w-6xl flex-col items-center">
          {/* Title and Author Header: Staggered Masked Typography */}
          <div className="mb-8 text-center sm:mb-12">
            <div className="overflow-hidden">
              <motion.h1
                initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                animate={{
                  y: isClosing ? "115%" : "0%",
                  transition: {
                    duration: isClosing ? 0.22 : 0.6,
                    delay: isClosing ? 0 : 0.44,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                className="font-mona-sans text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
              >
                {book.title}
              </motion.h1>
            </div>
            <div className="mt-2 overflow-hidden">
              <motion.p
                initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                animate={{
                  y: isClosing ? "115%" : "0%",
                  transition: {
                    duration: isClosing ? 0.22 : 0.55,
                    delay: isClosing ? 0 : 0.51,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                className="font-mona-sans text-base font-medium text-neutral-800 sm:text-lg"
              >
                {book.author}
              </motion.p>
            </div>
          </div>

          {/* Three-Column Grid / Layout */}
          <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-14">
            {/* Left Column: Genre Tags (Staggered like in the design) */}
            <div className="flex flex-row flex-wrap justify-center gap-2.5 md:flex-col md:items-end md:gap-3">
              {genres[1] && (
                <div className="overflow-hidden">
                  <motion.div
                    initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                    animate={{
                      y: isClosing ? "115%" : "0%",
                      transition: {
                        duration: isClosing ? 0.22 : 0.5,
                        delay: isClosing ? 0 : 0.56,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    className="md:translate-x-4"
                  >
                    <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                      {genres[1]}
                    </span>
                  </motion.div>
                </div>
              )}
              {genres[0] && (
                <div className="overflow-hidden">
                  <motion.div
                    initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                    animate={{
                      y: isClosing ? "115%" : "0%",
                      transition: {
                        duration: isClosing ? 0.22 : 0.5,
                        delay: isClosing ? 0 : 0.61,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    className="md:-translate-x-2"
                  >
                    <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                      {genres[0]}
                    </span>
                  </motion.div>
                </div>
              )}
              {genres[2] && (
                <div className="overflow-hidden">
                  <motion.div
                    initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                    animate={{
                      y: isClosing ? "115%" : "0%",
                      transition: {
                        duration: isClosing ? 0.22 : 0.5,
                        delay: isClosing ? 0 : 0.66,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    className="md:translate-x-1"
                  >
                    <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                      {genres[2]}
                    </span>
                  </motion.div>
                </div>
              )}
              {/* Additional genres if any */}
              {genres.slice(3).map((g, idx) => (
                <div key={idx} className="overflow-hidden">
                  <motion.div
                    initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                    animate={{
                      y: isClosing ? "115%" : "0%",
                      transition: {
                        duration: isClosing ? 0.22 : 0.5,
                        delay: isClosing ? 0 : 0.7 + idx * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    className={
                      idx % 2 === 0 ? "md:translate-x-2" : "md:-translate-x-1"
                    }
                  >
                    <span className="font-mona-sans inline-block rounded-md border border-black/80 bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow-xs select-none sm:text-sm">
                      {g}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Center Column: Book Cover + Price & Amazon Button */}
            <div className="flex flex-col items-center">
              {/* Book Cover Container: Blank white space on intercepted route; real cover on standalone page */}
              <div
                ref={heroContainerRef}
                className="relative flex items-center justify-center select-none"
              >
                {isIntercepted ? (
                  /* Blank placeholder that reserves exact hero cover space for layout and measurement */
                  <div className="pointer-events-none invisible">
                    <Image
                      src={book.coverImage}
                      alt=""
                      draggable={false}
                      priority
                      className="h-auto w-44 object-cover sm:w-52 lg:w-56"
                    />
                  </div>
                ) : (
                  /* Standalone direct-visit book cover */
                  <div className="shadow-book relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      draggable={false}
                      priority
                      className="h-auto w-44 object-cover select-none sm:w-52 lg:w-56"
                    />
                    <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-2 bg-linear-to-r from-black/25 via-white/20 to-transparent" />
                  </div>
                )}
              </div>

              {/* Price, Status Tag & Amazon Action: Masked reveal */}
              <div className="mt-6 overflow-hidden">
                <motion.div
                  initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                  animate={{
                    y: isClosing ? "115%" : "0%",
                    transition: {
                      duration: isClosing ? 0.22 : 0.55,
                      delay: isClosing ? 0 : 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                  className="flex flex-col items-center gap-3"
                >
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
                      <span className="transition-transform group-hover:translate-x-0.5">
                        &rarr;
                      </span>
                    </a>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Right Column: Explanatory / Synopsis Paragraphs with Blue Underline */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <div className="mx-auto max-w-sm space-y-5 md:mx-0">
                {synopsisParagraphs.map((paragraph, idx) => (
                  <div key={idx} className="overflow-hidden">
                    <motion.p
                      initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                      animate={{
                        y: isClosing ? "115%" : "0%",
                        transition: {
                          duration: isClosing ? 0.22 : 0.55,
                          delay: isClosing ? 0 : 0.56 + idx * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }}
                      className="font-mona-sans text-[14px] leading-[1.8] font-normal text-black underline decoration-[#2b7fff] decoration-1 underline-offset-[5px] select-text sm:text-[15px]"
                    >
                      {paragraph}
                    </motion.p>
                  </div>
                ))}

                {book.goodreadsUrl && (
                  <div className="overflow-hidden pt-2">
                    <motion.div
                      initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
                      animate={{
                        y: isClosing ? "115%" : "0%",
                        transition: {
                          duration: isClosing ? 0.22 : 0.55,
                          delay: isClosing ? 0 : 0.72,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }}
                    >
                      <a
                        href={book.goodreadsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mona-sans inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 underline decoration-neutral-400 hover:text-black hover:decoration-black"
                      >
                        <span>View on Goodreads</span>
                        <span>&rarr;</span>
                      </a>
                    </motion.div>
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
