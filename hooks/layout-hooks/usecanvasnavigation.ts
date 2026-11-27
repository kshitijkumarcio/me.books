"use client";

import { useEffect, type RefObject } from "react";
import { create } from "zustand";

export interface ZoneConfig {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  colStart: number;
  rowStart: number;
  widthCells: number;
  heightCells: number;
  bgColor: string;
}

export const CANVAS_ZONES: ZoneConfig[] = [
  {
    id: "wishlist",
    number: "01",
    title: "The Wishlist",
    subtitle: "Curated list of future discoveries",
    colStart: 12,
    rowStart: 12,
    widthCells: 89,
    heightCells: 35,
    bgColor: "transparent",
  },
  {
    id: "current-reads",
    number: "02",
    title: "Currently Reading",
    subtitle: "Active books & center welcome block",
    colStart: 12,
    rowStart: 48,
    widthCells: 89,
    heightCells: 9,
    bgColor: "transparent",
  },
  {
    id: "books-read",
    number: "03",
    title: "The Bookshelf",
    subtitle: "Completed and owned collection",
    colStart: 12,
    rowStart: 57,
    widthCells: 89,
    heightCells: 45,
    bgColor: "transparent",
  },
];

interface CanvasNavigationState {
  panToFn: ((x: number, y: number) => void) | null;
  scrollToTargetFn:
    | ((
        target: string | HTMLElement,
        options?: { lerp?: number; duration?: number; offset?: number }
      ) => void)
    | null;
  activeZoneId: string;
  isChaptersMenuOpen: boolean;
  isCurateMenuOpen: boolean;
  isShortlistMenuOpen: boolean;
  setPanToFn: (fn: (x: number, y: number) => void) => void;
  setScrollToTargetFn: (
    fn:
      | ((
          target: string | HTMLElement,
          options?: { lerp?: number; duration?: number; offset?: number }
        ) => void)
      | null
  ) => void;
  setActiveZoneId: (id: string) => void;
  toggleChaptersMenu: () => void;
  openChaptersMenu: () => void;
  closeChaptersMenu: () => void;
  toggleCurateMenu: () => void;
  openCurateMenu: () => void;
  closeCurateMenu: () => void;
  toggleShortlistMenu: () => void;
  openShortlistMenu: () => void;
  closeShortlistMenu: () => void;
  setIsChaptersMenuOpen: (isOpen: boolean) => void;
  setIsCurateMenuOpen: (isOpen: boolean) => void;
  setIsShortlistMenuOpen: (isOpen: boolean) => void;
  goToZone: (
    zoneId: string,
    options?: { lerp?: number; duration?: number; offset?: number }
  ) => void;
  scrollToTarget: (
    target:
      | string
      | HTMLElement
      | { targetId: string; duration?: number; lerp?: number; offset?: number },
    options?: { lerp?: number; duration?: number; offset?: number }
  ) => void;
}

