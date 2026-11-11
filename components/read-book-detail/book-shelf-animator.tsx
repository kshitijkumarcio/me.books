"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";

interface BookShelfAnimatorProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

export const BookShelfAnimator = ({
  children,
  modal,
}: BookShelfAnimatorProps) => {
  const pathname = usePathname();
  const { isClosing } = useReadBookModal();

  // Route matches a read book detail view
  const isReadBookRoute = Boolean(pathname?.includes("/read/"));

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
            y: "-100dvh",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          },
          closed: {
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
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
