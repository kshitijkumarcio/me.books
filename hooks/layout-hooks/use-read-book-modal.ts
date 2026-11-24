"use client";

import { create } from "zustand";
import type { StaticImageData } from "next/image";
import type {
  ReadBook,
  CurrentlyReadingBook,
  WishlistBook,
  BookFormat,
} from "@/books/books-index";

export const READ_BOOK_TRANSITION_DURATION = 0.8;
export const READ_BOOK_TRANSITION_DURATION_MS = 800;
export const READ_BOOK_TRANSITION_EASE = [0.76, 0, 0.24, 1] as const;

export interface CoverRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ActiveModalBook =
  | { type: "read"; book: ReadBook; href: string }
  | { type: "reading"; book: CurrentlyReadingBook; href: string }
  | { type: "wishlist"; book: WishlistBook; href: string }
  | { type: "about"; href: string };

export type SharedCoverPhase = "idle" | "entering" | "entered" | "exiting";

export interface SharedCoverPayload {
  bookId: string;
  initialRect: CoverRect;
  restingRect?: CoverRect;
  coverImage?: StaticImageData | string;
  coverAlt?: string;
  format?: BookFormat;
  rotation?: string;
}

interface ReadBookModalState {
  isClosing: boolean;
  isInterceptedOpen: boolean;
  activeModal: ActiveModalBook | null;

  // Shared Element Transition (FLIP) State
  activeBookId: string | null;
  initialCoverRect: CoverRect | null;
  restingCoverRect: CoverRect | null;
  heroCoverRect: CoverRect | null;
  coverImage: StaticImageData | string | null;
  coverAlt: string;
  coverFormat: BookFormat;
  coverRotation: string;
  transitionPhase: SharedCoverPhase;
  onCloseCallback: (() => void) | null;

  openModal: (modal: ActiveModalBook) => void;
  clearActiveModal: () => void;
  setIsClosing: (isClosing: boolean) => void;
  setIsInterceptedOpen: (isInterceptedOpen: boolean) => void;
  triggerClose: (onCloseComplete: () => void) => void;

  startCoverTransition: (payload: SharedCoverPayload) => void;
  setHeroCoverRect: (rect: CoverRect | null) => void;
  completeEnterTransition: () => void;
  completeExitTransition: () => void;
}

export const useReadBookModal = create<ReadBookModalState>((set, get) => ({
  isClosing: false,
  isInterceptedOpen: false,
  activeModal: null,

  activeBookId: null,
  initialCoverRect: null,
  restingCoverRect: null,
  heroCoverRect: null,
  coverImage: null,
  coverAlt: "",
  coverFormat: "standard",
  coverRotation: "rotate-0",
  transitionPhase: "idle",
  onCloseCallback: null,

  openModal: (activeModal) =>
    set({
      activeModal,
      isInterceptedOpen: true,
      isClosing: false,
    }),
  clearActiveModal: () =>
    set({
      activeModal: null,
      transitionPhase: "idle",
      activeBookId: null,
      initialCoverRect: null,
      restingCoverRect: null,
      heroCoverRect: null,
      coverImage: null,
      onCloseCallback: null,
    }),
  setIsClosing: (isClosing) => set({ isClosing }),
  setIsInterceptedOpen: (isInterceptedOpen) => set({ isInterceptedOpen }),

  triggerClose: (onCloseComplete) => {
    const { activeBookId } = get();
    set({
      isClosing: true,
      transitionPhase: activeBookId ? "exiting" : "idle",
      onCloseCallback: onCloseComplete,
    });

    // If there is no active shared cover transition (e.g. /about), complete via timeout
    if (!activeBookId) {
      setTimeout(() => {
        onCloseComplete();
        set({
          isClosing: false,
          isInterceptedOpen: false,
          activeModal: null,
          onCloseCallback: null,
        });
      }, READ_BOOK_TRANSITION_DURATION_MS);
    }
  },

  startCoverTransition: (payload) =>
    set({
      activeBookId: payload.bookId,
      initialCoverRect: payload.initialRect,
      restingCoverRect: payload.restingRect ?? payload.initialRect,
      coverImage: payload.coverImage ?? null,
      coverAlt: payload.coverAlt ?? "",
      coverFormat: payload.format ?? "standard",
      coverRotation: payload.rotation ?? "rotate-0",
      transitionPhase: "entering",
      heroCoverRect: null,
    }),

  setHeroCoverRect: (rect) =>
    set({
      heroCoverRect: rect,
    }),

  completeEnterTransition: () =>
    set({
      transitionPhase: "entered",
    }),

  completeExitTransition: () => {
    const callback = get().onCloseCallback;
    set({
      transitionPhase: "idle",
      activeBookId: null,
      initialCoverRect: null,
      restingCoverRect: null,
      heroCoverRect: null,
      coverImage: null,
      isClosing: false,
      isInterceptedOpen: false,
      activeModal: null,
      onCloseCallback: null,
    });
    if (callback) {
      callback();
    }
  },
}));
