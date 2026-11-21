"use client";

import { create } from "zustand";
import {
  MIN_BOOK_PRICE,
  MAX_BOOK_PRICE,
} from "@/components/overlay-navigators/constants";
import type { WishlistBook } from "@/books/books-index";

interface ShortlistStoreState {
  priceRange: [number, number];
  selectedPriorities: string[];
  setPriceRange: (
    range:
      | [number, number]
      | ((prev: [number, number]) => [number, number])
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
      priceRange:
        typeof range === "function" ? range(state.priceRange) : range,
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
