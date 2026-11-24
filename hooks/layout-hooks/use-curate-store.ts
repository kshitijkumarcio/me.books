"use client";

import { create } from "zustand";
import {
  MIN_BOOK_LENGTH,
  MAX_BOOK_LENGTH,
} from "@/components/overlay-navigators/constants";
import type { BookItem } from "@/books/books-index";

interface CurateStoreState {
  isClassicsActive: boolean;
  selectedGenres: string[];
  pageRange: [number, number];
  setIsClassicsActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedGenres: (
    genres: string[] | ((prev: string[]) => string[])
  ) => void;
  toggleGenre: (genre: string) => void;
  setPageRange: (
    range: [number, number] | ((prev: [number, number]) => [number, number])
  ) => void;
  resetAllFilters: () => void;
}

export const useCurateStore = create<CurateStoreState>((set) => ({
  isClassicsActive: false,
  selectedGenres: [],
  pageRange: [MIN_BOOK_LENGTH, MAX_BOOK_LENGTH],

  setIsClassicsActive: (active) =>
    set((state) => ({
      isClassicsActive:
        typeof active === "function" ? active(state.isClassicsActive) : active,
    })),

  setSelectedGenres: (genres) =>
    set((state) => ({
      selectedGenres:
        typeof genres === "function" ? genres(state.selectedGenres) : genres,
    })),

  toggleGenre: (genre: string) =>
    set((state) => {
      if (genre === "all") {
        return { selectedGenres: [] };
      }
      const exists = state.selectedGenres.includes(genre);
      return {
        selectedGenres: exists
          ? state.selectedGenres.filter((g) => g !== genre)
          : [...state.selectedGenres, genre],
      };
    }),

  setPageRange: (range) =>
    set((state) => ({
      pageRange: typeof range === "function" ? range(state.pageRange) : range,
    })),

  resetAllFilters: () =>
    set({
      isClassicsActive: false,
      selectedGenres: [],
      pageRange: [MIN_BOOK_LENGTH, MAX_BOOK_LENGTH],
    }),
}));

/**
 * Checks if a shelf book satisfies the current curate filters:
 * 1. Classics toggle:
 *    - "for classics we will check if the genre array for that book has the word classics / classic in it and we will use that filter the books"
 * 2. Genre filter:
 *    - Selected genres from the genre submenu (e.g., sci-fi, fantasy, fiction, etc.).
 * 3. Book length / page count:
 *    - Dual-thumb slider page range [min, max].
 */
export function isShelfBookMatchingFilters(
  book: BookItem,
  isClassicsActive: boolean,
  selectedGenres: string[],
  pageRange: [number, number]
): boolean {
  const isLengthActive =
    pageRange[0] > MIN_BOOK_LENGTH || pageRange[1] < MAX_BOOK_LENGTH;
  const isGenreActive = selectedGenres.length > 0;

  // When no filters are active, keep all books visible
  if (!isClassicsActive && !isGenreActive && !isLengthActive) {
    return true;
  }

  const bookGenres = (book.genres || []).map((g) => g.toLowerCase());
  if (book.genre) {
    bookGenres.push(book.genre.toLowerCase());
  }

  // 1. Classics filter
  if (isClassicsActive) {
    const hasClassic = bookGenres.some(
      (g) => g.includes("classic") || g.includes("classics")
    );
    if (!hasClassic) {
      return false;
    }
  }

  // 2. Genre filter
  if (isGenreActive) {
    const matchesAnyGenre = selectedGenres.some((targetGenre) => {
      const t = targetGenre.toLowerCase();
      return bookGenres.some((g) => {
        if (g === t) return true;
        if (t === "fiction" && g.includes("fiction")) return true;
        if (t === "fantasy" && g.includes("fantasy")) return true;
        if (t === "sci-fi" && (g === "sci-fi" || g.includes("sci-fi")))
          return true;
        if (t === "essays" && (g.includes("essay") || g.includes("aphorism")))
          return true;
        if (
          t === "romance" &&
          (g.includes("romance") ||
            g.includes("rom-com") ||
            g.includes("romantasy"))
        ) {
          return true;
        }
        if (
          t === "non-fiction" &&
          (g.includes("non-fiction") ||
            g === "memoir" ||
            g === "history" ||
            g === "technology" ||
            g === "culture" ||
            g === "business")
        ) {
          return true;
        }
        if (t === "philosophy" && g.includes("philosoph")) return true;
        if (
          t === "adventure" &&
          (g.includes("adventure") || g.includes("action"))
        )
          return true;
        if (t === "dystopian" && g.includes("dystopian")) return true;
        return g.includes(t);
      });
    });

    if (!matchesAnyGenre) {
      return false;
    }
  }

  // 3. Length / page count filter
  if (isLengthActive) {
    const bookPages =
      typeof book.total_pages === "number" && book.total_pages > 0
        ? book.total_pages
        : typeof book.pages === "number" && book.pages > 0
          ? book.pages
          : null;

    if (bookPages === null) {
      return false;
    }

    const [minPages, maxPages] = pageRange;
    if (bookPages < minPages) {
      return false;
    }
    if (maxPages < MAX_BOOK_LENGTH && bookPages > maxPages) {
      return false;
    }
  }

  return true;
}
