"use client";

// global imports
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "motion/react";

// local imports
import { cn } from "@/lib/utils";
import { dotRows, dotVariants, easing016, easing065 } from "@/constants";
import icons from "@/constants/icons";
import {
  getReadBookById,
  getCurrentReadBookById,
  getWishlistBookById,
} from "@/books/books-index";
import FlipTextButton from "./ui-components/flip-text-button";
import { useOverlayButtons } from "@/hooks/layout-hooks/useoverlaybuttons";
import { useCanvasNavigation } from "@/hooks/layout-hooks/usecanvasnavigation";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";

const ViewDotsIcon = ({
  pattern,
  transition,
}: {
  pattern: "moodboard" | "grid";
  transition: Transition;
}) => (
  <div className="flex flex-col gap-y-1">
    {dotRows.map((row, rowIdx) => (
      <div key={rowIdx} className="flex gap-x-1">
        {row.map((dotIdx) => (
          <motion.div
            key={dotIdx}
            variants={dotVariants[dotIdx]}
            animate={pattern}
            initial={pattern}
            transition={transition}
            className="aspect-square h-1 rounded-full bg-black"
          />
        ))}
      </div>
    ))}
  </div>
);

const AmazonIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M13.91 16.59c-3.23 2.38-7.85 3.65-11.91 1.05-.59-.38-.07-.94.49-.69 3.49 1.54 8.01 1.76 11.02-.36.46-.33.9.27.4.7z" />
    <path d="M14.92 15.54c-.41-.53-2.73-.25-3.77-.13-.31.04-.36-.23-.08-.43 1.83-1.32 4.83-.94 5.19-.48.36.46-.1 3.47-1.84 4.93-.27.23-.52.1-.4-.2.4-.98.9-3.69-.3-4.32z" />
    <path d="M14.39 12.35c-.09.7-.15 1.54-.73 2.01-.52.42-1.22.49-1.86.49-1.21 0-2.4-.49-2.58-1.86-.19-1.46.88-2.31 2.09-2.52.92-.16 2.22-.19 2.97-.24l.11 2.12zm1.88 4.22c-.17.18-.42.23-.63.14-.85-.36-1.02-1.24-1.07-2.1l-.05-.88c-.68.04-1.55.08-2.22.21-1.72.33-3.32 1.39-3.05 3.51.23 1.82 1.83 2.68 3.43 2.68 1.48 0 2.59-.57 3.25-1.57.06.33.09.68.14 1.02.04.28.24.49.52.49h1.49c.28 0 .49-.22.46-.5l-.75-4.43c-.15-.88-.16-1.95-.73-2.67-.85-1.07-2.18-1.37-3.48-1.37-2.21 0-4.18.99-4.57 3.32-.05.28.16.52.45.54l1.65.12c.24.02.46-.16.5-.4.23-1.27 1.15-1.82 2.22-1.82.91 0 1.83.33 2.08 1.29.17.65.1 1.34.1 2.02l-.01.85z" />
  </svg>
);

