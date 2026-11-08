"use client";

import { useEffect, useSyncExternalStore } from "react";

export interface GridInfo {
  id: string; // "shelf" | "wishlist" | etc.
  name: string; // "Books Read" | "Wishlist"
  cols: number;
  rows: number;
  blockSize: number;
  gapX: number;
  gapY: number;
  totalBooks: number;
  explicitBooksCount: number;
  unpositionedBooksCount: number;
  totalCapacity?: number;
  isCoordinatesVisible: boolean;
  onToggleCoordinates: () => void;
  enableGridSizeDisplay?: boolean;
}

interface GridRegistryState {
  grids: GridInfo[];
  activeGridId: string;
}

const SERVER_SNAPSHOT: GridRegistryState = Object.freeze({
  grids: [],
  activeGridId: "shelf",
});

class GridRegistryStore {
  private gridsMap = new Map<string, GridInfo>();
  private activeId = "shelf";
  private listeners = new Set<() => void>();
  private cachedState: GridRegistryState = SERVER_SNAPSHOT;

  private updateCachedState() {
    const grids = Array.from(this.gridsMap.values());
    if (!this.gridsMap.has(this.activeId) && grids.length > 0) {
      this.activeId = grids[0].id;
    }
    this.cachedState = {
      grids,
      activeGridId: this.activeId,
    };
  }

  register(info: GridInfo) {
    this.gridsMap.set(info.id, info);
    this.updateCachedState();
    this.notify();
  }

  unregister(id: string) {
    if (this.gridsMap.delete(id)) {
      this.updateCachedState();
      this.notify();
    }
  }

  setActiveId(id: string) {
    if (this.activeId !== id && this.gridsMap.has(id)) {
      this.activeId = id;
      this.updateCachedState();
      this.notify();
    }
  }

  cycleActiveGrid() {
    const grids = Array.from(this.gridsMap.values());
    if (grids.length <= 1) return;
    const currentIndex = grids.findIndex((g) => g.id === this.activeId);
    const nextIndex = (currentIndex + 1) % grids.length;
    this.setActiveId(grids[nextIndex].id);
  }

  toggleActiveCoordinates() {
    const active = this.gridsMap.get(this.activeId);
    if (active) {
      active.onToggleCoordinates();
    } else {
      const first = Array.from(this.gridsMap.values())[0];
      if (first) first.onToggleCoordinates();
    }
  }

  syncAllCoordinatesToActive() {
    const active = this.gridsMap.get(this.activeId);
    if (!active) {
      this.toggleAllCoordinates();
      return;
    }
    const targetState = active.isCoordinatesVisible;
    this.gridsMap.forEach((g) => {
      if (g.isCoordinatesVisible !== targetState) {
        g.onToggleCoordinates();
      }
    });
  }

  toggleAllCoordinates() {
    const grids = Array.from(this.gridsMap.values());
    if (grids.length === 0) return;
    // If all grids currently have coordinates visible, turn all off.
    // Otherwise, turn all on so both grids become visible.
    const allVisible = grids.every((g) => g.isCoordinatesVisible);
    const targetState = !allVisible;
    grids.forEach((g) => {
      if (g.isCoordinatesVisible !== targetState) {
        g.onToggleCoordinates();
      }
    });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): GridRegistryState => {
    return this.cachedState;
  };

  getServerSnapshot = (): GridRegistryState => {
    return SERVER_SNAPSHOT;
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const gridRegistry = new GridRegistryStore();

/**
 * Hook used by ShelfGrid and Wishlist to register their grid properties.
 * Always updates latest info without unregistering on dependency changes.
 * Only unregisters when the grid component unmounts.
 */
export function useRegisterGrid(info: GridInfo | null) {
  const id = info?.id;

  // Keep grid registry updated with the latest state
  useEffect(() => {
    if (info) {
      gridRegistry.register(info);
    }
  });

  // Only unregister when the grid component actually unmounts
  useEffect(() => {
    return () => {
      if (id) {
        gridRegistry.unregister(id);
      }
    };
  }, [id]);
}

/**
 * Hook to consume registered grids.
 */
export function useGridRegistry() {
  return useSyncExternalStore(
    gridRegistry.subscribe,
    gridRegistry.getSnapshot,
    gridRegistry.getServerSnapshot
  );
}
