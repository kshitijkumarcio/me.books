"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { CurrentlyReadingBook } from "@/books/books-index";
import GridCursorHighlighter from "@/components/ui-components/grid-cursor-highlighter";
import FullWidthPageTitle from "@/components/ui-components/full-width-page-title";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";
import { useDrawerLenis } from "@/hooks/layout-hooks/use-drawer-lenis";

interface CRBookDetailProps {
  book: CurrentlyReadingBook;
  /** If rendered inside modal interceptor vs direct standalone page */
  isIntercepted?: boolean;
}

export const CRBookDetail = ({
  book,
  isIntercepted = true,
}: CRBookDetailProps) => {
  const router = useRouter();
  const {
    isClosing,
    isDrawerClosing,
    triggerClose,
    setIsInterceptedOpen,
    clearActiveModal,
    setHeroCoverRect,
    transitionPhase,
    isCoverLayerPainted,
  } = useReadBookModal();
  const drawerRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useDrawerLenis(drawerRef, isIntercepted);

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
    if (!isIntercepted || !heroContainerRef.current || isClosing) return;
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
  }, [isIntercepted, isClosing, setHeroCoverRect]);

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

  const showInlineCover =
    !isIntercepted ||
    transitionPhase === "entered" ||
    (transitionPhase === "exiting" && !isCoverLayerPainted);

  // Derived reading progress
  const progress = typeof book.progress === "number" ? book.progress : 0;
  const totalPages =
    typeof book.total_pages === "number" && book.total_pages > 0
      ? book.total_pages
      : 100;
  const displayPercentage = Math.min(
    100,
    Math.max(0, Math.round((progress / totalPages) * 100))
  );

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
      ref={drawerRef}
      data-drawer="true"
      className="no-scrollbar fixed inset-0 isolate z-50 h-dvh w-dvw origin-top transform-gpu overflow-x-clip overflow-y-auto bg-white text-black will-change-[transform,clip-path] backface-hidden"
    >
      {/* Main Content Area - title top padded by 1 cell height, book cover centered at 45% viewport height */}
      <main className="bg-grid-dashed-accurate relative min-h-dvh w-full">
        <GridCursorHighlighter dynamicGrid />
        <div className="pt-cell pointer-events-none absolute inset-x-0 top-0 z-0">
          <FullWidthPageTitle
            title={book.title}
            isIntercepted={isIntercepted}
            isClosing={isClosing}
          />
        </div>

        {/* Center Column: Book Cover centered at 50% X, 45% Y + Reading Progress below */}
        <div className="absolute top-[45%] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          {/* Book Cover Container: Blank white space on intercepted route; real cover on standalone page */}
          <div
            ref={heroContainerRef}
            className="relative flex items-center justify-center select-none"
          >
            {showInlineCover ? (
              /* Standalone or settled book cover */
              <div className="shadow-book relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  draggable={false}
                  priority
                  decoding="sync"
                  sizes="(min-width: 1024px) 224px, (min-width: 640px) 208px, 176px"
                  className="h-auto w-44 object-cover select-none sm:w-52 lg:w-56"
                />
                <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-2 bg-linear-to-r from-black/25 via-white/20 to-transparent" />
              </div>
            ) : (
              /* Blank placeholder that reserves exact hero cover space during FLIP transition */
              <div className="pointer-events-none invisible">
                <Image
                  src={book.coverImage}
                  alt=""
                  draggable={false}
                  priority
                  decoding="sync"
                  sizes="(min-width: 1024px) 224px, (min-width: 640px) 208px, 176px"
                  className="h-auto w-44 object-cover sm:w-52 lg:w-56"
                />
              </div>
            )}
          </div>

          {/* Reading Progress Stats: Masked reveal */}
          <div className="absolute top-full left-1/2 mt-6 w-max -translate-x-1/2 overflow-hidden">
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
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="font-mona-sans text-base font-bold text-black tabular-nums sm:text-lg">
                  {displayPercentage}%
                </span>
                <div className="h-2 w-32 overflow-hidden rounded-full border border-black/80 bg-black/10 sm:w-40">
                  <div
                    className="h-full bg-black transition-all duration-500 ease-out"
                    style={{ width: `${displayPercentage}%` }}
                  />
                </div>
              </div>
              <span className="font-mona-sans text-xs font-semibold text-neutral-700 tabular-nums sm:text-sm">
                {progress} of {totalPages} pages read
              </span>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default CRBookDetail;