const OverlayNavigators = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isClosing, triggerClose, isInterceptedOpen } = useReadBookModal();

  const isReadBookRoute = Boolean(pathname?.includes("/read/"));
  const isReadingRoute = Boolean(pathname?.includes("/reading/"));
  const isWishlistRoute = Boolean(pathname?.includes("/wishlist/"));
  const isAnyModalRoute = isReadBookRoute || isReadingRoute || isWishlistRoute;
  const isShowingBookControls = isAnyModalRoute && !isClosing;

  // Retrieve current book metadata based on URL
  let currentReadBook = undefined;
  if (isReadBookRoute && pathname) {
    const parts = pathname.split("/read/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentReadBook = getReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentCRBook = undefined;
  if (isReadingRoute && pathname) {
    const parts = pathname.split("/reading/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentCRBook = getCurrentReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentWishlistBook = undefined;
  if (isWishlistRoute && pathname) {
    const parts = pathname.split("/wishlist/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentWishlistBook = getWishlistBookById(decodeURIComponent(idSegment));
    }
  }

  const handleCloseBook = () => {
    triggerClose(() => {
      if (isInterceptedOpen) {
        router.back();
      } else {
        router.push("/");
      }
    });
  };

  const defaultBorrowMsg =
    currentReadBook?.borrowMessage ||
    (currentReadBook
      ? `hey Kshitij! Can I borrow ${currentReadBook.title} by ${currentReadBook.author} from you?`
      : "hey Kshitij! Can I borrow this book from you?");
  const borrowUrl =
    currentReadBook?.borrowUrl ||
    `https://wa.me/918208377317?text=${encodeURIComponent(defaultBorrowMsg)}`;

  const readGoodreadsUrl =
    currentReadBook?.goodreadsUrl ||
    (currentReadBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentReadBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentReadBook.title} ${currentReadBook.author}`
        )}`
      : "https://www.goodreads.com");

  const crGoodreadsUrl =
    currentCRBook?.goodreadsUrl ||
    (currentCRBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentCRBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentCRBook.title} ${currentCRBook.author}`
        )}`
      : "https://www.goodreads.com");

  const wishlistAmazonUrl =
    currentWishlistBook?.amazonUrl?.trim() ||
    (currentWishlistBook
      ? `https://www.amazon.in/s?k=${encodeURIComponent(
          `${currentWishlistBook.title} ${currentWishlistBook.author} book`
        )}`
      : "https://www.amazon.in");

  const wishlistGoodreadsUrl =
    currentWishlistBook?.goodreadsUrl ||
    (currentWishlistBook as { goodreads?: string } | undefined)?.goodreads ||
    (currentWishlistBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentWishlistBook.title} ${currentWishlistBook.author}`
        )}`
      : "https://www.goodreads.com");

  const { toggleUseCase, toggleAbout, pageView, setPageView } =
    useOverlayButtons();
  const { toggleChaptersMenu } = useCanvasNavigation();

  const [isMoodboardHovered, setIsMoodboardHovered] = useState<boolean>(false);
  const [isMoodboardClickLocked, setIsMoodboardClickLocked] =
    useState<boolean>(false);

  // When hovering, effectiveHovered is true unless a click just locked the current view
  const effectiveHovered = isMoodboardHovered && !isMoodboardClickLocked;

  // The displayed text and dot pattern always match:
  // In moodboard mode: resting is moodboard (hexagon), hover is grid (3x3 grid)
  // In grid mode: resting is grid (3x3 grid), hover is moodboard (hexagon)
  const isShowingMoodboard =
    pageView === "moodboard" ? !effectiveHovered : effectiveHovered;
  const currentPattern = isShowingMoodboard ? "moodboard" : "grid";

  const dotTransition: Transition = {
    duration: isMoodboardClickLocked ? 0 : 0.8,
    ease: easing016,
  };

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-999 flex h-dvh w-full flex-col justify-between px-9 pt-6 pb-10 lg:px-6 lg:pt-4">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="">
          <p className="font-mona-sans text-[16px] font-bold lg:text-[20px]">
            kshelf.
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-x-6">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isShowingBookControls ? (
                <motion.div
                  key="esc-button"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "110%" }}
                  transition={{ duration: 0.45, ease: easing065 }}
                  className="flex items-center"
                >
                  <button
                    onClick={handleCloseBook}
                    type="button"
                    aria-label="Close book view"
                    className="group flex cursor-pointer items-center transition-opacity hover:opacity-70 focus:outline-none"
                  >
                    <span className="font-mona-sans text-[13px] font-semibold text-black sm:text-[14px]">
                      Esc
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="main-nav-buttons"
                  initial={{ y: "-110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-110%" }}
                  transition={{ duration: 0.45, ease: easing065 }}
                  className="hidden gap-x-6 lg:flex"
                >
                  <div
                    onClick={() => toggleAbout()}
                    className={cn("cursor-pointer")}
                  >
                    <FlipTextButton>
                      <p
                        className={cn(
                          "font-mona-sans relative text-[14px] font-semibold"
                        )}
                      >
                        about.
                      </p>
                    </FlipTextButton>
                  </div>
                  <div
                    className={cn("cursor-pointer")}
                    onClick={() => toggleUseCase()}
                  >
                    <FlipTextButton>
                      <p
                        className={cn(
                          "font-mona-sans relative text-[14px] font-semibold"
                        )}
                      >
                        use case.
                      </p>
                    </FlipTextButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* mobile dot pattern button (without text, hidden during read book route) */}
          {!isShowingBookControls && (
            <div
              onClick={() => {
                setPageView(pageView === "moodboard" ? "index" : "moodboard");
              }}
              className="hover:bg-neon/90 pointer-events-auto flex aspect-square h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200 lg:hidden"
            >
              <ViewDotsIcon
                pattern={currentPattern}
                transition={dotTransition}
              />
            </div>
          )}
        </div>
      </div>

      {/* Top Center Moodboard Toggle (Smoothly animated out during read book route) */}
      <AnimatePresence initial={false}>
        {!isShowingBookControls && (
          <motion.div
            key="moodboard-toggle"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 1, delay: 0.5, ease: easing016 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.4, ease: easing016 },
            }}
            onPointerEnter={() => {
              setIsMoodboardClickLocked(false);
              setIsMoodboardHovered(true);
            }}
            onPointerLeave={() => {
              setIsMoodboardClickLocked(false);
              setIsMoodboardHovered(false);
            }}
            onClick={() => {
              setIsMoodboardClickLocked(true);
              setPageView(pageView === "moodboard" ? "index" : "moodboard");
            }}
            className="group/vb pointer-events-auto absolute top-10 left-1/2 hidden -translate-x-1/2 cursor-pointer items-center justify-center gap-x-1 lg:flex"
          >
            <div className="group-hover/vb:bg-neon flex aspect-square h-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
              <ViewDotsIcon
                pattern={currentPattern}
                transition={dotTransition}
              />
            </div>
            <div className="group-hover/vb:bg-neon flex h-10 min-w-40 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
              <FlipTextButton
                isHovered={effectiveHovered}
                hoverText={
                  pageView === "moodboard" ? "grid view" : "moodboard view"
                }
              >
                <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
                  {pageView === "moodboard" ? "moodboard view" : "grid view"}
                </p>
              </FlipTextButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom buttons */}
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {!isShowingBookControls ? (
            <motion.div
              key="main-bottom-buttons"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.4, delay: 0.1, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.4, delay: 0.2, ease: easing016 },
              }}

              className="flex items-center justify-center gap-x-3"
            >
              {/* first button: chapters */}
              <div
                onClick={toggleChaptersMenu}
                className="group/nb pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="flex aspect-square w-10 flex-col items-center justify-center gap-y-[2.5px] rounded-sm bg-black">
                  <div className="h-[1.5px] w-4 bg-white"></div>
                  <div
                    className={cn(
                      "h-[1.5px] w-4 origin-center bg-white group-hover/nb:w-0",
                      "ease-[cubic-bezier(0.19, 1, 0.22, 1)] duration-500 transform-content"
                    )}
                  ></div>
                  <div className="h-[1.5px] w-4 bg-white"></div>
                </div>
                <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-white">
                      chapters
                    </p>
                  </FlipTextButton>
                </div>
              </div>

              {/* second button: curate */}
              <div className="group/fb pointer-events-auto flex cursor-pointer gap-x-1">
                <div className="group-hover/fb:bg-neon flex aspect-square w-10 flex-col items-center justify-center gap-y-1.25 rounded-sm border border-black bg-white transition-colors duration-200">
                  <div className="relative h-0.5 w-5 bg-black">
                    <div
                      className={cn(
                        "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                        "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                        "translate-x-1 transform-content group-hover/fb:translate-x-3"
                      )}
                    />
                  </div>
                  <div className="relative h-0.5 w-5 bg-black">
                    <div
                      className={cn(
                        "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                        "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                        "translate-x-3 transform-content group-hover/fb:translate-x-1"
                      )}
                    />
                  </div>
                  <div className="relative h-0.5 w-5 bg-black">
                    <div
                      className={cn(
                        "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                        "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                        "translate-x-0.75 transform-content group-hover/fb:translate-x-3"
                      )}
                    />
                  </div>
                </div>
                <div className="group-hover/fb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-black">
                      curate
                    </p>
                  </FlipTextButton>
                </div>
              </div>
            </motion.div>
          ) : isWishlistRoute ? (
            <motion.div
              key="wishlist-bottom-buttons"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3, delay: 0.2, ease: easing016 },
              }}
              className="flex items-center justify-center gap-x-3"
            >
              {/* first button: Amazon */}
              <a
                href={wishlistAmazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/ab pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="flex aspect-square w-10 items-center justify-center rounded-sm bg-black">
                  <AmazonIcon className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-white">
                      Amazon
                    </p>
                  </FlipTextButton>
                </div>
              </a>

              {/* second button: Goodreads */}
              <a
                href={wishlistGoodreadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
                  <Image
                    src={icons.GoodreadsIcon}
                    alt="goodreads"
                    width={20}
                    height={20}
                    className="h-4.5 w-4.5 object-contain"
                  />
                </div>
                <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-black">
                      Goodreads
                    </p>
                  </FlipTextButton>
                </div>
              </a>
            </motion.div>
          ) : isReadingRoute ? (
            <motion.div
              key="cr-bottom-buttons"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3, delay: 0.2, ease: easing016 },
              }}
              className="flex items-center justify-center gap-x-3"
            >
              {/* Single button: Goodreads */}
              <a
                href={crGoodreadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
                  <Image
                    src={icons.GoodreadsIcon}
                    alt="goodreads"
                    width={20}
                    height={20}
                    className="h-4.5 w-4.5 object-contain"
                  />
                </div>
                <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-black">
                      Goodreads
                    </p>
                  </FlipTextButton>
                </div>
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="book-bottom-buttons"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3, delay: 0.2, ease: easing016 },
              }}
              className="flex items-center justify-center gap-x-3"
            >
              {/* first button: borrow this book */}
              <a
                href={borrowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/bb pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="flex aspect-square w-10 items-center justify-center rounded-sm bg-black">
                  <Image
                    src={icons.WhatsappIcon}
                    alt="whatsapp"
                    width={20}
                    height={20}
                    className="h-4.5 w-4.5 object-contain"
                  />
                </div>
                <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-white">
                      Borrow this book
                    </p>
                  </FlipTextButton>
                </div>
              </a>

              {/* second button: Goodreads */}
              <a
                href={readGoodreadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/gb pointer-events-auto flex cursor-pointer gap-x-1"
              >
                <div className="group-hover/gb:bg-neon flex aspect-square w-10 items-center justify-center rounded-sm border border-black bg-white transition-colors duration-200">
                  <Image
                    src={icons.GoodreadsIcon}
                    alt="goodreads"
                    width={20}
                    height={20}
                    className="h-4.5 w-4.5 object-contain"
                  />
                </div>
                <div className="group-hover/gb:bg-neon flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4 transition-colors duration-200">
                  <FlipTextButton>
                    <p className="font-mona-sans text-[14px] font-semibold text-black">
                      Goodreads
                    </p>
                  </FlipTextButton>
                </div>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OverlayNavigators;
