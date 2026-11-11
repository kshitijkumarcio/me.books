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

interface BookShelfAnimatorProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

export const BookShelfAnimator = ({
  children,
  modal,
}: BookShelfAnimatorProps) => {
  const pathname = usePathname();
  const { isClosing, setIsClosing } = useReadBookModal();

  // Route matches a read book detail view
  const isReadBookRoute = Boolean(pathname?.includes("/read/"));

  // Reset isClosing once the route has actually navigated away from /read/
  useEffect(() => {
    if (!isReadBookRoute && isClosing) {
      setIsClosing(false);
    }
  }, [isReadBookRoute, isClosing, setIsClosing]);

  // An intercepted navigation has both the route match AND the modal slot populated
  const isInterceptedModal = Boolean(isReadBookRoute && modal);

  // The main page should shift up when intercepted modal is open and not in the middle of closing
  const shouldShiftUp = isInterceptedModal && !isClosing;

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden">
      {/* Main page content wrapper - shifts up when read book is opened */}
      <motion.div
        initial="closed"
        animate={shouldShiftUp ? "opened" : "closed"}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        variants={{
          opened: {
            y: "-70%",
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
          "relative min-h-screen w-full transform-gpu will-change-transform backface-hidden",
          shouldShiftUp && "pointer-events-none select-none"
        )}
      >
        {children}
      </motion.div>

      {/* Intercepted modal slot */}
      {modal}
    </div>
  );
};

export default BookShelfAnimator;
