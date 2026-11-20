"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { ShortlistIcon } from "./icons";
import { PRICE_RANGE_OPTIONS, PRIORITY_OPTIONS } from "./constants";
import FlipTextButton from "../ui-components/flip-text-button";
import { SubOptionPopupCard } from "./sub-option-popup-card";

interface ShortlistMenuProps {
  shortlistMenuRef: React.RefObject<HTMLDivElement | null>;
  isShortlistVisible: boolean;
  isShortlistMenuOpen: boolean;
  isShortlistHovered: boolean;
  setIsShortlistHovered: (hovered: boolean) => void;
  isChaptersMenuOpen: boolean;
  openShortlistMenu: () => void;
  toggleShortlistMenu: () => void;
  setExpandedShortlistSection: (section: "price" | "priority" | null) => void;
  activeFilters: { id: string; label: string; onRemove: () => void }[];
  selectedPriceRanges: string[];
  togglePriceRange: (priceId: string) => void;
  selectedPriorities: string[];
  togglePriority: (priorityId: string) => void;
  expandedShortlistSection: "price" | "priority" | null;
  shortlistFocusedIndex?: number | null;
  handleToggleSection: (section: "price" | "priority") => void;
  handleHorizontalWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  resetAllFilters: () => void;
  isResetFlashing?: boolean;
}

