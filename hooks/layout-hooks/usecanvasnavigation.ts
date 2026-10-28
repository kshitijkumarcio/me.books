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
  activeZoneId: string;
  isChaptersMenuOpen: boolean;
  setPanToFn: (fn: (x: number, y: number) => void) => void;
  setActiveZoneId: (id: string) => void;
  toggleChaptersMenu: () => void;
  closeChaptersMenu: () => void;
  goToZone: (zoneId: string) => void;
}

export const useCanvasNavigation = create<CanvasNavigationState>((set, get) => ({
  panToFn: null,
  activeZoneId: "books-read",
  isChaptersMenuOpen: false,
  setPanToFn: (fn) => set({ panToFn: fn }),
  setActiveZoneId: (id) => set({ activeZoneId: id }),
  toggleChaptersMenu: () =>
    set((state) => ({ isChaptersMenuOpen: !state.isChaptersMenuOpen })),
  closeChaptersMenu: () => set({ isChaptersMenuOpen: false }),

  goToZone: (zoneId: string) => {
    const { panToFn } = get();
    const zone = CANVAS_ZONES.find((z) => z.id === zoneId);
    if (!zone || !panToFn) return;

    // Read current cell size from CSS variable or window width
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const cellSize = isDesktop ? 60 : 40;

    // Calculate pixel coordinates for the zone
    const targetX = zone.colStart * cellSize;
    const targetY = zone.rowStart * cellSize;

    panToFn(targetX, targetY);
    set({ activeZoneId: zoneId, isChaptersMenuOpen: false });
  },
}));

