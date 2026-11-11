"use client";

import { create } from "zustand";

interface ReadBookModalState {
  isClosing: boolean;
  setIsClosing: (isClosing: boolean) => void;
  triggerClose: (onCloseComplete: () => void) => void;
}

export const useReadBookModal = create<ReadBookModalState>((set) => ({
  isClosing: false,
  setIsClosing: (isClosing) => set({ isClosing }),
  triggerClose: (onCloseComplete) => {
    set({ isClosing: true });
    // Duration matches the motion transition (0.8s)
    setTimeout(() => {
      onCloseComplete();
      set({ isClosing: false });
    }, 800);
  },
}));
