"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCanvasNavigation } from "./usecanvasnavigation";
import { useCurateStore } from "./use-curate-store";
import {
  GENRE_OPTIONS,
  MIN_BOOK_LENGTH,
  MAX_BOOK_LENGTH,
} from "@/components/overlay-navigators/constants";

export const useCurateMenu = () => {
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
    isShortlistMenuOpen,
    goToZone,
  } = useCanvasNavigation();

  // Curate button is visible specifically in the Bookshelf (books-read) zone.
  // In 'wishlist', the Shortlist button replaces it.
  // In 'current-reads', if coming from 'books-read', a 0.5s delay is applied before hiding
  // to prevent flickering during fast scroll travel through the zone.
  const isDirectlyVisible = activeZoneId === "books-read";
  const [isCurrentReadsSettled, setIsCurrentReadsSettled] = useState<boolean>(
    () => activeZoneId === "current-reads"
  );
  const [lastNonCurrentZone, setLastNonCurrentZone] = useState<string>(() =>
    activeZoneId === "current-reads" ? "books-read" : activeZoneId
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

  const isCurateVisible =
    isDirectlyVisible ||
    (activeZoneId === "current-reads" &&
      lastNonCurrentZone === "books-read" &&
      !isCurrentReadsSettled);

  const chaptersMenuRef = useRef<HTMLDivElement>(null);
  const curateMenuRef = useRef<HTMLDivElement>(null);
  const [isChaptersHovered, setIsChaptersHovered] = useState<boolean>(false);
  const [isCurateHovered, setIsCurateHovered] = useState<boolean>(false);
  const [expandedCurateSection, setExpandedCurateSection] = useState<
    "genre" | "length" | null
  >(null);
  const [curateFocusedIndex, setCurateFocusedIndex] = useState<number | null>(
    null
  );

  // Toggle section
  const handleToggleSection = useCallback((section: "genre" | "length") => {
    setExpandedCurateSection((prev) => (prev === section ? null : section));
    setCurateFocusedIndex(null);
  }, []);

  const isClassicsActive = useCurateStore((state) => state.isClassicsActive);
  const setIsClassicsActive = useCurateStore(
    (state) => state.setIsClassicsActive
  );
  const selectedGenres = useCurateStore((state) => state.selectedGenres);
  const toggleGenre = useCurateStore((state) => state.toggleGenre);
  const pageRange = useCurateStore((state) => state.pageRange);
  const setPageRange = useCurateStore((state) => state.setPageRange);
  const storeResetAllFilters = useCurateStore((state) => state.resetAllFilters);

  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);

  const toggleLength = useCallback(
    (lengthId: string) => {
      if (lengthId === "all") {
        setSelectedLengths([]);
        setPageRange([MIN_BOOK_LENGTH, MAX_BOOK_LENGTH]);
        return;
      }
      setSelectedLengths((prev) =>
        prev.includes(lengthId)
          ? prev.filter((l) => l !== lengthId)
          : [...prev, lengthId]
      );
    },
    [setPageRange]
  );

  // Active filter chips list shown above the curate menu
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];
    if (isClassicsActive) {
      list.push({
        id: "classics",
        label: "classics",
        onRemove: () => setIsClassicsActive(false),
      });
    }
    selectedGenres.forEach((g) => {
      list.push({
        id: `genre-${g}`,
        label: g,
        onRemove: () => toggleGenre(g),
      });
    });
    // Interactive dual-thumb length range filter (10 to 900+)
    if (pageRange[0] > MIN_BOOK_LENGTH || pageRange[1] < MAX_BOOK_LENGTH) {
      const maxLabel =
        pageRange[1] >= MAX_BOOK_LENGTH ? "900p+" : `${pageRange[1]}p`;
      list.push({
        id: "length-range",
        label: `${pageRange[0]} - ${maxLabel}`,
        onRemove: () => setPageRange([MIN_BOOK_LENGTH, MAX_BOOK_LENGTH]),
      });
    }
    return list;
  }, [
    isClassicsActive,
    selectedGenres,
    pageRange,
    toggleGenre,
    setIsClassicsActive,
    setPageRange,
  ]);

  // Horizontal mouse wheel scrolling for compact options lists
  const handleHorizontalWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY !== 0 && !e.deltaX) {
        e.currentTarget.scrollLeft += e.deltaY;
      }
    },
    []
  );

  // Auto-close curate menu if user navigates to a zone where curate is not visible
  useEffect(() => {
    if (!isCurateVisible && isCurateMenuOpen) {
      closeCurateMenu();
    }
  }, [isCurateVisible, isCurateMenuOpen, closeCurateMenu]);

  // Click outside to close whichever menu is open
  useEffect(() => {
    if (!isChaptersMenuOpen && !isCurateMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

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
  }, [
    isChaptersMenuOpen,
    isCurateMenuOpen,
    closeChaptersMenu,
    closeCurateMenu,
  ]);

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
    setSelectedLengths([]);
    setExpandedCurateSection(null);
    setCurateFocusedIndex(null);
    triggerResetFlash();
  }, [storeResetAllFilters, triggerResetFlash]);

  // Keyboard navigation
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

      if (key === "escape") {
        if (expandedCurateSection !== null) {
          event.preventDefault();
          setExpandedCurateSection(null);
          setCurateFocusedIndex(null);
          return;
        }
        if (isChaptersMenuOpen) {
          event.preventDefault();
          closeChaptersMenu();
        } else if (isCurateMenuOpen) {
          event.preventDefault();
          closeCurateMenu();
          setExpandedCurateSection(null);
          setCurateFocusedIndex(null);
        }
        return;
      }

      // 1. Chapters menu is open
      if (isChaptersMenuOpen) {
        if (key === "w") {
          event.preventDefault();
          goToZone("wishlist");
          return;
        }
        if (key === "s") {
          event.preventDefault();
          goToZone("books-read");
          return;
        }
        if (key === "c") {
          event.preventDefault();
          goToZone("current-reads");
          return;
        }
        if (key === "m") {
          event.preventDefault();
          closeChaptersMenu();
          return;
        }
        return;
      }

      // 2. Curate menu is open
      if (isCurateMenuOpen) {
        // Arrow navigation and Enter selection inside an open submenu popup
        if (expandedCurateSection === "genre") {
          const optionsCount = GENRE_OPTIONS.length;

          if (key === "arrowright" || key === "arrowdown") {
            event.preventDefault();
            setCurateFocusedIndex((prev) =>
              prev === null ? 0 : (prev + 1) % optionsCount
            );
            return;
          }
          if (key === "arrowleft" || key === "arrowup") {
            event.preventDefault();
            setCurateFocusedIndex((prev) =>
              prev === null
                ? optionsCount - 1
                : (prev - 1 + optionsCount) % optionsCount
            );
            return;
          }
          if (key === "enter" || key === " ") {
            if (curateFocusedIndex !== null) {
              event.preventDefault();
              const selectedOpt = GENRE_OPTIONS[curateFocusedIndex];
              if (selectedOpt) toggleGenre(selectedOpt);
              return;
            }
          }
        } else if (expandedCurateSection === "length") {
          if (key === "arrowleft" || key === "arrowdown") {
            event.preventDefault();
            setPageRange(([min, max]) => [
              Math.max(MIN_BOOK_LENGTH, min - 10),
              max,
            ]);
            return;
          }
          if (key === "arrowright" || key === "arrowup") {
            event.preventDefault();
            setPageRange(([min, max]) => [Math.min(max - 10, min + 10), max]);
            return;
          }
        }

        if (key === "c" && expandedCurateSection === null) {
          event.preventDefault();
          setIsClassicsActive((prev) => !prev);
          return;
        }
        if (key === "g") {
          event.preventDefault();
          handleToggleSection("genre");
          return;
        }
        if (key === "l") {
          event.preventDefault();
          handleToggleSection("length");
          return;
        }
        if (key === "r") {
          event.preventDefault();
          resetAllFilters();
          return;
        }
        if (key === "m") {
          event.preventDefault();
          closeCurateMenu();
          setExpandedCurateSection(null);
          openChaptersMenu();
          return;
        }
        return;
      }

      // 3. Resting state (neither menu is open)
      if (!isChaptersMenuOpen && !isCurateMenuOpen && !isShortlistMenuOpen) {
        if (key === "m") {
          event.preventDefault();
          openChaptersMenu();
          return;
        }
        if (key === "c" && isCurateVisible) {
          event.preventDefault();
          openCurateMenu();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isChaptersMenuOpen,
    isCurateMenuOpen,
    isShortlistMenuOpen,
    isCurateVisible,
    expandedCurateSection,
    curateFocusedIndex,
    openChaptersMenu,
    closeChaptersMenu,
    openCurateMenu,
    closeCurateMenu,
    goToZone,
    handleToggleSection,
    toggleGenre,
    resetAllFilters,
    setIsClassicsActive,
    setPageRange,
  ]);

  return {
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
    curateFocusedIndex,
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
    activeFilters,
    resetAllFilters,
    isResetFlashing,
    resetSpinCount,
    toggleChaptersMenu,
    openChaptersMenu,
    toggleCurateMenu,
    openCurateMenu,
    goToZone,
    activeZoneId,
  };
};
