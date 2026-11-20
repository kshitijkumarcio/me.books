"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { CurateIcon } from "./icons";
import { GENRE_OPTIONS, LENGTH_OPTIONS } from "./constants";
import FlipTextButton from "../ui-components/flip-text-button";

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
  selectedGenre: string | null;
  setSelectedGenre: React.Dispatch<React.SetStateAction<string | null>>;
  selectedLength: string | null;
  setSelectedLength: React.Dispatch<React.SetStateAction<string | null>>;
  expandedCurateSection: "genre" | "length" | null;
  handleToggleSection: (section: "genre" | "length") => void;
  handleHorizontalWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  resetAllFilters: () => void;
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
  selectedGenre,
  setSelectedGenre,
  selectedLength,
  setSelectedLength,
  expandedCurateSection,
  handleToggleSection,
  handleHorizontalWheel,
  resetAllFilters,
}: CurateMenuProps) => {
  return (
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
          {/* Floating Active Filter Chips Row */}
          <AnimatePresence>
            {isCurateMenuOpen && activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.25, ease: easing016 }}
                className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-11 z-20 flex items-center gap-x-1.5 whitespace-nowrap"
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
                    className="group/chip hover:bg-neon flex h-8.5 cursor-pointer items-center gap-x-2 rounded-sm border border-black bg-white px-3 text-[13px] font-semibold text-black transition-colors duration-200 select-none hover:text-black"
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

          {/* The Icon Button */}
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
              "pointer-events-auto flex aspect-square w-10 cursor-pointer items-center justify-center rounded-sm border border-black transition-colors duration-200 outline-none select-none",
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
                  className="flex w-max shrink-0 items-center gap-x-1"
                >
                  {/* classics button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => setIsClassicsActive((prev) => !prev)}
                    className={cn(
                      "group/classics hover:bg-neon pointer-events-auto shrink-0 flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      isClassicsActive
                        ? "bg-black font-semibold text-white"
                        : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                        classics
                      </p>
                    </FlipTextButton>
                  </motion.button>

                  {/* genre button & smoothly animated width drawer */}
                  <motion.div
                    layout
                    transition={{ duration: 0.5, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto shrink-0 flex h-10 items-center rounded-sm border border-black overflow-hidden select-none transition-colors duration-200",
                      expandedCurateSection === "genre"
                        ? "bg-white text-black"
                        : selectedGenre
                          ? "bg-black text-white hover:bg-neon hover:text-black font-semibold"
                          : "bg-white text-black hover:bg-neon hover:text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("genre")}
                      className={cn(
                        "pointer-events-auto shrink-0 flex items-center cursor-pointer outline-none select-none transition-colors duration-200",
                        expandedCurateSection === "genre"
                          ? "group/genretitle hover:bg-neon rounded-xs px-1.5 py-0.5 ml-2.5 text-black hover:text-black"
                          : "h-full px-4 justify-center"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                          {expandedCurateSection === "genre"
                            ? "genre"
                            : "genre +"}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedCurateSection === "genre" && (
                        <motion.div
                          key="genre-options-drawer"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: "auto",
                            opacity: 1,
                            transition: {
                              width: {
                                duration: 0.35,
                                ease: easing016,
                              },
                              opacity: {
                                duration: 0.22,
                                delay: 0.08,
                                ease: easing016,
                              },
                            },
                          }}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: {
                              opacity: {
                                duration: 0.15,
                                ease: easing016,
                              },
                              width: {
                                duration: 0.35,
                                ease: easing016,
                              },
                            },
                          }}
                          className="flex items-center overflow-hidden"
                        >
                          <div className="flex items-center w-max pr-3">
                            <div className="h-4 w-px shrink-0 bg-black/20 mx-2.5" />
                            <div
                              onWheel={handleHorizontalWheel}
                              className="no-scrollbar pointer-events-auto flex max-w-47.5 items-center gap-x-1.5 overflow-x-auto py-0.5 sm:max-w-65 md:max-w-[320px]"
                            >
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
                                      "group/pill hover:bg-neon pointer-events-auto shrink-0 cursor-pointer rounded-md px-3.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 select-none hover:text-black",
                                      isSelected
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

                  {/* length button & smoothly animated width drawer */}
                  <motion.div
                    layout
                    transition={{ duration: 0.5, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto shrink-0 flex h-10 items-center rounded-sm border border-black overflow-hidden select-none transition-colors duration-200",
                      expandedCurateSection === "length"
                        ? "bg-white text-black"
                        : selectedLength
                          ? "bg-black text-white hover:bg-neon hover:text-black font-semibold"
                          : "bg-white text-black hover:bg-neon hover:text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("length")}
                      className={cn(
                        "pointer-events-auto shrink-0 flex items-center cursor-pointer outline-none select-none transition-colors duration-200",
                        expandedCurateSection === "length"
                          ? "group/lengthtitle hover:bg-neon rounded-xs px-1.5 py-0.5 ml-2.5 text-black hover:text-black"
                          : "h-full px-4 justify-center"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap">
                          {expandedCurateSection === "length"
                            ? "length"
                            : "length +"}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedCurateSection === "length" && (
                        <motion.div
                          key="length-options-drawer"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: "auto",
                            opacity: 1,
                            transition: {
                              width: {
                                duration: 0.35,
                                ease: easing016,
                              },
                              opacity: {
                                duration: 0.22,
                                delay: 0.08,
                                ease: easing016,
                              },
                            },
                          }}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: {
                              opacity: {
                                duration: 0.15,
                                ease: easing016,
                              },
                              width: {
                                duration: 0.35,
                                ease: easing016,
                              },
                            },
                          }}
                          className="flex items-center overflow-hidden"
                        >
                          <div className="flex items-center w-max pr-3">
                            <div className="h-4 w-px shrink-0 bg-black/20 mx-2.5" />
                            <div
                              onWheel={handleHorizontalWheel}
                              className="no-scrollbar pointer-events-auto flex max-w-47.5 items-center gap-x-1.5 overflow-x-auto py-0.5 sm:max-w-65 md:max-w-80"
                            >
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
                                      "group/pill hover:bg-neon pointer-events-auto shrink-0 cursor-pointer rounded-md px-3.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 select-none hover:text-black",
                                      isSelected
                                        ? "bg-black font-semibold text-white"
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* reset button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={resetAllFilters}
                    className="group/reset hover:bg-neon pointer-events-auto shrink-0 flex cursor-pointer items-center gap-x-1.5 rounded-full bg-[#EAEAEA] px-3.5 py-2 text-[13px] font-medium text-black transition-colors duration-150 outline-none select-none hover:text-black"
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
