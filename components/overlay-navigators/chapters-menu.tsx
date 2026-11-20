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
  isShortlistMenuOpen?: boolean;
  setExpandedShortlistSection?: (section: "price" | "priority" | null) => void;
  openChaptersMenu: () => void;
  toggleChaptersMenu: () => void;
  goToZone: (zoneId: "books-read" | "current-reads" | "wishlist") => void;
  activeZoneId?: string;
}

export const ChaptersMenu = ({
  chaptersMenuRef,
  isChaptersMenuOpen,
  isChaptersHovered,
  setIsChaptersHovered,
  isCurateMenuOpen,
  setExpandedCurateSection,
  isShortlistMenuOpen,
  setExpandedShortlistSection,
  openChaptersMenu,
  toggleChaptersMenu,
  goToZone,
  activeZoneId,
}: ChaptersMenuProps) => {
  const isHiddenByOtherMenu = isCurateMenuOpen || Boolean(isShortlistMenuOpen);

  return (
    <AnimatePresence initial={false}>
      {!isHiddenByOtherMenu && (
        <motion.div
          key="chapters-main-container"
          ref={chaptersMenuRef}
          layout
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: isChaptersMenuOpen ? "100%" : "auto",
            transition: { duration: 0.4, ease: easing016 },
          }}
          exit={{
            opacity: 0,
            width: 0,
            transition: { duration: 0.3, ease: easing016 },
          }}
          onPointerEnter={() => {
            if (!isChaptersMenuOpen) setIsChaptersHovered(true);
          }}
          onPointerLeave={() => {
            setIsChaptersHovered(false);
          }}
          className={cn(
            "flex items-center gap-x-1 max-w-[90vw]",
            isChaptersMenuOpen
              ? "w-max"
              : "shrink-0",
            !isChaptersMenuOpen && "group/chapters cursor-pointer"
          )}
        >
          {/* The Icon Button (morphs between Chapters Square and Close Cross) */}
          <button
            type="button"
            onClick={() => {
              if (isCurateMenuOpen || isShortlistMenuOpen) {
                setExpandedCurateSection(null);
                setExpandedShortlistSection?.(null);
                openChaptersMenu();
              } else {
                toggleChaptersMenu();
              }
            }}
            aria-label={
              isChaptersMenuOpen ? "Close chapters menu" : "Open chapters menu"
            }
            className={cn(
              "pointer-events-auto flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black outline-none select-none",
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
            className={cn(
              "relative overflow-hidden max-w-[calc(90vw-44px)]",
              isChaptersMenuOpen ? "w-max" : "w-max shrink-0"
            )}
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
                      if (isCurateMenuOpen || isShortlistMenuOpen) {
                        setExpandedCurateSection(null);
                        setExpandedShortlistSection?.(null);
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
                  className="flex w-max items-center gap-x-1 overflow-x-auto no-scrollbar py-0.5"
                >
                  {/* bookshelf */}
                  <button
                    type="button"
                    onClick={() => goToZone("books-read")}
                    className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 sm:px-4 text-white transition-colors duration-200 outline-none select-none hover:text-black"
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans flex items-center justify-center text-[13px] sm:text-[14px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black">
                        {activeZoneId === "books-read" && (
                          <span className="rounded-2xs mr-1.5 inline-block h-1.5 w-1.5 shrink-0 bg-current align-middle" />
                        )}
                        bookshelf
                      </span>
                    </FlipTextButton>
                  </button>

                  {/* current reads */}
                  <button
                    type="button"
                    onClick={() => goToZone("current-reads")}
                    className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 sm:px-4 text-white transition-colors duration-200 outline-none select-none hover:text-black"
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans flex items-center justify-center text-[13px] sm:text-[14px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black">
                        {activeZoneId === "current-reads" && (
                          <span className="rounded-2xs mr-1.5 inline-block h-1.5 w-1.5 shrink-0 bg-current align-middle" />
                        )}
                        current reads
                      </span>
                    </FlipTextButton>
                  </button>

                  {/* wishlist */}
                  <button
                    type="button"
                    onClick={() => goToZone("wishlist")}
                    className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 sm:px-4 text-white transition-colors duration-200 outline-none select-none hover:text-black"
                  >
                    <FlipTextButton>
                      <span className="font-mona-sans flex items-center justify-center text-[13px] sm:text-[14px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black">
                        {activeZoneId === "wishlist" && (
                          <span className="rounded-2xs mr-1.5 inline-block h-1.5 w-1.5 shrink-0 bg-current align-middle" />
                        )}
                        wishlist
                      </span>
                    </FlipTextButton>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
