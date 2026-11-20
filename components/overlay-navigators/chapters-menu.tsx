"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { ChaptersIcon } from "./icons";
import FlipTextButton from "../ui-components/flip-text-button";

interface ChaptersMenuProps {
  chaptersMenuRef: React.RefObject<HTMLDivElement | null>;
  isChaptersMenuOpen: boolean;
  isChaptersHovered: boolean;
  setIsChaptersHovered: (hovered: boolean) => void;
  isCurateMenuOpen: boolean;
  setExpandedCurateSection: (section: "genre" | "length" | null) => void;
  openChaptersMenu: () => void;
  toggleChaptersMenu: () => void;
  goToZone: (zoneId: "books-read" | "current-reads" | "wishlist") => void;
}

export const ChaptersMenu = ({
  chaptersMenuRef,
  isChaptersMenuOpen,
  isChaptersHovered,
  setIsChaptersHovered,
  isCurateMenuOpen,
  setExpandedCurateSection,
  openChaptersMenu,
  toggleChaptersMenu,
  goToZone,
}: ChaptersMenuProps) => {
  return (
    <motion.div
      ref={chaptersMenuRef}
      layout
      transition={{ duration: 0.4, ease: easing016 }}
      onPointerEnter={() => {
        if (!isChaptersMenuOpen) setIsChaptersHovered(true);
      }}
      onPointerLeave={() => {
        setIsChaptersHovered(false);
      }}
      className={cn(
        "flex shrink-0 items-center gap-x-1",
        !isChaptersMenuOpen && "group/chapters cursor-pointer"
      )}
    >
      {/* The Icon Button (morphs between Chapters Square and Close Cross) */}
      <button
        type="button"
        onClick={() => {
          if (isCurateMenuOpen) {
            setExpandedCurateSection(null);
            openChaptersMenu();
          } else {
            toggleChaptersMenu();
          }
        }}
        aria-label={
          isChaptersMenuOpen ? "Close chapters menu" : "Open chapters menu"
        }
        className={cn(
          "pointer-events-auto flex aspect-square w-10 cursor-pointer items-center justify-center rounded-sm border border-black outline-none select-none",
          isChaptersMenuOpen
            ? "group/close hover:bg-neon bg-black text-[#FEFEFE] transition-colors duration-200 hover:text-black"
            : "bg-black text-[#FEFEFE]"
        )}
      >
        <ChaptersIcon
          isOpen={isChaptersMenuOpen}
          isParentHovered={!isChaptersMenuOpen && isChaptersHovered}
        />
      </button>

      {/* Chapters text button OR Chapter menu items */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: easing016 }}
        className="relative overflow-x-clip"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isChaptersMenuOpen ? (
            <motion.div
              key="chapters-text-button"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.4, ease: easing016 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.4, ease: easing016 },
              }}
              className="w-max shrink-0"
            >
              <button
                type="button"
                onClick={() => {
                  if (isCurateMenuOpen) {
                    setExpandedCurateSection(null);
                    openChaptersMenu();
                  } else {
                    toggleChaptersMenu();
                  }
                }}
                className="pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-4 outline-none select-none"
              >
                <FlipTextButton isHovered={isChaptersHovered}>
                  <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-white">
                    chapters
                  </p>
                </FlipTextButton>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="chapters-menu-items"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.3,
                  delay: 0.08,
                  ease: easing016,
                },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15, ease: easing016 },
              }}
              className="flex w-max shrink-0 items-center gap-x-1"
            >
              {/* bookshelf */}
              <button
                type="button"
                onClick={() => goToZone("books-read")}
                className="group/item hover:bg-neon pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
              >
                <FlipTextButton>
                  <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                    bookshelf
                  </p>
                </FlipTextButton>
              </button>

              {/* current reads */}
              <button
                type="button"
                onClick={() => goToZone("current-reads")}
                className="group/item hover:bg-neon pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
              >
                <FlipTextButton>
                  <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                    current reads
                  </p>
                </FlipTextButton>
              </button>

              {/* wishlist */}
              <button
                type="button"
                onClick={() => goToZone("wishlist")}
                className="group/item hover:bg-neon pointer-events-auto flex h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
              >
                <FlipTextButton>
                  <p className="font-mona-sans text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                    wishlist
                  </p>
                </FlipTextButton>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
