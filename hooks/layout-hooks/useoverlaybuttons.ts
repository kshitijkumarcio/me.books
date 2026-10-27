"use client";

import { create } from "zustand";

interface OverlayButtons {
  isAboutOpen: boolean;
  isUseCaseOpen: boolean;
  pageView: "index" | "moodboard";
  toggleAbout: () => void;
  toggleUseCase: () => void;
  openAbout: () => void;
  closeAbout: () => void;
  setIsAboutOpen: (isAboutOpen: boolean) => void;
  setIsUseCaseOpen: (isUseCaseOpen: boolean) => void;
  setPageView: (pageView: "index" | "moodboard") => void;
}

export const useOverlayButtons = create<OverlayButtons>((set) => ({
  isAboutOpen: false,
  isUseCaseOpen: false,
  pageView: "moodboard",
  setPageView: (pageView: "index" | "moodboard") => set({ pageView }),
  toggleAbout: () => set((state) => ({ isAboutOpen: !state.isAboutOpen })),
  toggleUseCase: () =>
    set((state) => ({ isUseCaseOpen: !state.isUseCaseOpen })),
  openAbout: () => set({ isAboutOpen: true }),
  closeAbout: () => set({ isAboutOpen: false }),
  openUseCase: () => set({ isUseCaseOpen: true }),
  closeUseCase: () => set({ isUseCaseOpen: false }),
  setIsAboutOpen: (isAboutOpen: boolean) => set({ isAboutOpen }),
  setIsUseCaseOpen: (isUseCaseOpen: boolean) => set({ isUseCaseOpen }),
}));
