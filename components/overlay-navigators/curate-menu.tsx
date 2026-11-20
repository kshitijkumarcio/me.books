"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { CurateIcon } from "./icons";
import { GENRE_OPTIONS } from "./constants";
import FlipTextButton from "../ui-components/flip-text-button";
import { SubOptionPopupCard } from "./sub-option-popup-card";
import { LengthSliderPopupCard } from "./length-slider-popup-card";

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
  resetAllFilters,
  isResetFlashing = false,
}: CurateMenuProps) => {
  // If chapters menu is open, curate menu collapses to zero width
  const isVisible = isCurateVisible && !isChaptersMenuOpen;
  const isSubmenuOpen = expandedCurateSection !== null;
  const isLengthFiltered = pageRange[0] > 50 || pageRange[1] < 850;

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
            width: isCurateMenuOpen ? "100%" : "auto",
            marginLeft: isCurateMenuOpen ? 0 : 8,
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
            "relative flex items-center gap-x-1 overflow-visible",
            isCurateMenuOpen ? "w-full max-w-full sm:w-auto" : "shrink-0",
            !isCurateMenuOpen && "group/curate cursor-pointer"
          )}
        >
          {/* Sub-option Popup Card for Genre (Image 3) */}
          <AnimatePresence>
            {isCurateMenuOpen && expandedCurateSection === "genre" && (
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

          {/* Sub-option Popup Card for Length (Image 4 Dual-Thumb Slider) */}
          <AnimatePresence>
            {isCurateMenuOpen && expandedCurateSection === "length" && (
              <LengthSliderPopupCard
                isOpen={true}
                onClose={() => setExpandedCurateSection(null)}
                minPages={50}
                maxPages={850}
                step={25}
                range={pageRange}
                onRangeChange={setPageRange}
              />
            )}
          </AnimatePresence>

          {/* Floating Active Filter Chips Row (hidden when popup card is open) */}
          <AnimatePresence>
            {isCurateMenuOpen && !isSubmenuOpen && activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.25, ease: easing016 }}
                className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-0 z-20 flex max-w-[calc(100vw-32px)] items-center gap-x-1.5 overflow-x-auto no-scrollbar whitespace-nowrap sm:left-11"
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
                    className="group/chip hover:bg-neon flex h-8.5 shrink-0 cursor-pointer items-center gap-x-2 rounded-sm border border-black bg-white px-3 text-[13px] font-semibold text-black transition-colors duration-200 select-none hover:text-black"
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
              "relative overflow-hidden",
              isCurateMenuOpen ? "flex-1 min-w-0 sm:flex-initial" : "w-max shrink-0"
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
                  className="flex w-full sm:w-max items-center gap-x-1"
                >
                  {/* classics button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => setIsClassicsActive((prev) => !prev)}
                    className={cn(
                      "group/classics hover:bg-neon pointer-events-auto flex h-10 flex-1 sm:flex-initial min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-2 sm:px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      isClassicsActive
                        ? "bg-black font-semibold text-white"
                        : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        <span className="hidden sm:inline">classics</span>
                        <span className="inline sm:hidden">classic</span>
                      </span>
                    </FlipTextButton>
                  </motion.button>

                  {/* genre button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => handleToggleSection("genre")}
                    className={cn(
                      "group/genre hover:bg-neon pointer-events-auto flex h-10 flex-1 sm:flex-initial min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-2 sm:px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      expandedCurateSection === "genre"
                        ? "bg-neon text-black font-semibold"
                        : selectedGenres.length > 0
                          ? "bg-black font-semibold text-white"
                          : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        <span className="hidden sm:inline">
                          {selectedGenres.length === 0
                            ? "genre +"
                            : selectedGenres.length === 1
                              ? `genre: ${selectedGenres[0]}`
                              : `genre (${String(selectedGenres.length).padStart(2, "0")})`}
                        </span>
                        <span className="inline sm:hidden">
                          {selectedGenres.length === 0
                            ? "genre"
                            : `genre (${selectedGenres.length})`}
                        </span>
                      </span>
                    </FlipTextButton>
                  </motion.button>

                  {/* length button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => handleToggleSection("length")}
                    className={cn(
                      "group/length hover:bg-neon pointer-events-auto flex h-10 flex-1 sm:flex-initial min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-2 sm:px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      expandedCurateSection === "length"
                        ? "bg-neon text-black font-semibold"
                        : isLengthFiltered
                          ? "bg-black font-semibold text-white"
                          : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        <span className="hidden sm:inline">
                          {!isLengthFiltered
                            ? "length +"
                            : `length: ${pageRange[0]}-${pageRange[1] >= 850 ? "850p+" : `${pageRange[1]}p`}`}
                        </span>
                        <span className="inline sm:hidden">
                          {!isLengthFiltered
                            ? "length"
                            : `${pageRange[0]}-${pageRange[1] >= 850 ? "850+" : `${pageRange[1]}`}`}
                        </span>
                      </span>
                    </FlipTextButton>
                  </motion.button>

                  {/* reset button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={resetAllFilters}
                    aria-label="Reset all filters"
                    className={cn(
                      "pointer-events-auto flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black transition-colors duration-200 outline-none select-none",
                      isResetFlashing
                        ? "bg-neon text-black"
                        : "group/reset hover:bg-neon bg-white text-black"
                    )}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/reset:-rotate-180",
                        isResetFlashing && "-rotate-360"
                      )}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 13.5 8 A 5.5 5.5 0 1 1 11.89 4.11 L 13.5 2.5" />
                      <polyline points="13.5 6 13.5 2.5 10 2.5" />
                    </svg>
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
