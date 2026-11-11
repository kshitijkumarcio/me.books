"use client";

import { create } from "zustand";

export const READ_BOOK_TRANSITION_DURATION = 0.8;
export const READ_BOOK_TRANSITION_DURATION_MS = 800;
export const READ_BOOK_TRANSITION_EASE = [0.76, 0, 0.24, 1] as const;

interface ReadBookModalState {
  isClosing: boolean;
  isInterceptedOpen: boolean;
  setIsClosing: (isClosing: boolean) => void;
  setIsInterceptedOpen: (isInterceptedOpen: boolean) => void;
  triggerClose: (onCloseComplete: () => void) => void;
}

export const useReadBookModal = create<ReadBookModalState>((set) => ({
  isClosing: false,
  isInterceptedOpen: false,
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
      set({ isClosing: false, isInterceptedOpen: false });
    }, READ_BOOK_TRANSITION_DURATION_MS + 400);
  },
}));
