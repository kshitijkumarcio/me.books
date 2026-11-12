"use client";

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
  closeChaptersMenu: () => void;
  goToZone: (zoneId: string) => void;
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
    setPanToFn: (fn) => set({ panToFn: fn }),
    setScrollToTargetFn: (fn) => set({ scrollToTargetFn: fn }),
    setActiveZoneId: (id) => set({ activeZoneId: id }),
    toggleChaptersMenu: () =>
      set((state) => ({ isChaptersMenuOpen: !state.isChaptersMenuOpen })),
    closeChaptersMenu: () => set({ isChaptersMenuOpen: false }),

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

    goToZone: (zoneId: string) => {
      const { scrollToTargetFn, panToFn } = get();
      if (typeof document !== "undefined") {
        const el = document.getElementById(zoneId);
        if (el && scrollToTargetFn) {
          scrollToTargetFn(el);
          set({ activeZoneId: zoneId, isChaptersMenuOpen: false });
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
      set({ activeZoneId: zoneId, isChaptersMenuOpen: false });
    },
  })
);
