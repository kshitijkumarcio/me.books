"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016, easing065 } from "@/constants";
import FlipTextButton from "./ui-components/flip-text-button";
import { useOverlayButtons } from "@/hooks/layout-hooks/useoverlaybuttons";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";
import { useActiveBookRoute } from "@/hooks/layout-hooks/use-active-book-route";
import { useCurateMenu } from "@/hooks/layout-hooks/use-curate-menu";
import { useShortlistMenu } from "@/hooks/layout-hooks/use-shortlist-menu";
import { ViewDotsIcon } from "./overlay-navigators/icons";
import { ChaptersMenu } from "./overlay-navigators/chapters-menu";
import { CurateMenu } from "./overlay-navigators/curate-menu";
import { ShortlistMenu } from "./overlay-navigators/shortlist-menu";
import { BookModalBottomButtons } from "./overlay-navigators/book-modal-bottom-buttons";

const OverlayNavigators = () => {
  const router = useRouter();
  const { openModal } = useReadBookModal();
  const { pageView, setPageView } = useOverlayButtons();

  // Active book route detection & URL generation
  const {
    isWishlistRoute,
    isReadingRoute,
    isAboutRoute,
    isUseCaseRoute,
    isShowingBookControls,
    handleCloseBook,
    borrowUrl,
    readGoodreadsUrl,
    crGoodreadsUrl,
    wishlistAmazonUrl,
    wishlistGoodreadsUrl,
  } = useActiveBookRoute();

  // Curate & chapters navigation and drawer controllers
  const {
    chaptersMenuRef,
    curateMenuRef,
    isChaptersHovered,
    setIsChaptersHovered,
    isCurateHovered,
    setIsCurateHovered,
    isCurateVisible,
    isChaptersMenuOpen,
    isCurateMenuOpen,
    expandedCurateSection,
    setExpandedCurateSection,
    handleToggleSection,
    handleHorizontalWheel,
    isClassicsActive,
    setIsClassicsActive,
    selectedGenres,
    toggleGenre,
    selectedLengths,
    toggleLength,
    pageRange,
    setPageRange,
    curateFocusedIndex,
    activeFilters,
    resetAllFilters,
    isResetFlashing: isCurateResetFlashing,
    resetSpinCount: curateResetSpinCount,
    toggleChaptersMenu,
    openChaptersMenu,
    toggleCurateMenu,
    openCurateMenu,
    activeZoneId,
  } = useCurateMenu();

  // Shortlist menu controller (for wishlist zone)
  const {
    shortlistMenuRef,
    isShortlistHovered,
    setIsShortlistHovered,
    isShortlistVisible,
    isShortlistMenuOpen,
    expandedShortlistSection,
    setExpandedShortlistSection,
    shortlistFocusedIndex,
    handleToggleSection: handleToggleShortlistSection,
    handleHorizontalWheel: handleShortlistHorizontalWheel,
    priceRange,
    setPriceRange,
    selectedPriorities,
    togglePriority,
    activeFilters: activeShortlistFilters,
    resetAllFilters: resetAllShortlistFilters,
    isResetFlashing: isShortlistResetFlashing,
    resetSpinCount: shortlistResetSpinCount,
    toggleShortlistMenu,
    openShortlistMenu,
  } = useShortlistMenu();

  const [isMoodboardHovered, setIsMoodboardHovered] = useState<boolean>(false);
  const [isMoodboardClickLocked, setIsMoodboardClickLocked] =
    useState<boolean>(false);

  // Moodboard vs grid view hover states
  const effectiveHovered = isMoodboardHovered && !isMoodboardClickLocked;
  const isShowingMoodboard =
    pageView === "moodboard" ? !effectiveHovered : effectiveHovered;
  const currentPattern = isShowingMoodboard ? "moodboard" : "grid";

  const dotTransition: Transition = {
    duration: isMoodboardClickLocked ? 0 : 0.8,
    ease: easing016,
  };

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-999 flex h-dvh w-full flex-col justify-between px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8 lg:px-6 lg:pt-4 lg:pb-10">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div>
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
                  <Link
                    href="/about"
                    prefetch={true}
                    scroll={false}
                    onMouseEnter={() => {
                      try {
                        router.prefetch("/about", { kind: PrefetchKind.FULL });
                      } catch {
                        router.prefetch("/about");
                      }
                    }}
                    onPointerDown={() => {
                      try {
                        router.prefetch("/about", { kind: PrefetchKind.FULL });
                      } catch {
                        router.prefetch("/about");
                      }
                    }}
                    onClick={(e) => {
                      if (
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.altKey ||
                        e.button !== 0
                      ) {
                        return; // Allow new tab navigation
                      }
                      e.preventDefault();
                      openModal({ type: "about", href: "/about" });
                      window.history.pushState(null, "", "/book-shelf/about");
                    }}
                    className={cn("cursor-pointer")}
                  >
                    <FlipTextButton>
                      <p className="font-mona-sans relative text-[14px] font-semibold">
                        about.
                      </p>
                    </FlipTextButton>
                  </Link>
                  <Link
                    href="/use-case"
                    prefetch={true}
                    scroll={false}
                    onMouseEnter={() => {
                      try {
                        router.prefetch("/use-case", {
                          kind: PrefetchKind.FULL,
                        });
                      } catch {
                        router.prefetch("/use-case");
                      }
                    }}
                    onPointerDown={() => {
                      try {
                        router.prefetch("/use-case", {
                          kind: PrefetchKind.FULL,
                        });
                      } catch {
                        router.prefetch("/use-case");
                      }
                    }}
                    onClick={(e) => {
                      if (
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.altKey ||
                        e.button !== 0
                      ) {
                        return; // Allow new tab navigation
                      }
                      e.preventDefault();
                      openModal({ type: "use-case", href: "/use-case" });
                      window.history.pushState(
                        null,
                        "",
                        "/book-shelf/use-case"
                      );
                    }}
                    className={cn("cursor-pointer")}
                  >
                    <FlipTextButton>
                      <p className="font-mona-sans relative text-[14px] font-semibold">
                        use case.
                      </p>
                    </FlipTextButton>
                  </Link>
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

      {/* bottom buttons (strictly max 90% of screen width) */}
      <div className="relative mx-auto flex w-max max-w-[90vw] items-center justify-center">
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
              className="flex w-max max-w-[90vw] items-center justify-center"
            >
              <ChaptersMenu
                chaptersMenuRef={chaptersMenuRef}
                isChaptersMenuOpen={isChaptersMenuOpen}
                isChaptersHovered={isChaptersHovered}
                setIsChaptersHovered={setIsChaptersHovered}
                isCurateMenuOpen={isCurateMenuOpen}
                setExpandedCurateSection={setExpandedCurateSection}
                isShortlistMenuOpen={isShortlistMenuOpen}
                setExpandedShortlistSection={setExpandedShortlistSection}
                openChaptersMenu={openChaptersMenu}
                toggleChaptersMenu={toggleChaptersMenu}
                activeZoneId={activeZoneId}
              />

              <CurateMenu
                curateMenuRef={curateMenuRef}
                isCurateVisible={isCurateVisible}
                isCurateMenuOpen={isCurateMenuOpen}
                isCurateHovered={isCurateHovered}
                setIsCurateHovered={setIsCurateHovered}
                isChaptersMenuOpen={isChaptersMenuOpen}
                openCurateMenu={openCurateMenu}
                toggleCurateMenu={toggleCurateMenu}
                setExpandedCurateSection={setExpandedCurateSection}
                activeFilters={activeFilters}
                isClassicsActive={isClassicsActive}
                setIsClassicsActive={setIsClassicsActive}
                selectedGenres={selectedGenres}
                toggleGenre={toggleGenre}
                selectedLengths={selectedLengths}
                toggleLength={toggleLength}
                pageRange={pageRange}
                setPageRange={setPageRange}
                expandedCurateSection={expandedCurateSection}
                curateFocusedIndex={curateFocusedIndex}
                handleToggleSection={handleToggleSection}
                handleHorizontalWheel={handleHorizontalWheel}
                resetAllFilters={resetAllFilters}
                isResetFlashing={isCurateResetFlashing}
                resetSpinCount={curateResetSpinCount}
              />

              <ShortlistMenu
                shortlistMenuRef={shortlistMenuRef}
                isShortlistVisible={isShortlistVisible}
                isShortlistMenuOpen={isShortlistMenuOpen}
                isShortlistHovered={isShortlistHovered}
                setIsShortlistHovered={setIsShortlistHovered}
                isChaptersMenuOpen={isChaptersMenuOpen}
                openShortlistMenu={openShortlistMenu}
                toggleShortlistMenu={toggleShortlistMenu}
                setExpandedShortlistSection={setExpandedShortlistSection}
                activeFilters={activeShortlistFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedPriorities={selectedPriorities}
                togglePriority={togglePriority}
                expandedShortlistSection={expandedShortlistSection}
                shortlistFocusedIndex={shortlistFocusedIndex}
                handleToggleSection={handleToggleShortlistSection}
                handleHorizontalWheel={handleShortlistHorizontalWheel}
                resetAllFilters={resetAllShortlistFilters}
                isResetFlashing={isShortlistResetFlashing}
                resetSpinCount={shortlistResetSpinCount}
              />
            </motion.div>
          ) : isAboutRoute || isUseCaseRoute ? null : (
            <BookModalBottomButtons
              isWishlistRoute={isWishlistRoute}
              isReadingRoute={isReadingRoute}
              wishlistAmazonUrl={wishlistAmazonUrl}
              wishlistGoodreadsUrl={wishlistGoodreadsUrl}
              crGoodreadsUrl={crGoodreadsUrl}
              borrowUrl={borrowUrl}
              readGoodreadsUrl={readGoodreadsUrl}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OverlayNavigators;
