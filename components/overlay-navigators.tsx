"use client";

// global imports
import { useState } from "react";
import { motion, type Transition } from "motion/react";

// local imports
import { cn } from "@/lib/utils";
import { dotRows, dotVariants, easing016 } from "@/constants";
import FlipTextButton from "./ui-components/flip-text-button";
import { useOverlayButtons } from "@/hooks/layout-hooks/useoverlaybuttons";
import { useMediaQuery } from "@/hooks/ui-hooks/use-media-query";

const ViewDotsIcon = ({
  pattern,
  transition,
}: {
  pattern: "moodboard" | "grid";
  transition: Transition;
}) => (
  <div className="flex flex-col gap-y-1">
    {dotRows.map((row, rowIdx) => (
      <div key={rowIdx} className="flex gap-x-1">
        {row.map((dotIdx) => (
          <motion.div
            key={dotIdx}
            variants={dotVariants[dotIdx]}
            animate={pattern}
            initial={pattern}
            transition={transition}
            className="aspect-square h-1 rounded-full bg-black"
          />
        ))}
      </div>
    ))}
  </div>
);

const OverlayNavigators = () => {
  const { toggleAbout, toggleUseCase, pageView, setPageView } =
    useOverlayButtons();
  const isThinnerThanLg = useMediaQuery("(max-width: 1023px)");

  const [isMoodboardHovered, setIsMoodboardHovered] = useState<boolean>(false);
  const [isMoodboardClickLocked, setIsMoodboardClickLocked] =
    useState<boolean>(false);

  // When hovering, effectiveHovered is true unless a click just locked the current view
  const effectiveHovered = isMoodboardHovered && !isMoodboardClickLocked;

  // The displayed text and dot pattern always match:
  // In moodboard mode: resting is moodboard (hexagon), hover is grid (3x3 grid)
  // In grid mode: resting is grid (3x3 grid), hover is moodboard (hexagon)
  const isShowingMoodboard =
    pageView === "moodboard" ? !effectiveHovered : effectiveHovered;
  const currentPattern = isShowingMoodboard ? "moodboard" : "grid";

  const dotTransition: Transition = {
    duration: isMoodboardClickLocked ? 0 : 0.8,
    ease: easing016,
  };

  return (
    <div className="fixed top-0 left-0 z-999 flex h-svh w-full flex-col justify-between px-6 pt-4 pb-10">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="">
          <p className="font-mona-sans text-[20px] font-bold">Kshelf.</p>
        </div>
        <div className="hidden gap-x-6 lg:flex">
          <div onClick={() => toggleAbout()} className={cn("cursor-pointer")}>
            <FlipTextButton>
              <p
                className={cn(
                  "font-mona-sans relative text-[14px] font-semibold"
                )}
              >
                about.
              </p>
            </FlipTextButton>
          </div>
          <div className={cn("cursor-pointer")} onClick={() => toggleUseCase()}>
            <FlipTextButton>
              <p
                className={cn(
                  "font-mona-sans relative text-[14px] font-semibold"
                )}
              >
                use case.
              </p>
            </FlipTextButton>
          </div>
        </div>

        {/* mobile dot pattern button (without text) */}
        <div
          onClick={() => {
            setPageView(pageView === "moodboard" ? "index" : "moodboard");
          }}
          className="flex aspect-square h-10 cursor-pointer items-center justify-center rounded-sm border border-black bg-white lg:hidden"
        >
          <ViewDotsIcon pattern={currentPattern} transition={dotTransition} />
        </div>
      </div>

      <div
        onPointerEnter={() => {
          setIsMoodboardClickLocked(false);
          setIsMoodboardHovered(true);
        }}
        onPointerLeave={() => {
          setIsMoodboardClickLocked(false);
          setIsMoodboardHovered(false);
        }}
        onClick={() => {
          setIsMoodboardClickLocked(true);
          setPageView(pageView === "moodboard" ? "index" : "moodboard");
        }}
        className="group/vb absolute top-10 left-1/2 hidden -translate-x-1/2 cursor-pointer items-center justify-center gap-x-1 lg:flex"
      >
        <div className="flex aspect-square h-10 items-center justify-center rounded-sm border border-black bg-white">
          <ViewDotsIcon pattern={currentPattern} transition={dotTransition} />
        </div>
        <div className="flex h-10 min-w-40 items-center justify-center rounded-sm border border-black bg-white px-4">
          <FlipTextButton
            isHovered={effectiveHovered}
            hoverText={
              pageView === "moodboard" ? "grid view" : "moodboard view"
            }
          >
            <p className="font-mona-sans text-[14px] font-semibold whitespace-nowrap text-black">
              {pageView === "moodboard" ? "moodboard view" : "grid view"}
            </p>
          </FlipTextButton>
        </div>
      </div>

      {/* bottom buttons */}
      <div className="flex items-center justify-center gap-x-3">
        {/* first button */}
        <div className="group/nb flex cursor-pointer gap-x-1">
          <div className="flex aspect-square w-10 flex-col items-center justify-center gap-y-[2.5px] rounded-sm bg-black">
            <div className="h-[1.5px] w-4 bg-white"></div>
            <div
              className={cn(
                "h-[1.5px] w-4 origin-center bg-white group-hover/nb:w-0",
                "ease-[cubic-bezier(0.19, 1, 0.22, 1)] duration-500 transform-content"
              )}
            ></div>
            <div className="h-[1.5px] w-4 bg-white"></div>
          </div>
          <div className="flex h-10 items-center justify-center rounded-sm bg-black px-4">
            <FlipTextButton>
              <p className="font-mona-sans text-[14px] font-semibold text-white">
                {isThinnerThanLg ? "navigate" : "chapters"}
              </p>
            </FlipTextButton>
          </div>
        </div>

        {/* second button */}
        <div className="group/fb flex cursor-pointer gap-x-1">
          <div className="flex aspect-square w-10 flex-col items-center justify-center gap-y-1.25 rounded-sm border border-black bg-white">
            <div className="relative h-0.5 w-5 bg-black">
              <div
                className={cn(
                  "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                  "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                  "translate-x-1 transform-content group-hover/fb:translate-x-3"
                )}
              />
            </div>
            <div className="relative h-0.5 w-5 bg-black">
              <div
                className={cn(
                  "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                  "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                  "translate-x-3 transform-content group-hover/fb:translate-x-1"
                )}
              />
            </div>
            <div className="relative h-0.5 w-5 bg-black">
              <div
                className={cn(
                  "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
                  "ease-[cubic-bezier(0.19, 1, 0.22, 1)] transition-transform duration-500",
                  "translate-x-0.75 transform-content group-hover/fb:translate-x-3"
                )}
              />
            </div>
          </div>
          <div className="flex h-10 items-center justify-center rounded-sm border border-black bg-white px-4">
            <FlipTextButton>
              <p className="font-mona-sans text-[14px] font-semibold text-black">
                {isThinnerThanLg ? "filter" : "curate"}
              </p>
            </FlipTextButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayNavigators;
