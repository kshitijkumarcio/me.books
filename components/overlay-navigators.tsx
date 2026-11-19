"use client";

// global imports
import { useState, useRef, useEffect, useMemo } from "react";
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
  type ReadBook,
  type CurrentlyReadingBook,
  type WishlistBook,
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

const ChaptersIcon = ({
  isOpen = false,
  isParentHovered = false,
}: {
  isOpen?: boolean;
  isParentHovered?: boolean;
}) => {
  const isHovered = !isOpen && isParentHovered;

  return (
    <div className="relative flex h-4 w-4 items-center justify-center">
      {/* Broken Rounded Square (visible when closed, rotates and scales out when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 0, rotate: 45, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="pointer-events-none absolute inset-0"
      >
        {/* Center Filled Square - visible at rest (non-hovered), scales down and fades out on hover */}
        <div
          className={cn(
            "absolute inset-0 m-auto aspect-square h-2 w-2 rounded-xs bg-current",
            "origin-center transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "scale-0 opacity-0"
              : "scale-100 opacity-100 group-hover/chapters:scale-0 group-hover/chapters:opacity-0"
          )}
        />

        {/* Top-Left Corner */}
        <div
          className={cn(
            "absolute top-0 left-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[3.75px] translate-y-[3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.75 5.5 V 2.5 C 0.75 1.5 1.5 0.75 2.5 0.75 H 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Top-Right Corner */}
        <div
          className={cn(
            "absolute top-0 right-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[-3.75px] translate-y-[3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.5 0.75 H 3.5 C 4.5 0.75 5.25 1.5 5.25 2.5 V 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Bottom-Left Corner */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[3.75px] translate-y-[-3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.75 0.5 V 3.5 C 0.75 4.5 1.5 5.25 2.5 5.25 H 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Bottom-Right Corner */}
        <div
          className={cn(
            "absolute right-0 bottom-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[-3.75px] translate-y-[-3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.5 5.25 H 3.5 C 4.5 5.25 5.25 4.5 5.25 3.5 V 0.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </motion.div>

      {/* Close Cross Icon (scales and rotates in when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/close:rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};

const GENRE_OPTIONS = [
  "all",
  "sci-fi",
  "fiction",
  "philosophy",
  "dystopian",
  "thriller",
];

const LENGTH_OPTIONS = [
  { id: "all", label: "all" },
  { id: "short", label: "< 250p" },
  { id: "medium", label: "250-450p" },
  { id: "long", label: "450p+" },
];

const CurateIcon = ({
  isOpen = false,
  isParentHovered = false,
}: {
  isOpen?: boolean;
  isParentHovered?: boolean;
}) => {
  const isHovered = !isOpen && isParentHovered;

  return (
    <div className="relative flex aspect-square w-10 items-center justify-center">
      {/* Sliders Icon (visible when closed, rotates and scales out when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 0, rotate: 45, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-y-1.25"
      >
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "ease-[cubic-bezier(0.19,1,0.22,1)] transition-transform duration-500",
              isHovered
                ? "translate-x-3"
                : "translate-x-1 group-hover/curate:translate-x-3"
            )}
          />
        </div>
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "ease-[cubic-bezier(0.19,1,0.22,1)] transition-transform duration-500",
              isHovered
                ? "translate-x-1"
                : "translate-x-3 group-hover/curate:translate-x-1"
            )}
          />
        </div>
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "ease-[cubic-bezier(0.19,1,0.22,1)] transition-transform duration-500",
              isHovered
                ? "translate-x-3"
                : "translate-x-0.75 group-hover/curate:translate-x-3"
            )}
          />
        </div>
      </motion.div>

      {/* Close Cross Icon (scales and rotates in when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/curateclose:rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};

const OverlayNavigators = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isClosing,
    triggerClose,
    isInterceptedOpen,
    activeModal,
    clearActiveModal,
  } = useReadBookModal();

  const isReadBookRoute =
    Boolean(pathname?.includes("/read/")) || activeModal?.type === "read";
  const isReadingRoute =
    Boolean(pathname?.includes("/reading/")) || activeModal?.type === "reading";
  const isWishlistRoute =
    Boolean(pathname?.includes("/wishlist/")) ||
    activeModal?.type === "wishlist";
  const isAnyModalRoute = isReadBookRoute || isReadingRoute || isWishlistRoute;
  const isShowingBookControls = isAnyModalRoute && !isClosing;

  // Retrieve current book metadata based on activeModal or URL
  let currentReadBook: ReadBook | undefined =
    activeModal?.type === "read" ? activeModal.book : undefined;
  if (!currentReadBook && isReadBookRoute && pathname) {
    const parts = pathname.split("/read/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentReadBook = getReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentCRBook: CurrentlyReadingBook | undefined =
    activeModal?.type === "reading" ? activeModal.book : undefined;
  if (!currentCRBook && isReadingRoute && pathname) {
    const parts = pathname.split("/reading/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentCRBook = getCurrentReadBookById(decodeURIComponent(idSegment));
    }
  }

  let currentWishlistBook: WishlistBook | undefined =
    activeModal?.type === "wishlist" ? activeModal.book : undefined;
  if (!currentWishlistBook && isWishlistRoute && pathname) {
    const parts = pathname.split("/wishlist/");
    const idSegment = parts[1]?.split("/")[0]?.split("?")[0];
    if (idSegment) {
      currentWishlistBook = getWishlistBookById(decodeURIComponent(idSegment));
    }
  }

  const handleCloseBook = () => {
    triggerClose(() => {
      clearActiveModal();
      if (isInterceptedOpen || Boolean(activeModal)) {
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
  const {
    toggleChaptersMenu,
    openChaptersMenu,
    closeChaptersMenu,
    toggleCurateMenu,
    openCurateMenu,
    closeCurateMenu,
    activeZoneId,
    isChaptersMenuOpen,
    isCurateMenuOpen,
    goToZone,
  } = useCanvasNavigation();

  // Curate button is visible only in the shelf grid and wishlist, not in currently reading section
  const isCurateVisible = activeZoneId !== "current-reads";

  const chaptersMenuRef = useRef<HTMLDivElement>(null);
  const curateMenuRef = useRef<HTMLDivElement>(null);
  const [isChaptersHovered, setIsChaptersHovered] = useState<boolean>(false);
  const [isCurateHovered, setIsCurateHovered] = useState<boolean>(false);
  const [expandedCurateSection, setExpandedCurateSection] = useState<
    "genre" | "length" | null
  >(null);
  const [isClassicsActive, setIsClassicsActive] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);

  // Active filter chips list shown above the curate menu (matching the reference image architecture)
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];
    if (isClassicsActive) {
      list.push({
        id: "classics",
        label: "classics",
        onRemove: () => setIsClassicsActive(false),
      });
    }
    if (selectedGenre && selectedGenre !== "all") {
      list.push({
        id: "genre",
        label: selectedGenre,
        onRemove: () => setSelectedGenre(null),
      });
    }
    if (selectedLength && selectedLength !== "all") {
      const lengthObj = LENGTH_OPTIONS.find((l) => l.id === selectedLength);
      list.push({
        id: "length",
        label: lengthObj ? lengthObj.label : selectedLength,
        onRemove: () => setSelectedLength(null),
      });
    }
    return list;
  }, [isClassicsActive, selectedGenre, selectedLength]);

  // Auto-close curate menu if user navigates to a zone where curate is not visible
  useEffect(() => {
    if (!isCurateVisible && isCurateMenuOpen) {
      closeCurateMenu();
      setExpandedCurateSection(null);
    }
  }, [isCurateVisible, isCurateMenuOpen, closeCurateMenu]);

  // Click outside to close whichever menu is open
  useEffect(() => {
    if (!isChaptersMenuOpen && !isCurateMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      // If clicking inside either chapters or curate menu, let their own click handlers handle it
      if (
        chaptersMenuRef.current?.contains(target) ||
        curateMenuRef.current?.contains(target)
      ) {
        return;
      }

      if (isChaptersMenuOpen) {
        closeChaptersMenu();
      }
      if (isCurateMenuOpen) {
        closeCurateMenu();
        setExpandedCurateSection(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isChaptersMenuOpen, isCurateMenuOpen, closeChaptersMenu, closeCurateMenu]);

  // Keyboard shortcuts: 'm' opens chapters, 'c' opens curate, 'Escape' closes active menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs, textareas, or contentEditable
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore modified keys (Ctrl, Alt, Meta)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        if (isCurateMenuOpen) {
          closeCurateMenu();
          setExpandedCurateSection(null);
          openChaptersMenu();
        } else {
          toggleChaptersMenu();
        }
      } else if (event.key === "c" || event.key === "C") {
        if (isCurateVisible) {
          event.preventDefault();
          if (isChaptersMenuOpen) {
            closeChaptersMenu();
            openCurateMenu();
          } else {
            if (isCurateMenuOpen) {
              closeCurateMenu();
              setExpandedCurateSection(null);
            } else {
              openCurateMenu();
            }
          }
        }
      } else if (event.key === "Escape") {
        if (isChaptersMenuOpen) {
          closeChaptersMenu();
        }
        if (isCurateMenuOpen) {
          closeCurateMenu();
          setExpandedCurateSection(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isChaptersMenuOpen,
    isCurateMenuOpen,
    isCurateVisible,
    openChaptersMenu,
    toggleChaptersMenu,
    closeChaptersMenu,
    openCurateMenu,
    closeCurateMenu,
  ]);

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
              layout
              transition={{ duration: 0.4, ease: easing016 }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.4, delay: 0.1, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.4, delay: 0.2, ease: easing016 },
              }}
              className="flex items-center justify-center"
            >
              {/* Chapters group: Icon Button + (Chapters Text OR Chapter Menu Items) */}
              <motion.div
                ref={chaptersMenuRef}
                layout
                transition={{ duration: 0.4, ease: easing016 }}
                onPointerEnter={() => {
                  if (!isChaptersMenuOpen) setIsChaptersHovered(true);
                }}
                onPointerLeave={() => {
                  setIsChaptersHovered(false);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-x-1",
                  !isChaptersMenuOpen && "group/chapters cursor-pointer"
                )}
              >
                {/* The Icon Button (morphs between Chapters Square and Close Cross) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCurateMenuOpen) {
                      setExpandedCurateSection(null);
                      openChaptersMenu();
                    } else {
                      toggleChaptersMenu();
                    }
                  }}
                  aria-label={
                    isChaptersMenuOpen
                      ? "Close chapters menu"
                      : "Open chapters menu"
                  }
                  className={cn(
                    "pointer-events-auto flex aspect-square w-10 cursor-pointer items-center justify-center rounded-sm border border-black outline-none select-none",
                    isChaptersMenuOpen
                      ? "group/close bg-black text-[#FEFEFE] transition-colors duration-200 hover:bg-neon hover:text-black"
                      : "bg-black text-[#FEFEFE]"
                  )}
                >
                  <ChaptersIcon
                    isOpen={isChaptersMenuOpen}
                    isParentHovered={!isChaptersMenuOpen && isChaptersHovered}
                  />
                </button>

                {/* Chapters text button OR Chapter menu items (animates width directly without collapsing to zero) */}
                <motion.div
                  layout
                  transition={{ duration: 0.4, ease: easing016 }}
                  className="relative overflow-x-clip"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {!isChaptersMenuOpen ? (
                      <motion.div
                        key="chapters-text-button"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { duration: 0.4, ease: easing016 },
                        }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.4, ease: easing016 },
                        }}
                        className="w-max shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurateMenuOpen) {
                              setExpandedCurateSection(null);
                              openChaptersMenu();
                            } else {
                              toggleChaptersMenu();
                            }
                          }}
                          className="pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-4 outline-none select-none"
                        >
                          <FlipTextButton isHovered={isChaptersHovered}>
                            <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-white">
                              chapters
                            </p>
                          </FlipTextButton>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chapters-menu-items"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: {
                            duration: 0.3,
                            delay: 0.08,
                            ease: easing016,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.15, ease: easing016 },
                        }}
                        className="flex w-max shrink-0 items-center gap-x-1"
                      >
                        {/* bookshelf */}
                        <button
                          type="button"
                          onClick={() => goToZone("books-read")}
                          className="group/item pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black sm:px-4"
                        >
                          <FlipTextButton>
                            <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                              bookshelf
                            </p>
                          </FlipTextButton>
                        </button>

                        {/* current reads */}
                        <button
                          type="button"
                          onClick={() => goToZone("current-reads")}
                          className="group/item pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black sm:px-4"
                        >
                          <FlipTextButton>
                            <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                              current reads
                            </p>
                          </FlipTextButton>
                        </button>

                        {/* wishlist */}
                        <button
                          type="button"
                          onClick={() => goToZone("wishlist")}
                          className="group/item pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black sm:px-4"
                        >
                          <FlipTextButton>
                            <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                              wishlist
                            </p>
                          </FlipTextButton>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* second button: curate (only visible in shelf grid and wishlist) */}
              <AnimatePresence initial={false}>
                {isCurateVisible && (
                  <motion.div
                    key="curate-button"
                    ref={curateMenuRef}
                    layout
                    transition={{ duration: 0.4, ease: easing016 }}
                    initial={{
                      opacity: 0,
                      scale: 1,
                      width: 0,
                      marginLeft: 0,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      width: "auto",
                      marginLeft: 12,
                      transition: { duration: 0.4, ease: easing016 },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1,
                      width: 0,
                      marginLeft: 0,
                      transition: { duration: 0.3, ease: easing016 },
                    }}
                    onPointerEnter={() => {
                      if (!isCurateMenuOpen) setIsCurateHovered(true);
                    }}
                    onPointerLeave={() => {
                      setIsCurateHovered(false);
                    }}
                    className={cn(
                      "relative flex shrink-0 items-center gap-x-1 overflow-visible",
                      !isCurateMenuOpen && "group/curate cursor-pointer"
                    )}
                  >
                    {/* Floating Active Filter Chips Row (appears above when any filter is selected, aligned with sub-buttons like in reference image) */}
                    <AnimatePresence>
                      {isCurateMenuOpen && activeFilters.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: easing016 }}
                          className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-11 flex items-center gap-x-1.5 whitespace-nowrap z-20"
                        >
                          {activeFilters.map((filter) => (
                            <motion.button
                              key={filter.id}
                              type="button"
                              layout
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }}
                              transition={{ duration: 0.2, ease: easing016 }}
                              onClick={() => filter.onRemove()}
                              className="group/chip flex h-8.5 cursor-pointer items-center gap-x-2 rounded-sm border border-black bg-white px-3 text-[13px] font-semibold text-black select-none transition-colors duration-200 hover:bg-neon hover:text-black"
                              title={`Remove ${filter.label} filter`}
                            >
                              <FlipTextButton>
                                <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap">
                                  {filter.label}
                                </span>
                              </FlipTextButton>
                              <span className="flex h-3.5 w-3.5 items-center justify-center text-black/50 transition-colors group-hover/chip:text-black">
                                <svg
                                  viewBox="0 0 12 12"
                                  className="h-2.5 w-2.5 transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/chip:rotate-90"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                >
                                  <path d="M 2.5 2.5 L 9.5 9.5 M 9.5 2.5 L 2.5 9.5" />
                                </svg>
                              </span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* The Icon Button (morphs between Sliders and Close Cross, matching Chapters rounded-sm style) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isChaptersMenuOpen) {
                          openCurateMenu();
                        } else {
                          if (isCurateMenuOpen) {
                            setExpandedCurateSection(null);
                          }
                          toggleCurateMenu();
                        }
                      }}
                      aria-label={
                        isCurateMenuOpen
                          ? "Close curate menu"
                          : "Open curate menu"
                      }
                      className={cn(
                        "pointer-events-auto flex aspect-square w-10 cursor-pointer items-center justify-center rounded-sm border border-black outline-none select-none transition-colors duration-200",
                        isCurateMenuOpen
                          ? "group/curateclose bg-white text-black hover:bg-neon hover:text-black"
                          : isCurateHovered
                            ? "bg-neon text-black"
                            : "bg-white text-black group-hover/curate:bg-neon"
                      )}
                    >
                      <CurateIcon
                        isOpen={isCurateMenuOpen}
                        isParentHovered={!isCurateMenuOpen && isCurateHovered}
                      />
                    </button>

                    {/* Curate text button OR Curate menu items */}
                    <motion.div
                      layout
                      transition={{ duration: 0.4, ease: easing016 }}
                      className="relative overflow-hidden"
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        {!isCurateMenuOpen ? (
                          <motion.div
                            key="curate-text-button"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              transition: { duration: 0.25, ease: easing016 },
                            }}
                            exit={{
                              opacity: 0,
                              transition: { duration: 0.15, ease: easing016 },
                            }}
                            className="w-max shrink-0"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isChaptersMenuOpen) {
                                  openCurateMenu();
                                } else {
                                  toggleCurateMenu();
                                }
                              }}
                              className={cn(
                                "pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 outline-none select-none transition-colors duration-200",
                                isCurateHovered
                                  ? "bg-neon text-black"
                                  : "bg-white text-black group-hover/curate:bg-neon"
                              )}
                            >
                              <FlipTextButton isHovered={isCurateHovered}>
                                <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
                                  {activeFilters.length > 0
                                    ? `curate (${String(activeFilters.length).padStart(2, "0")})`
                                    : "curate"}
                                </p>
                              </FlipTextButton>
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="curate-menu-items"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              transition: {
                                duration: 0.3,
                                delay: 0.08,
                                ease: easing016,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              transition: { duration: 0.15, ease: easing016 },
                            }}
                            className="flex w-max shrink-0 items-center gap-x-1"
                          >
                            {/* classics button */}
                            <button
                              type="button"
                              onClick={() =>
                                setIsClassicsActive((prev) => !prev)
                              }
                              className={cn(
                                "group/classics pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black",
                                isClassicsActive
                                  ? "bg-black text-white font-semibold"
                                  : "bg-white text-black"
                              )}
                            >
                              <FlipTextButton>
                                <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                                  classics
                                </p>
                              </FlipTextButton>
                            </button>

                            {/* genre button & expanded group */}
                            {expandedCurateSection === "genre" ? (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: easing016 }}
                                className="pointer-events-auto flex h-10 items-center gap-x-2.5 rounded-sm border border-black bg-white px-3 select-none"
                              >
                                <button
                                  type="button"
                                  onClick={() => setExpandedCurateSection(null)}
                                  className="group/genretitle pointer-events-auto cursor-pointer rounded-xs px-1.5 py-0.5 transition-colors duration-200 hover:bg-neon hover:text-black"
                                >
                                  <FlipTextButton>
                                    <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
                                      genre
                                    </p>
                                  </FlipTextButton>
                                </button>
                                <div className="h-4 w-px bg-black/20" />
                                <div className="pointer-events-auto flex items-center gap-x-1.5">
                                  {GENRE_OPTIONS.map((g) => {
                                    const isSelected =
                                      selectedGenre === g ||
                                      (g === "all" && !selectedGenre);
                                    return (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() =>
                                          setSelectedGenre((prev) =>
                                            prev === g
                                              ? null
                                              : g === "all"
                                                ? null
                                                : g
                                          )
                                        }
                                        className={cn(
                                          "group/pill pointer-events-auto cursor-pointer rounded-full px-3.5 py-1 text-[13px] font-medium whitespace-nowrap select-none transition-colors duration-150 hover:bg-neon hover:text-black",
                                          isSelected
                                            ? "bg-black text-white font-semibold"
                                            : "bg-[#EAEAEA] text-black"
                                        )}
                                      >
                                        <FlipTextButton>
                                          <span className="font-mona-sans text-[13px] whitespace-nowrap">
                                            {g}
                                          </span>
                                        </FlipTextButton>
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCurateSection("genre");
                                }}
                                className={cn(
                                  "group/genre pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black",
                                  selectedGenre
                                    ? "bg-black text-white font-semibold"
                                    : "bg-white text-black"
                                )}
                              >
                                <FlipTextButton>
                                  <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                                    genre +
                                  </p>
                                </FlipTextButton>
                              </button>
                            )}

                            {/* length button & expanded group */}
                            {expandedCurateSection === "length" ? (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: easing016 }}
                                className="pointer-events-auto flex h-10 items-center gap-x-2.5 rounded-sm border border-black bg-white px-3 select-none"
                              >
                                <button
                                  type="button"
                                  onClick={() => setExpandedCurateSection(null)}
                                  className="group/lengthtitle pointer-events-auto cursor-pointer rounded-xs px-1.5 py-0.5 transition-colors duration-200 hover:bg-neon hover:text-black"
                                >
                                  <FlipTextButton>
                                    <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
                                      length
                                    </p>
                                  </FlipTextButton>
                                </button>
                                <div className="h-4 w-px bg-black/20" />
                                <div className="pointer-events-auto flex items-center gap-x-1.5">
                                  {LENGTH_OPTIONS.map((l) => {
                                    const isSelected =
                                      selectedLength === l.id ||
                                      (l.id === "all" && !selectedLength);
                                    return (
                                      <button
                                        key={l.id}
                                        type="button"
                                        onClick={() =>
                                          setSelectedLength((prev) =>
                                            prev === l.id
                                              ? null
                                              : l.id === "all"
                                                ? null
                                                : l.id
                                          )
                                        }
                                        className={cn(
                                          "group/pill pointer-events-auto cursor-pointer rounded-full px-3.5 py-1 text-[13px] font-medium whitespace-nowrap select-none transition-colors duration-150 hover:bg-neon hover:text-black",
                                          isSelected
                                            ? "bg-black text-white font-semibold"
                                            : "bg-[#EAEAEA] text-black"
                                        )}
                                      >
                                        <FlipTextButton>
                                          <span className="font-mona-sans text-[13px] whitespace-nowrap">
                                            {l.label}
                                          </span>
                                        </FlipTextButton>
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCurateSection("length");
                                }}
                                className={cn(
                                  "group/length pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 outline-none select-none transition-colors duration-200 hover:bg-neon hover:text-black",
                                  selectedLength
                                    ? "bg-black text-white font-semibold"
                                    : "bg-white text-black"
                                )}
                              >
                                <FlipTextButton>
                                  <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                                    length +
                                  </p>
                                </FlipTextButton>
                              </button>
                            )}

                            {/* reset button */}
                            {/* reset button (sized identically to sub-buttons inside genre and length) */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsClassicsActive(false);
                                setSelectedGenre(null);
                                setSelectedLength(null);
                                setExpandedCurateSection(null);
                              }}
                              className="group/reset pointer-events-auto flex cursor-pointer items-center gap-x-1.5 rounded-full bg-[#EAEAEA] px-3.5 py-2 text-[13px] font-medium text-black outline-none select-none transition-colors duration-150 hover:bg-neon hover:text-black"
                              title="Reset all filters"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-3 w-3 shrink-0 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/reset:-rotate-360"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                              </svg>
                              <FlipTextButton>
                                <span className="font-mona-sans text-[13px] font-medium whitespace-nowrap">
                                  reset
                                </span>
                              </FlipTextButton>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
