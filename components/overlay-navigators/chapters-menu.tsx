"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";
import { ChaptersIcon } from "./icons";
import FlipTextButton from "../ui-components/flip-text-button";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";

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
  const isMobile = useMediaQuery("(max-width: 639px)");
  // On mobile only: if curate or shortlist menu is open, chapters menu collapses to zero width.
  // On desktop: chapters remains visible side-by-side with curate/shortlist.
  const isHiddenByOtherMenu =
    isMobile && (isCurateMenuOpen || Boolean(isShortlistMenuOpen));

  return (
    <AnimatePresence initial={false}>
      {!isHiddenByOtherMenu && (
        <motion.div
          key="chapters-main-container"
          ref={chaptersMenuRef}
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: "auto",
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
            "flex max-w-[90vw] shrink-0 items-center gap-x-1",
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
          <div className="relative flex max-w-[calc(90vw-44px)] items-center">
            <AnimatePresence initial={false}>
              {!isChaptersMenuOpen ? (
                <motion.div
                  key="chapters-text-button"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: "auto",
                    opacity: 1,
                    transition: {
                      width: { duration: 0.4, ease: easing016 },
                      opacity: { duration: 0.25, delay: 0.05, ease: easing016 },
                    },
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: {
                      opacity: { duration: 0.15, ease: easing016 },
                      width: { duration: 0.35, ease: easing016 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="w-max shrink-0">
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
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chapters-menu-items"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: "auto",
                    opacity: 1,
                    transition: {
                      width: { duration: 0.4, ease: easing016 },
                      opacity: { duration: 0.25, delay: 0.06, ease: easing016 },
                    },
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: {
                      opacity: { duration: 0.15, ease: easing016 },
                      width: { duration: 0.35, ease: easing016 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="no-scrollbar flex w-max max-w-[calc(90vw-44px)] items-center gap-x-1 overflow-x-auto py-0.5">
                    {/* bookshelf */}
                    <button
                      type="button"
                      onClick={() => goToZone("books-read")}
                      className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
                    >
                      <FlipTextButton>
                        <span className="font-mona-sans flex items-center justify-center text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
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
                      className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
                    >
                      <FlipTextButton>
                        <span className="font-mona-sans flex items-center justify-center text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
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
                      className="group/item hover:bg-neon pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-black bg-black px-3 text-white transition-colors duration-200 outline-none select-none hover:text-black sm:px-4"
                    >
                      <FlipTextButton>
                        <span className="font-mona-sans flex items-center justify-center text-[13px] font-semibold whitespace-nowrap text-white transition-colors duration-200 group-hover/item:text-black sm:text-[14px]">
                          {activeZoneId === "wishlist" && (
                            <span className="rounded-2xs mr-1.5 inline-block h-1.5 w-1.5 shrink-0 bg-current align-middle" />
                          )}
                          wishlist
                        </span>
                      </FlipTextButton>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};