export const useCanvasNavigation = create<CanvasNavigationState>(
  (set, get) => ({
    panToFn: null,
    scrollToTargetFn: null,
    activeZoneId: "books-read",
    isChaptersMenuOpen: false,
    isCurateMenuOpen: false,
    isShortlistMenuOpen: false,
    setPanToFn: (fn) => set({ panToFn: fn }),
    setScrollToTargetFn: (fn) => set({ scrollToTargetFn: fn }),
    setActiveZoneId: (id) => set({ activeZoneId: id }),
    toggleChaptersMenu: () =>
      set((state) => ({
        isChaptersMenuOpen: !state.isChaptersMenuOpen,
        isCurateMenuOpen: false,
        isShortlistMenuOpen: false,
      })),
    openChaptersMenu: () =>
      set({
        isChaptersMenuOpen: true,
        isCurateMenuOpen: false,
        isShortlistMenuOpen: false,
      }),
    closeChaptersMenu: () => set({ isChaptersMenuOpen: false }),
    toggleCurateMenu: () =>
      set((state) => ({
        isCurateMenuOpen: !state.isCurateMenuOpen,
        isChaptersMenuOpen: false,
        isShortlistMenuOpen: false,
      })),
    openCurateMenu: () =>
      set({
        isCurateMenuOpen: true,
        isChaptersMenuOpen: false,
        isShortlistMenuOpen: false,
      }),
    closeCurateMenu: () => set({ isCurateMenuOpen: false }),
    toggleShortlistMenu: () =>
      set((state) => ({
        isShortlistMenuOpen: !state.isShortlistMenuOpen,
        isChaptersMenuOpen: false,
        isCurateMenuOpen: false,
      })),
    openShortlistMenu: () =>
      set({
        isShortlistMenuOpen: true,
        isChaptersMenuOpen: false,
        isCurateMenuOpen: false,
      }),
    closeShortlistMenu: () => set({ isShortlistMenuOpen: false }),
    setIsChaptersMenuOpen: (open) =>
      set({
        isChaptersMenuOpen: open,
        ...(open
          ? { isCurateMenuOpen: false, isShortlistMenuOpen: false }
          : {}),
      }),
    setIsCurateMenuOpen: (open) =>
      set({
        isCurateMenuOpen: open,
        ...(open
          ? { isChaptersMenuOpen: false, isShortlistMenuOpen: false }
          : {}),
      }),
    setIsShortlistMenuOpen: (open) =>
      set({
        isShortlistMenuOpen: open,
        ...(open ? { isChaptersMenuOpen: false, isCurateMenuOpen: false } : {}),
      }),

    scrollToTarget: (target, options) => {
      const { scrollToTargetFn } = get();
      const isTargetObject =
        typeof target === "object" &&
        target !== null &&
        typeof window !== "undefined" &&
        !(target instanceof Element) &&
        "targetId" in target;

      const targetSelector = isTargetObject
        ? (target as { targetId: string }).targetId
        : (target as string | HTMLElement);

      const effectiveOptions = isTargetObject
        ? {
            duration: (target as { duration?: number }).duration,
            lerp: (target as { lerp?: number }).lerp,
            offset: (target as { offset?: number }).offset,
            ...options,
          }
        : options;

      if (scrollToTargetFn) {
        scrollToTargetFn(targetSelector, effectiveOptions);
      } else if (typeof document !== "undefined") {
        const el =
          typeof targetSelector === "string"
            ? targetSelector.startsWith("#")
              ? document.getElementById(targetSelector.slice(1))
              : document.querySelector(targetSelector)
            : targetSelector;
        el?.scrollIntoView({ behavior: "smooth" });
      }
    },

    goToZone: (
      zoneId: string,
      options?: { lerp?: number; duration?: number; offset?: number }
    ) => {
      const { scrollToTargetFn, panToFn } = get();
      if (typeof document !== "undefined") {
        const el = document.getElementById(zoneId);
        if (el) {
          if (scrollToTargetFn) {
            scrollToTargetFn(el, {
              duration: options?.duration ?? 2,
              offset: options?.offset ?? -42,
              lerp: options?.lerp ?? 1,
            });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
          set({
            activeZoneId: zoneId,
            isChaptersMenuOpen: false,
            isCurateMenuOpen: false,
            isShortlistMenuOpen: false,
          });
          return;
        }
      }

      const zone = CANVAS_ZONES.find((z) => z.id === zoneId);
      if (!zone || !panToFn) return;

      // Read current cell size from CSS variable or window width
      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 768;
      const cellSize = isDesktop ? 60 : 40;

      // Calculate pixel coordinates for the zone
      const targetX = zone.colStart * cellSize;
      const targetY = zone.rowStart * cellSize;

      panToFn(targetX, targetY);
      set({
        activeZoneId: zoneId,
        isChaptersMenuOpen: false,
        isCurateMenuOpen: false,
        isShortlistMenuOpen: false,
      });
    },
  })
);

/**
 * Robust, high-performance canvas zone detection.
 * Tracks the boundary positions of the canvas sections relative to the viewport focus line
 * to determine whether the user is in 'books-read' (Bookshelf), 'current-reads', or 'wishlist'.
 *
 * Section layout in DOM:
 * 1. 'introduction' + 'books-read' -> 'books-read' zone (the Bookshelf)
 * 2. 'current-reads'              -> 'current-reads' zone
 * 3. 'wishlist'                   -> 'wishlist' zone
 *
 * Boundary rules with hysteresis:
 * - Above 'current-reads'                 -> 'books-read'
 * - Between 'current-reads' and 'wishlist' -> 'current-reads'
 * - At or below 'wishlist'                -> 'wishlist'
 *
 * This geometry-based detection is completely immune to dynamic section resizing and filtering
 * (e.g. when books are filtered in shelf-grid and its height shrinks from ~4000px to ~400px).
 */
export function useCanvasZoneObserver(
  wrapperRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let rafId: number | null = null;

    const checkActiveZone = () => {
      const crEl = document.getElementById("current-reads");
      const wlEl = document.getElementById("wishlist");

      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportHeight = wrapper.clientHeight || window.innerHeight;

      const currentActive = useCanvasNavigation.getState().activeZoneId;

      let crTop = Infinity;
      let wlTop = Infinity;

      if (crEl) {
        crTop = crEl.getBoundingClientRect().top - wrapperRect.top;
      }
      if (wlEl) {
        wlTop = wlEl.getBoundingClientRect().top - wrapperRect.top;
      }

      // Hysteresis thresholds to avoid jitter at boundary lines:
      // When moving forward (downward): enter section when its top passes 45% of viewport
      // When moving backward (upward): leave section when its top drops below 55% of viewport
      let targetZone = currentActive;

      if (currentActive === "books-read") {
        if (wlTop <= viewportHeight * 0.45) {
          targetZone = "wishlist";
        } else if (crTop <= viewportHeight * 0.45) {
          targetZone = "current-reads";
        }
      } else if (currentActive === "current-reads") {
        if (wlTop <= viewportHeight * 0.45) {
          targetZone = "wishlist";
        } else if (crTop >= viewportHeight * 0.55) {
          targetZone = "books-read";
        }
      } else if (currentActive === "wishlist") {
        if (wlTop >= viewportHeight * 0.55) {
          if (crTop >= viewportHeight * 0.55) {
            targetZone = "books-read";
          } else {
            targetZone = "current-reads";
          }
        }
      } else {
        // Fallback for initial state
        if (wlTop <= viewportHeight * 0.5) {
          targetZone = "wishlist";
        } else if (crTop <= viewportHeight * 0.5) {
          targetZone = "current-reads";
        } else {
          targetZone = "books-read";
        }
      }

      if (targetZone && targetZone !== currentActive) {
        useCanvasNavigation.getState().setActiveZoneId(targetZone);
      }
    };

    const scheduleCheck = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        checkActiveZone();
      });
    };

    // 1. Initial check immediately, plus a brief timeout in case elements mount asynchronously
    scheduleCheck();
    const retryTimer = setTimeout(checkActiveZone, 150);

    // 2. Listen to scroll events on wrapper (dispatched continuously as Lenis scrolls)
    wrapper.addEventListener("scroll", scheduleCheck, { passive: true });

    // 3. Listen to window resize
    window.addEventListener("resize", scheduleCheck, { passive: true });

    // 4. ResizeObserver on content container to immediately re-check when filtering changes section sizes
    let resizeObserver: ResizeObserver | null = null;
    const content = wrapper.firstElementChild;
    if (content && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleCheck();
      });
      resizeObserver.observe(content);
    }

    return () => {
      clearTimeout(retryTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      wrapper.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      resizeObserver?.disconnect();
    };
  }, [wrapperRef]);
}