export const ShortlistMenu = ({
  shortlistMenuRef,
  isShortlistVisible,
  isShortlistMenuOpen,
  isShortlistHovered,
  setIsShortlistHovered,
  isChaptersMenuOpen,
  openShortlistMenu,
  toggleShortlistMenu,
  setExpandedShortlistSection,
  activeFilters,
  selectedPriceRanges,
  togglePriceRange,
  selectedPriorities,
  togglePriority,
  expandedShortlistSection,
  shortlistFocusedIndex = null,
  handleToggleSection,
  resetAllFilters,
  isResetFlashing = false,
}: ShortlistMenuProps) => {
  // If chapters menu is open, shortlist menu collapses to zero width
  const isVisible = isShortlistVisible && !isChaptersMenuOpen;
  const isSubmenuOpen = expandedShortlistSection !== null;

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          key="shortlist-button"
          ref={shortlistMenuRef}
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
            width: isShortlistMenuOpen ? "100%" : "auto",
            marginLeft: isShortlistMenuOpen ? 0 : 8,
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
            if (!isShortlistMenuOpen) setIsShortlistHovered(true);
          }}
          onPointerLeave={() => {
            setIsShortlistHovered(false);
          }}
          className={cn(
            "relative flex items-center gap-x-1 overflow-visible",
            isShortlistMenuOpen ? "w-full max-w-full sm:w-auto" : "shrink-0",
            !isShortlistMenuOpen && "group/shortlist cursor-pointer"
          )}
        >
          {/* Sub-option Popup Card for Price Range (Image 3) */}
          <AnimatePresence>
            {isShortlistMenuOpen && expandedShortlistSection === "price" && (
              <SubOptionPopupCard
                isOpen={true}
                onClose={() => setExpandedShortlistSection(null)}
                options={PRICE_RANGE_OPTIONS}
                selectedValues={selectedPriceRanges}
                onToggleValue={togglePriceRange}
                focusedIndex={shortlistFocusedIndex}
              />
            )}
          </AnimatePresence>

          {/* Sub-option Popup Card for Priority (Image 3) */}
          <AnimatePresence>
            {isShortlistMenuOpen && expandedShortlistSection === "priority" && (
              <SubOptionPopupCard
                isOpen={true}
                onClose={() => setExpandedShortlistSection(null)}
                options={PRIORITY_OPTIONS}
                selectedValues={selectedPriorities}
                onToggleValue={togglePriority}
                focusedIndex={shortlistFocusedIndex}
              />
            )}
          </AnimatePresence>

          {/* Floating Active Filter Chips Row (hidden when popup card is open) */}
          <AnimatePresence>
            {isShortlistMenuOpen && !isSubmenuOpen && activeFilters.length > 0 && (
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

          {/* The Icon Button (morphs between Shortlist Square and Close Cross) */}
          <button
            type="button"
            onClick={() => {
              if (isChaptersMenuOpen) {
                openShortlistMenu();
              } else {
                if (isShortlistMenuOpen) {
                  setExpandedShortlistSection(null);
                }
                toggleShortlistMenu();
              }
            }}
            aria-label={
              isShortlistMenuOpen
                ? "Close shortlist menu"
                : "Open shortlist menu"
            }
            className={cn(
              "pointer-events-auto flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black transition-colors duration-200 outline-none select-none",
              isShortlistMenuOpen
                ? "group/shortlistclose hover:bg-neon bg-white text-black hover:text-black"
                : isShortlistHovered
                  ? "bg-neon text-black"
                  : "group-hover/shortlist:bg-neon bg-white text-black"
            )}
          >
            <ShortlistIcon
              isOpen={isShortlistMenuOpen}
              isParentHovered={!isShortlistMenuOpen && isShortlistHovered}
            />
          </button>

          {/* Shortlist text button OR Shortlist menu items */}
          <motion.div
            layout
            transition={{ duration: 0.4, ease: easing016 }}
            className={cn(
              "relative overflow-hidden",
              isShortlistMenuOpen
                ? "flex-1 min-w-0 sm:flex-initial"
                : "w-max shrink-0"
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {!isShortlistMenuOpen ? (
                <motion.div
                  key="shortlist-text-button"
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
                        openShortlistMenu();
                      } else {
                        toggleShortlistMenu();
                      }
                    }}
                    className={cn(
                      "pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black px-4 transition-colors duration-200 outline-none select-none",
                      isShortlistHovered
                        ? "bg-neon text-black"
                        : "group-hover/shortlist:bg-neon bg-white text-black"
                    )}
                  >
                    <FlipTextButton isHovered={isShortlistHovered}>
                      <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
                        {activeFilters.length > 0
                          ? `shortlist (${String(activeFilters.length).padStart(2, "0")})`
                          : "shortlist"}
                      </p>
                    </FlipTextButton>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="shortlist-menu-items"
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
                  {/* price range button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => handleToggleSection("price")}
                    className={cn(
                      "group/price hover:bg-neon pointer-events-auto flex h-10 flex-1 sm:flex-initial min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-2 sm:px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      expandedShortlistSection === "price"
                        ? "bg-neon text-black font-semibold"
                        : selectedPriceRanges.length > 0
                          ? "bg-black font-semibold text-white"
                          : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        <span className="hidden sm:inline">
                          {selectedPriceRanges.length === 0
                            ? "price range +"
                            : selectedPriceRanges.length === 1
                              ? `price: ${
                                  PRICE_RANGE_OPTIONS.find(
                                    (p) => p.id === selectedPriceRanges[0]
                                  )?.label || selectedPriceRanges[0]
                                }`
                              : `price (${String(selectedPriceRanges.length).padStart(2, "0")})`}
                        </span>
                        <span className="inline sm:hidden">
                          {selectedPriceRanges.length === 0
                            ? "price"
                            : `price (${selectedPriceRanges.length})`}
                        </span>
                      </span>
                    </FlipTextButton>
                  </motion.button>

                  {/* priority button */}
                  <motion.button
                    layout
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={() => handleToggleSection("priority")}
                    className={cn(
                      "group/priority hover:bg-neon pointer-events-auto flex h-10 flex-1 sm:flex-initial min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black px-2 sm:px-4 transition-colors duration-200 outline-none select-none hover:text-black",
                      expandedShortlistSection === "priority"
                        ? "bg-neon text-black font-semibold"
                        : selectedPriorities.length > 0
                          ? "bg-black font-semibold text-white"
                          : "bg-white text-black"
                    )}
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                        <span className="hidden sm:inline">
                          {selectedPriorities.length === 0
                            ? "priority +"
                            : selectedPriorities.length === 1
                              ? `priority: ${
                                  PRIORITY_OPTIONS.find(
                                    (pr) => pr.id === selectedPriorities[0]
                                  )?.label || selectedPriorities[0]
                                }`
                              : `priority (${String(selectedPriorities.length).padStart(2, "0")})`}
                        </span>
                        <span className="inline sm:hidden">
                          {selectedPriorities.length === 0
                            ? "priority"
                            : `priority (${selectedPriorities.length})`}
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
                    aria-label="Reset all shortlist filters"
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
