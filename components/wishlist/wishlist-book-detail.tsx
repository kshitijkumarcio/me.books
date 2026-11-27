"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { WishlistBook } from "@/books/books-index";
import GridCursorHighlighter from "@/components/ui-components/grid-cursor-highlighter";
import FullWidthPageTitle from "@/components/ui-components/full-width-page-title";
import {
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";
import { useWishlistBookDetail } from "@/hooks/layout-hooks/use-book-detail";
import { useAdaptiveGridCell } from "@/hooks/layout-hooks/use-adaptive-grid-cell";
import {
  PLACEHOLDER_QUOTE_WORDS,
  getMaskedSlideVariants,
} from "@/lib/read-book-detail-utils";

interface WishlistBookDetailProps {
  book: WishlistBook;
  /** If rendered inside modal interceptor vs direct standalone page */
  isIntercepted?: boolean;
}

export const WishlistBookDetail = ({
  book,
  isIntercepted = true,
}: WishlistBookDetailProps) => {
  const {
    isClosing,
    isDrawerClosing,
    drawerRef,
    heroContainerRef,
    showInlineCover,
    publishedDisplay,
  } = useWishlistBookDetail({ book, isIntercepted });
  const { mainRef, sectionRef, titleCells } = useAdaptiveGridCell<
    HTMLElement,
    HTMLElement
  >();

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
      <main
        ref={mainRef}
        className="bg-grid-dashed-accurate relative mx-auto min-h-dvh w-full max-w-[1920px]"
      >
        <GridCursorHighlighter dynamicGrid />

        {/* Above-the-fold Hero Section */}
        <section ref={sectionRef} className="relative z-10 min-h-dvh w-full">
          {/* Title Marquee */}
          <div
            style={{
              top: "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--title-top-cells, 2))",
            }}
            className="pointer-events-none absolute inset-x-0 w-full -translate-y-1"
          >
            <FullWidthPageTitle
              title={book.title}
              isIntercepted={isIntercepted}
              isClosing={isClosing}
              heightInCells={titleCells}
            />
          </div>

          {/* Book Cover */}
          <div
            ref={heroContainerRef}
            style={{
              top: "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--cover-bottom-cells, 6.7))",
            }}
            className="absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center justify-center select-none"
          >
            <div
              className={
                showInlineCover
                  ? "shadow-book relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                  : "pointer-events-none invisible"
              }
            >
              <Image
                src={book.coverImage}
                alt={showInlineCover ? book.title : ""}
                draggable={false}
                priority
                decoding="sync"
                sizes="(min-width: 768px) 320px, 224px"
                style={{
                  height:
                    "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--cover-cells, 5.8))",
                }}
                className="w-auto object-cover select-none"
              />
              {showInlineCover && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-2 bg-linear-to-r from-black/25 via-white/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset" />
                </>
              )}
            </div>
          </div>

          {/* Author, Reading Progress, Published Year row */}
          <div
            style={{
              top: "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--meta-row, 7))",
            }}
            className="h-cell absolute inset-x-0 grid w-full grid-cols-1 items-center gap-3 px-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 lg:px-6"
          >
            <div className="order-2 overflow-hidden sm:order-1 sm:justify-self-start">
              <motion.p
                {...getMaskedSlideVariants(isIntercepted, isClosing)}
                className="font-mona-sans py-0.5 text-center text-sm text-[16px] font-bold text-black sm:text-left sm:text-base lg:text-[20px]"
              >
                {book.author}
              </motion.p>
            </div>

            <div className="order-1"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <motion.div
                {...getMaskedSlideVariants(isIntercepted, isClosing)}
                className="flex flex-col items-center gap-1.5 py-0.5"
              >
                <div className="flex items-center"></div>
              </motion.div>
            </div>
            {publishedDisplay && (
              <div className="order-3 overflow-hidden sm:justify-self-end">
                <motion.p
                  {...getMaskedSlideVariants(isIntercepted, isClosing)}
                  className="font-mona-sans py-0.5 text-center text-sm text-[16px] font-bold text-black sm:text-right sm:text-base lg:text-[20px]"
                >
                  {publishedDisplay}&nbsp;&nbsp;
                  <span className="text-[13px] font-semibold lg:text-[14px]">
                    published
                  </span>
                </motion.p>
              </div>
            )}
          </div>

          {/* {tagItems.length > 0 && (
            <div
              style={{
                top: "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--keyword-row, 9))",
              }}
              className="absolute inset-x-0 w-full px-4 sm:px-6 lg:px-6"
            >
              <motion.div
                initial={{ opacity: isIntercepted ? 0 : 1 }}
                animate={{
                  opacity: isClosing ? 0 : 1,
                  transition: {
                    duration: isClosing ? 0.6 : 1,
                    delay: isClosing ? 0 : 0.2,
                    ease: easing065,
                  },
                }}
                className="h-cell relative flex w-full items-center rounded-lg border border-black bg-white"
              >
                <button
                  type="button"
                  onClick={() => handleScrollKeywords("left")}
                  aria-label="Scroll keywords left"
                  className="hover:from-neon hover:via-neon absolute top-0 left-0 z-10 flex aspect-2/1 h-full shrink-0 cursor-pointer items-center justify-start rounded-l-lg bg-linear-to-r from-white via-white to-transparent"
                >
                  <Image
                    src={icons.Chevron}
                    alt="left-chevron-icon"
                    className="ml-5 h-4 w-4"
                  />
                </button>

                <div
                  ref={keywordViewportRef}
                  className="flex flex-1 items-center overflow-hidden px-2 whitespace-nowrap"
                >
                  <motion.div
                    onPanStart={handleKeywordPanStart}
                    onPan={handleKeywordPan}
                    onPanEnd={handleKeywordPanEnd}
                    style={{ x: keywordX, touchAction: "pan-y" }}
                    className="flex w-max cursor-grab items-center select-none active:cursor-grabbing"
                  >
                    {Array.from({ length: keywordRepeatCount }).map(
                      (_, cycleIndex) => (
                        <div
                          key={cycleIndex}
                          ref={cycleIndex === 0 ? keywordCycleRef : undefined}
                          aria-hidden={cycleIndex > 0 ? true : undefined}
                          className="shrink-0"
                        >
                          <motion.div
                            initial={
                              isIntercepted ? { y: "100%" } : { y: "0%" }
                            }
                            animate={{
                              y: isClosing ? "100%" : "0%",
                              transition: {
                                duration: isClosing ? 0.6 : 1,
                                delay: isClosing ? 0 : 0.2,
                                ease: easing065,
                              },
                            }}
                            className="flex items-center gap-4 pr-4 sm:gap-12 sm:pr-12"
                          >
                            {tagItems.map((tag, index) => (
                              <React.Fragment
                                key={`${cycleIndex}-${tag}-${index}`}
                              >
                                <span className="font-mona-sans text-[20px] font-bold text-black">
                                  {tag}
                                </span>
                                <div
                                  aria-hidden="true"
                                  className="aspect-square h-2.5 shrink-0 rounded-full bg-black"
                                />
                              </React.Fragment>
                            ))}
                          </motion.div>
                        </div>
                      )
                    )}
                  </motion.div>
                </div>

                <button
                  type="button"
                  onClick={() => handleScrollKeywords("right")}
                  aria-label="Scroll keywords right"
                  className="hover:from-neon hover:via-neon absolute top-0 right-0 z-10 flex aspect-2/1 h-full shrink-0 cursor-pointer items-center justify-end rounded-r-lg bg-linear-to-l from-white via-white to-transparent"
                >
                  <Image
                    src={icons.Chevron}
                    alt="right-chevron-icon"
                    className="mr-5 h-4 w-4 rotate-180"
                  />
                </button>
              </motion.div>
            </div>
          )} */}

          {/* Centered Quote */}
          <div
            style={{
              top: "calc(var(--adaptive-cell-y, var(--cell-size)) * var(--quote-center-cells, 12))",
            }}
            className="font-mona-sans h-cell-2 absolute inset-x-0 flex w-full -translate-y-1/2 items-center justify-center px-4 sm:px-6 lg:px-6"
          >
            <p className="font-mona-sans flex max-w-2xl flex-wrap justify-center gap-x-[0.28em] text-center text-[16px] leading-relaxed font-bold text-black lg:text-[20px]">
              {PLACEHOLDER_QUOTE_WORDS.map((word, index) => (
                <span key={index} className="inline-block overflow-hidden">
                  <motion.span
                    {...getMaskedSlideVariants(isIntercepted, isClosing)}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </p>
          </div>

          {/* Scroll indicator: 1 adaptive cell from the bottom */}
          <div className="bottom-cell-1 pointer-events-none absolute inset-x-0 translate-y-1/2 overflow-hidden px-4 select-none sm:px-6 lg:px-6">
            <div className="flex w-full items-center justify-between py-0.5">
              <p className="font-mona-sans -translate-y-0.5 text-[13px] leading-none font-semibold text-black sm:text-[14px]">
                Thoughts below
              </p>

              <p className="font-mona-sans -translate-y-0.5 text-[13px] leading-none font-semibold text-black sm:text-[14px]">
                continue...
              </p>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default WishlistBookDetail;
