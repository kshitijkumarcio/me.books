"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { ShortlistIcon } from "./icons";
import {
  PRICE_RANGE_OPTIONS,
  PRIORITY_OPTIONS,
  MIN_BOOK_PRICE,
  MAX_BOOK_PRICE,
} from "./constants";
import FlipTextButton from "../ui-components/flip-text-button";
import { SubOptionPopupCard } from "./sub-option-popup-card";
import { PriceSliderPopupCard } from "./price-slider-popup-card";
import { PriceSliderTrack } from "./price-slider-track";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";

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
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedPriorities: string[];
  togglePriority: (priorityId: string) => void;
  expandedShortlistSection: "price" | "priority" | null;
  shortlistFocusedIndex?: number | null;
  handleToggleSection: (section: "price" | "priority") => void;
  handleHorizontalWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  resetAllFilters: () => void;
  isResetFlashing?: boolean;
  resetSpinCount?: number;
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
  priceRange,
  setPriceRange,
  selectedPriorities,
  togglePriority,
  expandedShortlistSection,
  shortlistFocusedIndex = null,
  handleToggleSection,
  handleHorizontalWheel,
  resetAllFilters,
  isResetFlashing = false,
  resetSpinCount = 0,
}: ShortlistMenuProps) => {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [resetHoverSpins, setResetHoverSpins] = useState(0);

  const priorityContainerRef = useRef<HTMLDivElement>(null);
  const priorityItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (
      shortlistFocusedIndex !== null &&
      expandedShortlistSection === "priority"
    ) {
      const targetEl = priorityItemRefs.current[shortlistFocusedIndex];
      const container = priorityContainerRef.current;

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
  }, [shortlistFocusedIndex, expandedShortlistSection]);

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

  // On mobile only: if chapters menu is open, shortlist menu collapses to zero width.
  // On desktop: shortlist remains visible side-by-side with chapters.
  const isVisible = isShortlistVisible && (!isMobile || !isChaptersMenuOpen);
  const isSubmenuOpen = expandedShortlistSection !== null;
  const isPriceFiltered =
    priceRange[0] > MIN_BOOK_PRICE || priceRange[1] < MAX_BOOK_PRICE;

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
            width: isShortlistMenuOpen ? (isMobile ? "100%" : "auto") : "auto",
            marginLeft: isMobile && isShortlistMenuOpen ? 0 : 8,
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
            "relative flex max-w-[90vw] items-center gap-x-1",
            isShortlistMenuOpen
              ? isMobile
                ? "w-full max-w-full"
                : "w-max"
              : "shrink-0",
            !isShortlistMenuOpen && "group/shortlist cursor-pointer"
          )}
        >
          {/* Sub-option Popup Card for Price Range (on mobile only) */}
          <AnimatePresence>
            {isMobile &&
              isShortlistMenuOpen &&
              expandedShortlistSection === "price" && (
                <PriceSliderPopupCard
                  isOpen={true}
                  onClose={() => setExpandedShortlistSection(null)}
                  minPrice={MIN_BOOK_PRICE}
                  maxPrice={MAX_BOOK_PRICE}
                  step={25}
                  range={priceRange}
                  onRangeChange={setPriceRange}
                />
              )}
          </AnimatePresence>

          {/* Sub-option Popup Card for Priority (on mobile only) */}
          <AnimatePresence>
            {isMobile &&
              isShortlistMenuOpen &&
              expandedShortlistSection === "priority" && (
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

          {/* Floating Active Filter Chips Row */}
          <AnimatePresence>
            {isShortlistMenuOpen &&
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
              "relative max-w-[calc(90vw-44px)] overflow-hidden",
              isShortlistMenuOpen ? "w-max" : "w-max shrink-0"
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
                  className="no-scrollbar flex w-max items-center gap-x-1 overflow-x-auto py-0.5"
                >
                  {/* price range button & expanding drawer on desktop */}
                  <motion.div
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto flex h-10 shrink-0 items-center overflow-hidden rounded-sm border border-black transition-colors duration-200 select-none",
                      expandedShortlistSection === "price"
                        ? "bg-white text-black"
                        : isPriceFiltered
                          ? "hover:bg-neon bg-black font-semibold text-white hover:text-black"
                          : "hover:bg-neon bg-white text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("price")}
                      className={cn(
                        "group/pricetitle flex h-full cursor-pointer items-center outline-none select-none hover:text-black",
                        !isMobile && expandedShortlistSection === "price"
                          ? "pr-1 pl-3"
                          : "px-3 sm:px-4"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                          {!isMobile && expandedShortlistSection === "price"
                            ? "price"
                            : !isPriceFiltered
                              ? "price range +"
                              : `price: ₹${priceRange[0]}-${priceRange[1] >= MAX_BOOK_PRICE ? "₹1000+" : `₹${priceRange[1]}`}`}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isMobile && expandedShortlistSection === "price" && (
                        <motion.div
                          key="price-inline-drawer"
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
                              <PriceSliderTrack
                                compact={true}
                                range={priceRange}
                                onRangeChange={setPriceRange}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* priority button & expanding drawer on desktop */}
                  <motion.div
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    className={cn(
                      "pointer-events-auto flex h-10 shrink-0 items-center overflow-hidden rounded-sm border border-black transition-colors duration-200 select-none",
                      expandedShortlistSection === "priority"
                        ? "bg-white text-black"
                        : selectedPriorities.length > 0
                          ? "hover:bg-neon bg-black font-semibold text-white hover:text-black"
                          : "hover:bg-neon bg-white text-black"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSection("priority")}
                      className={cn(
                        "group/prioritytitle flex h-full cursor-pointer items-center outline-none select-none hover:text-black",
                        !isMobile && expandedShortlistSection === "priority"
                          ? "pr-1 pl-3"
                          : "px-3 sm:px-4"
                      )}
                    >
                      <FlipTextButton>
                        <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap sm:text-[14px]">
                          {!isMobile && expandedShortlistSection === "priority"
                            ? "priority"
                            : selectedPriorities.length === 0
                              ? "priority +"
                              : selectedPriorities.length === 1
                                ? `priority: ${
                                    PRIORITY_OPTIONS.find(
                                      (pr) => pr.id === selectedPriorities[0]
                                    )?.label || selectedPriorities[0]
                                  }`
                                : `priority (${String(selectedPriorities.length).padStart(2, "0")})`}
                        </p>
                      </FlipTextButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isMobile && expandedShortlistSection === "priority" && (
                        <motion.div
                          key="priority-inline-drawer"
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
                              ref={priorityContainerRef}
                              onWheel={handleHorizontalWheel}
                              className="no-scrollbar pointer-events-auto flex max-w-72 items-center gap-x-1.5 overflow-x-auto scroll-smooth py-0.5 sm:max-w-85"
                            >
                              {PRIORITY_OPTIONS.map((pr, index) => {
                                const isSelected =
                                  pr.id === "all"
                                    ? selectedPriorities.length === 0
                                    : selectedPriorities.includes(pr.id);
                                const isFocused =
                                  shortlistFocusedIndex !== null &&
                                  shortlistFocusedIndex === index;

                                return (
                                  <button
                                    key={pr.id}
                                    ref={(el) => {
                                      priorityItemRefs.current[index] = el;
                                    }}
                                    type="button"
                                    onClick={(e) => {
                                      togglePriority(pr.id);
                                      scrollToItem(
                                        e.currentTarget,
                                        priorityContainerRef.current
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
                                        {pr.label}
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
                    layout="position"
                    transition={{ duration: 0.35, ease: easing016 }}
                    type="button"
                    onClick={resetAllFilters}
                    onPointerEnter={() =>
                      setResetHoverSpins((prev) => prev + 1)
                    }
                    aria-label="Reset all shortlist filters"
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
