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
import FullWidthPageTitle from "@/components/ui-components/full-width-page-title";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";
import { easing016 } from "@/constants";

interface ReadBookDetailProps {
  book: ReadBook;
  /** If rendered inside modal interceptor vs direct standalone page */
  isIntercepted?: boolean;
}

const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

// Star Icon component supporting fractional / partial star ratings up to 2 decimal places
const StarRating = ({
  rating = 4.5,
  isIntercepted,
  isClosing,
}: {
  rating: number;
  isIntercepted: boolean;
  isClosing: boolean;
}) => {
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
      {/* Stars row with masked reveal */}
      <div className="overflow-hidden">
        <motion.div
          initial={isIntercepted ? { y: "115%" } : { y: "0%" }}
          animate={{
            y: isClosing ? "115%" : "0%",
            transition: {
              duration: isClosing ? 1 : 0.6,
              delay: isClosing ? 0 : 0.6,
              ease: easing016,
            },
          }}
          className="flex items-center justify-center gap-1.5"
        >
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
        </motion.div>
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
  const {
    isClosing,
    isDrawerClosing,
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
        y: isDrawerClosing ? "100%" : "0%",
        clipPath: isDrawerClosing
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
      className="no-scrollbar fixed inset-0 isolate z-50 h-dvh w-dvw origin-top transform-gpu overflow-x-clip overflow-y-auto bg-white text-black will-change-[transform,clip-path] backface-hidden"
    >
      {/* Main Content Area - title top padded by 1 cell height, book cover centered at 45% viewport height */}
      <main className="bg-grid-dashed-accurate relative min-h-dvh w-full">
        <GridCursorHighlighter dynamicGrid />
        <div className="pt-cell pointer-events-none absolute inset-x-0 top-0 z-10">
          <FullWidthPageTitle
            title={book.title}
            isIntercepted={isIntercepted}
            isClosing={isClosing}
          />
        </div>

        {/* Center Column: Book Cover centered at 50% X, 45% Y + Stars below */}
        <div className="absolute top-[45%] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
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

          {/* Star Rating */}
          <div className="absolute top-full left-1/2 mt-4 w-max -translate-x-1/2 sm:mt-8">
            <StarRating
              rating={book.rating ?? 5}
              isIntercepted={isIntercepted}
              isClosing={isClosing}
            />
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default ReadBookDetail;
