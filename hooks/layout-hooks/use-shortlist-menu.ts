"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCanvasNavigation } from "./usecanvasnavigation";
import {
  PRICE_RANGE_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/components/overlay-navigators/constants";

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

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const togglePriceRange = useCallback((priceId: string) => {
    if (priceId === "all") {
      setSelectedPriceRanges([]);
      return;
    }
    setSelectedPriceRanges((prev) =>
      prev.includes(priceId)
        ? prev.filter((p) => p !== priceId)
        : [...prev, priceId]
    );
  }, []);

  const togglePriority = useCallback((priorityId: string) => {
    if (priorityId === "all") {
      setSelectedPriorities([]);
      return;
    }
    setSelectedPriorities((prev) =>
      prev.includes(priorityId)
        ? prev.filter((pr) => pr !== priorityId)
        : [...prev, priorityId]
    );
  }, []);

  // Active filter chips list shown above the shortlist menu (multi-select: each item counts as 1 filter)
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];
    selectedPriceRanges.forEach((pId) => {
      const priceObj = PRICE_RANGE_OPTIONS.find((p) => p.id === pId);
      list.push({
        id: `price-${pId}`,
        label: priceObj ? priceObj.label : pId,
        onRemove: () => togglePriceRange(pId),
      });
    });
    selectedPriorities.forEach((prId) => {
      const priorityObj = PRIORITY_OPTIONS.find((pr) => pr.id === prId);
      list.push({
        id: `priority-${prId}`,
        label: priorityObj ? priorityObj.label : prId,
        onRemove: () => togglePriority(prId),
      });
    });
    return list;
  }, [
    selectedPriceRanges,
    selectedPriorities,
    togglePriceRange,
    togglePriority,
  ]);

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
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerResetFlash = useCallback(() => {
    setIsResetFlashing(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setIsResetFlashing(false);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const resetAllFilters = useCallback(() => {
    setSelectedPriceRanges([]);
    setSelectedPriorities([]);
    setExpandedShortlistSection(null);
    setShortlistFocusedIndex(null);
    triggerResetFlash();
  }, [triggerResetFlash]);

  // Contextual keyboard shortcuts for Shortlist:
  // - When shortlist menu is open:
  //     'm' -> Toggle Price Range submenu, 'p' -> Toggle Priority submenu,
  //     'r' -> Reset all shortlist filters (with neon flash), Escape -> Close shortlist menu
  //     Arrow keys + Enter: Navigate and toggle options inside an open submenu drawer
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
        // Arrow navigation and Enter selection when a submenu drawer is open
        if (expandedShortlistSection !== null) {
          const optionsCount =
            expandedShortlistSection === "price"
              ? PRICE_RANGE_OPTIONS.length
              : PRIORITY_OPTIONS.length;

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
              if (expandedShortlistSection === "price") {
                const selectedOpt = PRICE_RANGE_OPTIONS[shortlistFocusedIndex];
                if (selectedOpt) togglePriceRange(selectedOpt.id);
              } else if (expandedShortlistSection === "priority") {
                const selectedOpt = PRIORITY_OPTIONS[shortlistFocusedIndex];
                if (selectedOpt) togglePriority(selectedOpt.id);
              }
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
    openShortlistMenu,
    closeShortlistMenu,
    handleToggleSection,
    togglePriceRange,
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
    selectedPriceRanges,
    togglePriceRange,
    selectedPriorities,
    togglePriority,
    activeFilters,
    resetAllFilters,
    isResetFlashing,
    toggleShortlistMenu,
    openShortlistMenu,
    closeShortlistMenu,
  };
};
