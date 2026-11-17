"use client";

import { create } from "zustand";
import type {
  ReadBook,
  CurrentlyReadingBook,
  WishlistBook,
} from "@/books/books-index";

export const READ_BOOK_TRANSITION_DURATION = 0.8;
export const READ_BOOK_TRANSITION_DURATION_MS = 800;
export const READ_BOOK_TRANSITION_EASE = [0.76, 0, 0.24, 1] as const;

export type ActiveModalBook =
  | { type: "read"; book: ReadBook; href: string }
  | { type: "reading"; book: CurrentlyReadingBook; href: string }
  | { type: "wishlist"; book: WishlistBook; href: string };

interface ReadBookModalState {
  isClosing: boolean;
  isInterceptedOpen: boolean;
  activeModal: ActiveModalBook | null;
  openModal: (modal: ActiveModalBook) => void;
  clearActiveModal: () => void;
  setIsClosing: (isClosing: boolean) => void;
  setIsInterceptedOpen: (isInterceptedOpen: boolean) => void;
  triggerClose: (onCloseComplete: () => void) => void;
}

export const useReadBookModal = create<ReadBookModalState>((set) => ({
  isClosing: false,
  isInterceptedOpen: false,
  activeModal: null,
  openModal: (activeModal) =>
    set({
      activeModal,
      isInterceptedOpen: true,
      isClosing: false,
    }),
  clearActiveModal: () => set({ activeModal: null }),
  setIsClosing: (isClosing) => set({ isClosing }),
  setIsInterceptedOpen: (isInterceptedOpen) => set({ isInterceptedOpen }),
  triggerClose: (onCloseComplete) => {
    set({ isClosing: true });
    // Match the exact motion transition duration (800ms)
    setTimeout(() => {
      onCloseComplete();
    }, READ_BOOK_TRANSITION_DURATION_MS);

    // Safety fallback to ensure isClosing is reset even if route change fails
    setTimeout(() => {
      set({ isClosing: false, isInterceptedOpen: false, activeModal: null });
    }, READ_BOOK_TRANSITION_DURATION_MS + 400);
  },
}));
