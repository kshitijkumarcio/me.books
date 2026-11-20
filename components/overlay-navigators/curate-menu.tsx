"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { CurateIcon } from "./icons";
import { GENRE_OPTIONS, MIN_BOOK_LENGTH, MAX_BOOK_LENGTH } from "./constants";
import FlipTextButton from "../ui-components/flip-text-button";
import { SubOptionPopupCard } from "./sub-option-popup-card";
import { LengthSliderPopupCard } from "./length-slider-popup-card";
import { LengthSliderTrack } from "./length-slider-track";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";

interface CurateMenuProps {
  curateMenuRef: React.RefObject<HTMLDivElement | null>;
  isCurateVisible: boolean;
  isCurateMenuOpen: boolean;
  isCurateHovered: boolean;
  setIsCurateHovered: (hovered: boolean) => void;
  isChaptersMenuOpen: boolean;
  openCurateMenu: () => void;
  toggleCurateMenu: () => void;
  setExpandedCurateSection: (section: "genre" | "length" | null) => void;
  activeFilters: { id: string; label: string; onRemove: () => void }[];
  isClassicsActive: boolean;
  setIsClassicsActive: React.Dispatch<React.SetStateAction<boolean>>;
  selectedGenres: string[];
  toggleGenre: (genre: string) => void;
  selectedLengths: string[];
  toggleLength: (lengthId: string) => void;
  pageRange: [number, number];
  setPageRange: (range: [number, number]) => void;
  expandedCurateSection: "genre" | "length" | null;
  curateFocusedIndex?: number | null;
  handleToggleSection: (section: "genre" | "length") => void;
  handleHorizontalWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  resetAllFilters: () => void;
  isResetFlashing?: boolean;
  resetSpinCount?: number;
}

