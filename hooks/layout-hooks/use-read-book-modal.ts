"use client";

import { create } from "zustand";
import type { StaticImageData } from "next/image";
import { easing076 } from "@/constants";
import type {
  ReadBook,
  CurrentlyReadingBook,
  WishlistBook,
  BookFormat,
} from "@/books/books-index";

export const READ_BOOK_TRANSITION_DURATION = 0.8;
export const READ_BOOK_TRANSITION_DURATION_MS = 800;
export const MODAL_EXIT_DELAY_MS = 200;
export const READ_BOOK_TRANSITION_EASE = easing076;

let closeDelayTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackCompleteTimer: ReturnType<typeof setTimeout> | null = null;

function clearCloseTimers() {
  if (closeDelayTimer !== null) {
    clearTimeout(closeDelayTimer);
    closeDelayTimer = null;
  }
  if (fallbackCompleteTimer !== null) {
    clearTimeout(fallbackCompleteTimer);
    fallbackCompleteTimer = null;
  }
}

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
  | { type: "about"; href: string }
  | { type: "use-case"; href: string };

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
  isDrawerClosing: boolean;
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
  isDrawerClosing: false,
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

  openModal: (activeModal) => {
    clearCloseTimers();
    set({
      activeModal,
      isInterceptedOpen: true,
      isClosing: false,
      isDrawerClosing: false,
    });
  },
  clearActiveModal: () => {
    clearCloseTimers();
    set({
      activeModal: null,
      transitionPhase: "idle",
      activeBookId: null,
      initialCoverRect: null,
      restingCoverRect: null,
      heroCoverRect: null,
      coverImage: null,
      onCloseCallback: null,
    });
  },
  setIsClosing: (isClosing) => {
    if (!isClosing) {
      clearCloseTimers();
      set({ isClosing: false, isDrawerClosing: false });
    } else {
      set({ isClosing: true });
    }
  },
  setIsInterceptedOpen: (isInterceptedOpen) => set({ isInterceptedOpen }),

  triggerClose: (onCloseComplete) => {
    if (get().isClosing) return;

    clearCloseTimers();
    set({
      isClosing: true,
      isDrawerClosing: false,
      onCloseCallback: onCloseComplete,
    });

    // Wait for inner exit animations (e.g. FullWidthPageTitle) before dropping the drawer and returning the cover
    closeDelayTimer = setTimeout(() => {
      closeDelayTimer = null;
      const { activeBookId } = get();
      set({
        isDrawerClosing: true,
        transitionPhase: activeBookId ? "exiting" : "idle",
      });

      // If there is no active shared cover transition (e.g. /about, /use-case), complete via timeout.
      // Keep isClosing & isDrawerClosing true so BookShelfAnimator / OverlayNavigators don't flicker
      // while router.back() finishes; BookShelfAnimator resets them once !isModalRoute.
      if (!activeBookId) {
        fallbackCompleteTimer = setTimeout(() => {
          fallbackCompleteTimer = null;
          const callback = get().onCloseCallback;
          set({
            isInterceptedOpen: false,
            activeModal: null,
            onCloseCallback: null,
          });
          if (callback) {
            callback();
          }
        }, READ_BOOK_TRANSITION_DURATION_MS);
      }
    }, MODAL_EXIT_DELAY_MS);
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
    clearCloseTimers();
    const callback = get().onCloseCallback;
    set({
      transitionPhase: "idle",
      activeBookId: null,
      initialCoverRect: null,
      restingCoverRect: null,
      heroCoverRect: null,
      coverImage: null,
      isClosing: false,
      isDrawerClosing: false,
      isInterceptedOpen: false,
      activeModal: null,
      onCloseCallback: null,
    });
    if (callback) {
      callback();
    }
  },
}));
