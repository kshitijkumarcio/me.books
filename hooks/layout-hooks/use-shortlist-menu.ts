"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { create } from "zustand";
import { useCanvasNavigation } from "./usecanvasnavigation";
import {
  PRIORITY_OPTIONS,
  MIN_BOOK_PRICE,
  MAX_BOOK_PRICE,
} from "@/components/overlay-navigators/constants";
import type { WishlistBook } from "@/books/books-index";

interface ShortlistStoreState {
  priceRange: [number, number];
  selectedPriorities: string[];
  setPriceRange: (
    range: [number, number] | ((prev: [number, number]) => [number, number])
  ) => void;
  setSelectedPriorities: (
    priorities: string[] | ((prev: string[]) => string[])
  ) => void;
  togglePriority: (priorityId: string) => void;
  resetAllFilters: () => void;
}

export const useShortlistStore = create<ShortlistStoreState>((set) => ({
  priceRange: [MIN_BOOK_PRICE, MAX_BOOK_PRICE],
  selectedPriorities: [],

  setPriceRange: (range) =>
    set((state) => ({
      priceRange: typeof range === "function" ? range(state.priceRange) : range,
    })),

  setSelectedPriorities: (priorities) =>
    set((state) => ({
      selectedPriorities:
        typeof priorities === "function"
          ? priorities(state.selectedPriorities)
          : priorities,
    })),

  togglePriority: (priorityId: string) =>
    set((state) => {
      if (priorityId === "all") {
        return { selectedPriorities: [] };
      }
      const exists = state.selectedPriorities.includes(priorityId);
      return {
        selectedPriorities: exists
          ? state.selectedPriorities.filter((pr) => pr !== priorityId)
          : [...state.selectedPriorities, priorityId],
      };
    }),

  resetAllFilters: () =>
    set({
      priceRange: [MIN_BOOK_PRICE, MAX_BOOK_PRICE],
      selectedPriorities: [],
    }),
}));

/**
 * Checks if a WishlistBook satisfies the current price range and priority filters.
 *
 * Rules:
 * 1. When no filters are active, all books match.
 * 2. When price filter is active (range deviates from [MIN, MAX]):
 *    - Books without a numeric price filter out.
 *    - Books with a price outside the range filter out.
 *    - If maxPrice is MAX_BOOK_PRICE (₹1000+), any price >= minPrice matches.
 * 3. When priority filter is active:
 *    - Books whose priority is not included filter out.
 */
export function isWishlistBookMatchingFilters(
  book: WishlistBook,
  priceRange: [number, number],
  selectedPriorities: string[]
): boolean {
  const isPriceActive =
    priceRange[0] > MIN_BOOK_PRICE || priceRange[1] < MAX_BOOK_PRICE;
  const isPriorityActive = selectedPriorities.length > 0;

  // When no filters are active, keep all books visible
  if (!isPriceActive && !isPriorityActive) {
    return true;
  }

  // Price filtering
  if (isPriceActive) {
    // Books without a price should filter out when price filter is active
    if (typeof book.price !== "number") {
      return false;
    }
    const [minPrice, maxPrice] = priceRange;
    if (book.price < minPrice) {
      return false;
    }
    if (maxPrice < MAX_BOOK_PRICE && book.price > maxPrice) {
      return false;
    }
  }

  // Priority filtering
  if (isPriorityActive) {
    if (!book.priority || !selectedPriorities.includes(book.priority)) {
      return false;
    }
  }

  return true;
}