export const CurateMenu = ({
  curateMenuRef,
  isCurateVisible,
  isCurateMenuOpen,
  isCurateHovered,
  setIsCurateHovered,
  isChaptersMenuOpen,
  openCurateMenu,
  toggleCurateMenu,
  setExpandedCurateSection,
  activeFilters,
  isClassicsActive,
  setIsClassicsActive,
  selectedGenres,
  toggleGenre,
  pageRange,
  setPageRange,
  expandedCurateSection,
  curateFocusedIndex = null,
  handleToggleSection,
  handleHorizontalWheel,
  resetAllFilters,
  isResetFlashing = false,
  resetSpinCount = 0,
}: CurateMenuProps) => {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [resetHoverSpins, setResetHoverSpins] = useState(0);
  const genreContainerRef = useRef<HTMLDivElement>(null);
  const genreItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (curateFocusedIndex !== null && expandedCurateSection === "genre") {
      const targetEl = genreItemRefs.current[curateFocusedIndex];
      const container = genreContainerRef.current;
      if (targetEl && container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const currentScrollLeft = container.scrollLeft;

        const targetCenter = targetRect.left + targetRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const offset = targetCenter - containerCenter;

        container.scrollTo({
          left: currentScrollLeft + offset,
          behavior: "smooth",
        });
      }
    }
  }, [curateFocusedIndex, expandedCurateSection]);

  const scrollToItem = (
    targetEl: HTMLButtonElement | null,
    container: HTMLDivElement | null
  ) => {
    if (!targetEl || !container) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const currentScrollLeft = container.scrollLeft;
    const targetCenter = targetRect.left + targetRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const offset = targetCenter - containerCenter;
    container.scrollTo({
      left: currentScrollLeft + offset,
      behavior: "smooth",
    });
  };

  // On mobile only: if chapters menu is open, curate menu collapses to zero width.
  // On desktop: curate remains visible side-by-side with chapters.
  const isVisible = isCurateVisible && (!isMobile || !isChaptersMenuOpen);
  const isSubmenuOpen = expandedCurateSection !== null;
  const isLengthFiltered =
    pageRange[0] > MIN_BOOK_LENGTH || pageRange[1] < MAX_BOOK_LENGTH;

  const genreOptionsList = GENRE_OPTIONS.map((g) => ({
    id: g,
    label: g,
  }));

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
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
            width: isCurateMenuOpen ? (isMobile ? "100%" : "auto") : "auto",
            marginLeft: isMobile && isCurateMenuOpen ? 0 : 8,
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
            "relative flex max-w-[90vw] items-center gap-x-1",
            isCurateMenuOpen
              ? isMobile
                ? "w-full max-w-full"
                : "w-max"
              : "shrink-0",
            !isCurateMenuOpen && "group/curate cursor-pointer"
          )}
        >
          {/* Sub-option Popup Card for Genre (on mobile only) */}
          <AnimatePresence>
            {isMobile &&
              isCurateMenuOpen &&
              expandedCurateSection === "genre" && (
                <SubOptionPopupCard
                  isOpen={true}
                  onClose={() => setExpandedCurateSection(null)}
                  options={genreOptionsList}
                  selectedValues={selectedGenres}
                  onToggleValue={toggleGenre}
                  focusedIndex={curateFocusedIndex}
                />
              )}
          </AnimatePresence>

          {/* Sub-option Popup Card for Length (on mobile only) */}
          <AnimatePresence>
            {isMobile &&
              isCurateMenuOpen &&
              expandedCurateSection === "length" && (
                <LengthSliderPopupCard
                  isOpen={true}
                  onClose={() => setExpandedCurateSection(null)}
                  minPages={MIN_BOOK_LENGTH}
                  maxPages={MAX_BOOK_LENGTH}
                  step={10}
                  range={pageRange}
                  onRangeChange={setPageRange}
                />
              )}
          </AnimatePresence>

          {/* Floating Active Filter Chips Row */}
          <AnimatePresence>
            {isCurateMenuOpen &&
              (!isMobile || !isSubmenuOpen) &&
              activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: easing016 }}
                  className="no-scrollbar pointer-events-auto absolute bottom-[calc(100%+8px)] left-0 z-20 flex max-w-[90vw] items-center gap-x-1.5 overflow-x-auto whitespace-nowrap sm:left-11"
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
                      className="group/chip hover:bg-neon flex h-8.5 shrink-0 cursor-pointer items-center gap-x-2 rounded-sm border border-black bg-white px-3 text-[13px] font-semibold text-black transition-colors duration-200 select-none hover:text-black sm:text-[14px]"
                      title={`Remove ${filter.label} filter`}
                    >
                      <FlipTextButton>
                        <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
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

          {/* The Icon Button (morphs between Curate Square and Close Cross) */}
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
              isCurateMenuOpen ? "Close curate menu" : "Open curate menu"
            }
            className={cn(
              "pointer-events-auto flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black transition-colors duration-200 outline-none select-none",
              isCurateMenuOpen
                ? "group/curateclose hover:bg-neon bg-white text-black hover:text-black"
                : isCurateHovered
                  ? "bg-neon text-black"
                  : "group-hover/curate:bg-neon bg-white text-black"
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
            className={cn(
              "relative max-w-[calc(90vw-44px)] overflow-hidden",
              isCurateMenuOpen ? "w-max" : "w-max shrink-0"
            )}
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
                      "pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 transition-colors duration-200 outline-none select-none",
                      isCurateHovered
                        ? "bg-neon text-black"
                        : "group-hover/curate:bg-neon bg-white text-black"
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
                  layout
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
                  className="no-scrollbar flex w-max items-center gap-x-1 overflow-x-auto py-0.5"
                >
                  {/* classics button */}
                  <motion.button
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => setIsClassicsActive((prev) => !prev)}
                    className={cn(
                      "group/classics hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-3 transition-colors duration-200 outline-none select-none hover:text-black sm:px-4",
                      isClassicsActive
                        ? "bg-black font-semibold text-white"
                        : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        classics
                      </p>
                    </FlipTextButton>
                  </motion.button>

                  {/* genre button & expanding drawer on desktop */}
                  <motion.div
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto flex h-10 shrink-0 items-center overflow-hidden rounded-sm border border-black transition-colors duration-200 select-none",
                      expandedCurateSection === "genre"
                        ? "bg-white text-black"
                        : selectedGenres.length > 0
                          ? "hover:bg-neon bg-black font-semibold text-white hover:text-black"
                          : "hover:bg-neon bg-white text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("genre")}
                      className={cn(
                        "group/genretitle flex h-full cursor-pointer items-center outline-none select-none hover:text-black",
                        !isMobile && expandedCurateSection === "genre"
                          ? "pr-1 pl-3"
                          : "px-3 sm:px-4"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                          {!isMobile && expandedCurateSection === "genre"
                            ? "genre"
                            : selectedGenres.length === 0
                              ? "genre +"
                              : selectedGenres.length === 1
                                ? `genre: ${selectedGenres[0]}`
                                : `genre (${String(selectedGenres.length).padStart(2, "0")})`}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isMobile && expandedCurateSection === "genre" && (
                        <motion.div
                          key="genre-inline-drawer"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: "auto",
                            opacity: 1,
                            transition: {
                              width: { duration: 0.35, ease: easing016 },
                              opacity: {
                                duration: 0.2,
                                delay: 0.05,
                                ease: easing016,
                              },
                            },
                          }}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: {
                              opacity: { duration: 0.15, ease: easing016 },
                              width: { duration: 0.35, ease: easing016 },
                            },
                          }}
                          className="flex items-center overflow-hidden"
                        >
                          <div className="flex w-max items-center pr-3">
                            <div className="mx-2.5 h-4 w-px shrink-0 bg-black/20" />
                            <div
                              ref={genreContainerRef}
                              onWheel={handleHorizontalWheel}
                              className="no-scrollbar pointer-events-auto flex max-w-72 items-center gap-x-1.5 overflow-x-auto scroll-smooth py-0.5 sm:max-w-85"
                            >
                              {GENRE_OPTIONS.map((g, index) => {
                                const isSelected =
                                  g === "all"
                                    ? selectedGenres.length === 0
                                    : selectedGenres.includes(g);
                                const isFocused =
                                  curateFocusedIndex !== null &&
                                  curateFocusedIndex === index;

                                return (
                                  <button
                                    key={g}
                                    ref={(el) => {
                                      genreItemRefs.current[index] = el;
                                    }}
                                    type="button"
                                    onClick={(e) => {
                                      toggleGenre(g);
                                      scrollToItem(
                                        e.currentTarget,
                                        genreContainerRef.current
                                      );
                                    }}
                                    className={cn(
                                      "group/pill hover:bg-neon pointer-events-auto shrink-0 cursor-pointer rounded-full px-3.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 select-none hover:text-black",
                                      isFocused
                                        ? "bg-neon font-semibold text-black"
                                        : isSelected
                                          ? "bg-black font-semibold text-white"
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* length button & expanding drawer on desktop */}
                  <motion.div
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto flex h-10 shrink-0 items-center overflow-hidden rounded-sm border border-black transition-colors duration-200 select-none",
                      expandedCurateSection === "length"
                        ? "bg-white text-black"
                        : isLengthFiltered
                          ? "hover:bg-neon bg-black font-semibold text-white hover:text-black"
                          : "hover:bg-neon bg-white text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("length")}
                      className={cn(
                        "group/lengthtitle flex h-full cursor-pointer items-center outline-none select-none hover:text-black",
                        !isMobile && expandedCurateSection === "length"
                          ? "pr-1 pl-3"
                          : "px-3 sm:px-4"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                          {!isMobile && expandedCurateSection === "length"
                            ? "length"
                            : !isLengthFiltered
                              ? "length +"
                              : `length: ${pageRange[0]}-${pageRange[1] >= MAX_BOOK_LENGTH ? "900p+" : `${pageRange[1]}p`}`}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isMobile && expandedCurateSection === "length" && (
                        <motion.div
                          key="length-inline-drawer"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: "auto",
                            opacity: 1,
                            transition: {
                              width: { duration: 0.35, ease: easing016 },
                              opacity: {
                                duration: 0.2,
                                delay: 0.05,
                                ease: easing016,
                              },
                            },
                          }}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: {
                              opacity: { duration: 0.15, ease: easing016 },
                              width: { duration: 0.35, ease: easing016 },
                            },
                          }}
                          className="flex items-center overflow-hidden"
                        >
                          <div className="flex w-max items-center pr-3">
                            <div className="mx-2.5 h-4 w-px shrink-0 bg-black/20" />
                            <div className="px-1 py-1">
                              <LengthSliderTrack
                                compact={true}
                                range={pageRange}
                                onRangeChange={setPageRange}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* reset button */}
                  <motion.button
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={resetAllFilters}
                    onPointerEnter={() =>
                      setResetHoverSpins((prev) => prev + 1)
                    }
                    aria-label="Reset all filters"
                    className={cn(
                      "pointer-events-auto flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black transition-colors duration-200 outline-none select-none",
                      isMobile ? "aspect-square w-10" : "gap-x-1.5 px-3",
                      isResetFlashing
                        ? "bg-neon text-black"
                        : "group/reset hover:bg-neon bg-[#EAEAEA] text-black"
                    )}
                  >
                    <motion.svg
                      viewBox="0 0 16 16"
                      animate={{
                        rotate: -360 * (resetSpinCount + resetHoverSpins),
                      }}
                      transition={{ duration: 0.8, ease: easing016 }}
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 4.3 11.7 A 5.2 5.2 0 1 0 3.5 5.5" />
                      <polyline points="3.5 2 3.5 5.5 7 5.5" />
                    </motion.svg>
                    {!isMobile && (
                      <FlipTextButton>
                        <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                          reset
                        </span>
                      </FlipTextButton>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
