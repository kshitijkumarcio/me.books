"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
} from "@/hooks/layout-hooks/use-read-book-modal";
import ReadBookDetail from "@/components/read-book-detail/read-book-detail";
import CRBookDetail from "@/components/current-reads/cr-book-detail";
import WishlistBookDetail from "@/components/wishlist/wishlist-book-detail";
import {
  getReadBookById,
  getCurrentReadBookById,
  getWishlistBookById,
} from "@/books/books-index";

interface BookShelfAnimatorProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

export const BookShelfAnimator = ({
  children,
  modal,
}: BookShelfAnimatorProps) => {
  const pathname = usePathname();
  const {
    isClosing,
    setIsClosing,
    isInterceptedOpen,
    activeModal,
    openModal,
    clearActiveModal,
  } = useReadBookModal();

  // Route matches any intercepted detail view (/read/, /reading/, /wishlist/) or active native modal
  const isReadBookRoute =
    Boolean(pathname?.includes("/read/")) || activeModal?.type === "read";
  const isReadingRoute =
    Boolean(pathname?.includes("/reading/")) || activeModal?.type === "reading";
  const isWishlistRoute =
    Boolean(pathname?.includes("/wishlist/")) ||
    activeModal?.type === "wishlist";
  const isModalRoute = isReadBookRoute || isReadingRoute || isWishlistRoute;

  // Reset isClosing once the route has actually navigated away from modal views
  useEffect(() => {
    if (!isModalRoute && isClosing) {
      setIsClosing(false);
    }
  }, [isModalRoute, isClosing, setIsClosing]);

  // Synchronize browser history navigation (back/forward) with modal state
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes("/read/")) {
        const id = path.split("/read/")[1]?.split("?")[0];
        if (id) {
          const book = getReadBookById(id);
          if (book) {
            openModal({ type: "read", book, href: `/read/${id}` });
            return;
          }
        }
      } else if (path.includes("/reading/")) {
        const id = path.split("/reading/")[1]?.split("?")[0];
        if (id) {
          const book = getCurrentReadBookById(id);
          if (book) {
            openModal({ type: "reading", book, href: `/reading/${id}` });
            return;
          }
        }
      } else if (path.includes("/wishlist/")) {
        const id = path.split("/wishlist/")[1]?.split("?")[0];
        if (id) {
          const book = getWishlistBookById(id);
          if (book) {
            openModal({ type: "wishlist", book, href: `/wishlist/${id}` });
            return;
          }
        }
      }
      clearActiveModal();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [clearActiveModal, openModal]);

  // The shelf should shift up ONLY when an intercepted modal is actively open over the shelf.
  // On a direct visit or refresh to a standalone book route, activeModal and isInterceptedOpen are false,
  // so the standalone book page in `children` stays at y: "0%" without any offset or push off-screen.
  const isInterceptedModalActive = Boolean(activeModal) || isInterceptedOpen;
  const shouldShiftUp = isInterceptedModalActive && !isClosing;

  // Instant native-feel modal rendered immediately on click, falling back to Next.js parallel route modal
  let modalContent = modal;
  if (activeModal) {
    if (activeModal.type === "read") {
      modalContent = (
        <ReadBookDetail
          key={`read-${activeModal.book.id}`}
          book={activeModal.book}
          isIntercepted={true}
        />
      );
    } else if (activeModal.type === "reading") {
      modalContent = (
        <CRBookDetail
          key={`reading-${activeModal.book.id}`}
          book={activeModal.book}
          isIntercepted={true}
        />
      );
    } else if (activeModal.type === "wishlist") {
      modalContent = (
        <WishlistBookDetail
          key={`wishlist-${activeModal.book.id}`}
          book={activeModal.book}
          isIntercepted={true}
        />
      );
    }
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden">
      {/* Main page content wrapper - shifts up only when an intercepted modal is opened over the shelf */}
      <motion.div
        initial="closed"
        animate={shouldShiftUp ? "opened" : "closed"}
        style={
          shouldShiftUp
            ? {
                willChange: "transform",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }
            : undefined
        }
        variants={{
          opened: {
            y: "-55%",
            transition: {
              duration: READ_BOOK_TRANSITION_DURATION,
              ease: READ_BOOK_TRANSITION_EASE,
            },
          },
          closed: {
            y: "0%",
            transition: {
              duration: READ_BOOK_TRANSITION_DURATION,
              ease: READ_BOOK_TRANSITION_EASE,
            },
          },
        }}
        className={cn(
          "relative min-h-screen w-full",
          shouldShiftUp &&
            "pointer-events-none transform-gpu will-change-transform select-none backface-hidden"
        )}
      >
        {children}
      </motion.div>

      {/* Intercepted modal slot or immediate native-feel modal */}
      {modalContent}
    </div>
  );
};

export default BookShelfAnimator;