export const useShortlistMenu = () => {
  const {
    toggleShortlistMenu,
    openShortlistMenu,
    closeShortlistMenu,
    activeZoneId,
    isChaptersMenuOpen,
    isCurateMenuOpen,
    isShortlistMenuOpen,
  } = useCanvasNavigation();

  // Shortlist button is visible specifically in the Wishlist zone.
  // In 'books-read', the Curate button replaces it.
  // In 'current-reads', if coming from 'wishlist', a 0.5s delay is applied before hiding
  // to prevent flickering during fast scroll travel through the zone.
  const isDirectlyVisible = activeZoneId === "wishlist";
  const [isCurrentReadsSettled, setIsCurrentReadsSettled] = useState<boolean>(
    () => activeZoneId === "current-reads"
  );
  const [lastNonCurrentZone, setLastNonCurrentZone] = useState<string>(() =>
    activeZoneId === "current-reads" ? "wishlist" : activeZoneId
  );
  const [prevZoneId, setPrevZoneId] = useState<string | null>(activeZoneId);

  if (activeZoneId !== prevZoneId) {
    setPrevZoneId(activeZoneId);
    if (activeZoneId !== "current-reads") {
      setIsCurrentReadsSettled(false);
      setLastNonCurrentZone(activeZoneId);
    }
  }

  useEffect(() => {
    if (activeZoneId !== "current-reads") return;
    const timer = setTimeout(() => {
      setIsCurrentReadsSettled(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeZoneId]);

  const isShortlistVisible =
    isDirectlyVisible ||
    (activeZoneId === "current-reads" &&
      lastNonCurrentZone === "wishlist" &&
      !isCurrentReadsSettled);

  const shortlistMenuRef = useRef<HTMLDivElement>(null);
  const [isShortlistHovered, setIsShortlistHovered] = useState<boolean>(false);
  const [expandedShortlistSection, setExpandedShortlistSection] = useState<
    "price" | "priority" | null
  >(null);
  const [shortlistFocusedIndex, setShortlistFocusedIndex] = useState<
    number | null
  >(null);

  // Simultaneous toggle: clicking an active section closes it; clicking a different section switches simultaneously
  const handleToggleSection = useCallback((section: "price" | "priority") => {
    setExpandedShortlistSection((prev) => (prev === section ? null : section));
    setShortlistFocusedIndex(null);
  }, []);

  const priceRange = useShortlistStore((state) => state.priceRange);
  const setPriceRange = useShortlistStore((state) => state.setPriceRange);
  const selectedPriorities = useShortlistStore(
    (state) => state.selectedPriorities
  );
  const togglePriority = useShortlistStore((state) => state.togglePriority);
  const storeResetAllFilters = useShortlistStore(
    (state) => state.resetAllFilters
  );

  // Active filter chips list shown above the shortlist menu
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];
    if (priceRange[0] > MIN_BOOK_PRICE || priceRange[1] < MAX_BOOK_PRICE) {
      const maxLabel =
        priceRange[1] >= MAX_BOOK_PRICE ? "₹1000+" : `₹${priceRange[1]}`;
      list.push({
        id: "price-range",
        label: `₹${priceRange[0]} - ${maxLabel}`,
        onRemove: () => setPriceRange([MIN_BOOK_PRICE, MAX_BOOK_PRICE]),
      });
    }
    selectedPriorities.forEach((prId) => {
      const priorityObj = PRIORITY_OPTIONS.find((pr) => pr.id === prId);
      list.push({
        id: `priority-${prId}`,
        label: priorityObj ? priorityObj.label : prId,
        onRemove: () => togglePriority(prId),
      });
    });
    return list;
  }, [priceRange, selectedPriorities, setPriceRange, togglePriority]);

  // Horizontal wheel scroll handler for options drawer
  const handleHorizontalWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      if (e.deltaY !== 0) {
        e.preventDefault();
        e.stopPropagation();
        container.scrollLeft += e.deltaY;
      }
    },
    []
  );

  // Auto-close shortlist menu if user navigates away to a zone where shortlist is not visible
  useEffect(() => {
    if (!isShortlistVisible && isShortlistMenuOpen) {
      closeShortlistMenu();
    }
  }, [isShortlistVisible, isShortlistMenuOpen, closeShortlistMenu]);

  // Click outside to close shortlist menu
  useEffect(() => {
    if (!isShortlistMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (shortlistMenuRef.current?.contains(target)) {
        return;
      }
      closeShortlistMenu();
      setExpandedShortlistSection(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isShortlistMenuOpen, closeShortlistMenu]);

  const [isResetFlashing, setIsResetFlashing] = useState<boolean>(false);
  const [resetSpinCount, setResetSpinCount] = useState<number>(0);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerResetFlash = useCallback(() => {
    setIsResetFlashing(true);
    setResetSpinCount((prev) => prev + 1);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setIsResetFlashing(false);
    }, 550);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const resetAllFilters = useCallback(() => {
    storeResetAllFilters();
    setExpandedShortlistSection(null);
    setShortlistFocusedIndex(null);
    triggerResetFlash();
  }, [storeResetAllFilters, triggerResetFlash]);

  // Contextual keyboard shortcuts for Shortlist:
  // - When shortlist menu is open:
  //     'm' -> Toggle Price Range submenu, 'p' -> Toggle Priority submenu,
  //     'r' -> Reset all shortlist filters (with neon flash), Escape -> Close shortlist menu
  //     Arrow keys: Adjust price slider (when price open) or navigate priority options (when priority open)
  // - When resting (neither menu open) and shortlist is visible in Wishlist:
  //     's' -> Open shortlist menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Shortlist menu is open
      if (isShortlistMenuOpen) {
        // Arrow navigation and controls when a submenu drawer is open
        if (expandedShortlistSection === "price") {
          if (key === "arrowleft" || key === "arrowdown") {
            event.preventDefault();
            setPriceRange(([min, max]) => [
              Math.max(MIN_BOOK_PRICE, min - 25),
              max,
            ]);
            return;
          }
          if (key === "arrowright" || key === "arrowup") {
            event.preventDefault();
            setPriceRange(([min, max]) => [Math.min(max - 25, min + 25), max]);
            return;
          }
        } else if (expandedShortlistSection === "priority") {
          const optionsCount = PRIORITY_OPTIONS.length;

          if (key === "arrowright" || key === "arrowdown") {
            event.preventDefault();
            setShortlistFocusedIndex((prev) =>
              prev === null ? 0 : (prev + 1) % optionsCount
            );
            return;
          }
          if (key === "arrowleft" || key === "arrowup") {
            event.preventDefault();
            setShortlistFocusedIndex((prev) =>
              prev === null
                ? optionsCount - 1
                : (prev - 1 + optionsCount) % optionsCount
            );
            return;
          }
          if (key === "enter" || key === " ") {
            if (shortlistFocusedIndex !== null) {
              event.preventDefault();
              const selectedOpt = PRIORITY_OPTIONS[shortlistFocusedIndex];
              if (selectedOpt) togglePriority(selectedOpt.id);
              return;
            }
          }
        }

        if (key === "escape") {
          event.preventDefault();
          closeShortlistMenu();
          setExpandedShortlistSection(null);
          setShortlistFocusedIndex(null);
          return;
        }
        if (key === "m") {
          event.preventDefault();
          handleToggleSection("price");
          return;
        }
        if (key === "p") {
          event.preventDefault();
          handleToggleSection("priority");
          return;
        }
        if (key === "r") {
          event.preventDefault();
          resetAllFilters();
          return;
        }
        return;
      }

      // Resting state: if in Wishlist and no menu open, 's' opens shortlist
      if (!isChaptersMenuOpen && !isCurateMenuOpen && !isShortlistMenuOpen) {
        if (key === "s" && isShortlistVisible) {
          event.preventDefault();
          openShortlistMenu();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isShortlistMenuOpen,
    isShortlistVisible,
    isChaptersMenuOpen,
    isCurateMenuOpen,
    expandedShortlistSection,
    shortlistFocusedIndex,
    setPriceRange,
    openShortlistMenu,
    closeShortlistMenu,
    handleToggleSection,
    togglePriority,
    resetAllFilters,
  ]);

  return {
    shortlistMenuRef,
    isShortlistHovered,
    setIsShortlistHovered,
    isShortlistVisible,
    isShortlistMenuOpen,
    expandedShortlistSection,
    setExpandedShortlistSection,
    shortlistFocusedIndex,
    handleToggleSection,
    handleHorizontalWheel,
    priceRange,
    setPriceRange,
    selectedPriorities,
    togglePriority,
    activeFilters,
    resetAllFilters,
    isResetFlashing,
    resetSpinCount,
    toggleShortlistMenu,
    openShortlistMenu,
    closeShortlistMenu,
  };
};
