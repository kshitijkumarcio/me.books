"use client";

// global imports
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "motion/react";

// local imports
import { cn } from "@/lib/utils";
import { dotRows, dotVariants, easing016 } from "@/constants";
import icons from "@/constants/icons";
import { getReadBookById } from "@/books/books-index";
import FlipTextButton from "./ui-components/flip-text-button";
import { useOverlayButtons } from "@/hooks/layout-hooks/useoverlaybuttons";
import {
  useCanvasNavigation,
  CANVAS_ZONES,
} from "@/hooks/layout-hooks/usecanvasnavigation";
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

const OverlayNavigators = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isClosing, triggerClose } = useReadBookModal();

  const isReadBookRoute = Boolean(pathname?.includes("/read/"));
  const isShowingBookControls = isReadBookRoute && !isClosing;

  // Retrieve current book metadata based on URL if on a read book route
  let currentBook = undefined;
  if (isReadBookRoute && pathname) {
    const parts = pathname.split("/read/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentBook = getReadBookById(decodeURIComponent(idSegment));
    }
  }

  const handleCloseBook = () => {
    triggerClose(() => {
      router.back();
    });
  };

  const defaultBorrowMsg =
    currentBook?.borrowMessage ||
    (currentBook
      ? `hey Kshitij! Can I borrow ${currentBook.title} by ${currentBook.author} from you?`
      : "hey Kshitij! Can I borrow this book from you?");
  const borrowUrl =
    currentBook?.borrowUrl ||
    `https://wa.me/918208377317?text=${encodeURIComponent(defaultBorrowMsg)}`;

  const goodreadsUrl =
    currentBook?.goodreadsUrl ||
    (currentBook as any)?.goodreads ||
    (currentBook
      ? `https://www.goodreads.com/search?q=${encodeURIComponent(
          `${currentBook.title} ${currentBook.author}`
        )}`
      : "https://www.goodreads.com");

  const { toggleUseCase, toggleAbout, pageView, setPageView } =
    useOverlayButtons();
  const { isChaptersMenuOpen, toggleChaptersMenu, goToZone, activeZoneId } =
    useCanvasNavigation();

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
          <AnimatePresence mode="wait">
            {isShowingBookControls ? (
              <motion.div
                key="esc-button"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center"
              >
                <button
                  onClick={handleCloseBook}
                  type="button"
                  aria-label="Close book view"
                  className="group flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-70 focus:outline-none"
                >
                  <span className="font-mona-sans text-[13px] font-semibold text-black sm:text-[14px]">
                    Esc
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="main-nav-buttons"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="hidden gap-x-6 lg:flex"
              >
                <div
                  onClick={() => toggleAbout()}
                  className={cn("cursor-pointer")}
                >
                  <FlipTextButton>
                    <p
                      className={cn(
                        "font-mona-sans relative py-2 text-[14px] font-semibold"
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
                        "font-mona-sans relative py-2 text-[14px] font-semibold"
                      )}
                    >
                      use case.
                    </p>
                  </FlipTextButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
      <AnimatePresence>
        {!isShowingBookControls && (
          <motion.div
            key="moodboard-toggle"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
        <AnimatePresence mode="wait">
          {!isShowingBookControls ? (
            <motion.div
              key="main-bottom-buttons"
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
              className="flex items-center justify-center gap-x-3"
            >
              {/* Chapters Dropdown Popup */}
              {isChaptersMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto absolute bottom-14 z-50 mb-2 flex min-w-64 flex-col gap-1 rounded-md border border-black bg-white p-2 shadow-2xl"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Jump to Chapter
                  </div>
                  {CANVAS_ZONES.map((zone) => {
                    const isActive = activeZoneId === zone.id;
                    return (
                      <button
                        key={zone.id}
                        onClick={() => goToZone(zone.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded px-2.5 py-2 text-left transition-colors",
                          isActive
                            ? "bg-black text-white"
                            : "hover:bg-neon text-neutral-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-xs font-mono text-[11px] font-bold",
                            isActive
                              ? "bg-white text-black"
                              : "bg-neutral-200 text-neutral-700"
                          )}
                        >
                          {zone.number}
                        </span>
                        <div>
                          <p className="font-mona-sans text-[13px] leading-tight font-semibold">
                            {zone.title}
                          </p>
                          <p
                            className={cn(
                              "font-mona-sans text-[10px]",
                              isActive ? "text-neutral-300" : "text-neutral-500"
                            )}
                          >
                            {zone.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}

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
          ) : (
            <motion.div
              key="book-bottom-buttons"
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
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
                href={goodreadsUrl}
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
