"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCanvasNavigation } from "./usecanvasnavigation";
import { LENGTH_OPTIONS } from "@/components/overlay-navigators/constants";

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
    goToZone,
  } = useCanvasNavigation();

  // Curate button is visible in the shelf grid and wishlist, not in currently reading section.
  // When entering 'current-reads', a 0.5s delay is applied before hiding to prevent
  // flickering if the user is just quickly travelling/scrolling through the zone.
  const isDirectlyVisible = activeZoneId !== "current-reads";
  const [isCurrentReadsSettled, setIsCurrentReadsSettled] = useState<boolean>(
    () => activeZoneId === "current-reads"
  );
  const [prevZoneId, setPrevZoneId] = useState<string | null>(activeZoneId);

  if (activeZoneId !== prevZoneId) {
    setPrevZoneId(activeZoneId);
    if (activeZoneId !== "current-reads") {
      setIsCurrentReadsSettled(false);
    }
  }

  useEffect(() => {
    if (activeZoneId !== "current-reads") return;
    const timer = setTimeout(() => {
      setIsCurrentReadsSettled(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeZoneId]);

  const isCurateVisible = isDirectlyVisible || !isCurrentReadsSettled;

  const chaptersMenuRef = useRef<HTMLDivElement>(null);
  const curateMenuRef = useRef<HTMLDivElement>(null);
  const [isChaptersHovered, setIsChaptersHovered] = useState<boolean>(false);
  const [isCurateHovered, setIsCurateHovered] = useState<boolean>(false);
  const [expandedCurateSection, setExpandedCurateSection] = useState<
    "genre" | "length" | null
  >(null);

  // Simultaneous toggle: clicking an active section closes it; clicking a different section switches simultaneously
  const handleToggleSection = useCallback((section: "genre" | "length") => {
    setExpandedCurateSection((prev) => (prev === section ? null : section));
  }, []);

  const [isClassicsActive, setIsClassicsActive] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);

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
  }, [
    isChaptersMenuOpen,
    isCurateMenuOpen,
    closeChaptersMenu,
    closeCurateMenu,
  ]);

  const resetAllFilters = useCallback(() => {
    setIsClassicsActive(false);
    setSelectedGenre(null);
    setSelectedLength(null);
    setExpandedCurateSection(null);
  }, []);

  // Contextual keyboard shortcuts:
  // - When chapters menu is open:
  //     'w' -> Wishlist, 's' -> Bookshelf, 'c' -> Currently Reading, 'm' / Escape -> Close chapters
  // - When curate menu is open:
  //     'c' -> Toggle Classics, 'g' -> Open/toggle Genre submenu, 'l' -> Open/toggle Length submenu,
  //     'r' -> Reset all curate filters, 'm' -> Switch to chapters menu, Escape -> Close curate menu
  // - When resting (neither menu open):
  //     'm' -> Open chapters menu, 'c' -> Open curate menu (if curate is visible)
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
        if (isChaptersMenuOpen) {
          event.preventDefault();
          closeChaptersMenu();
        } else if (isCurateMenuOpen) {
          event.preventDefault();
          closeCurateMenu();
          setExpandedCurateSection(null);
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
        if (key === "c") {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isChaptersMenuOpen,
    isCurateMenuOpen,
    isCurateVisible,
    openChaptersMenu,
    closeChaptersMenu,
    openCurateMenu,
    closeCurateMenu,
    goToZone,
    handleToggleSection,
    resetAllFilters,
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
    handleToggleSection,
    handleHorizontalWheel,
    isClassicsActive,
    setIsClassicsActive,
    selectedGenre,
    setSelectedGenre,
    selectedLength,
    setSelectedLength,
    activeFilters,
    resetAllFilters,
    toggleChaptersMenu,
    openChaptersMenu,
    toggleCurateMenu,
    openCurateMenu,
    goToZone,
  };
};
