"use client";

import { motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { dotRows, dotVariants, easing016 } from "@/constants";

export const ViewDotsIcon = ({
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

export const AmazonIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M13.91 16.59c-3.23 2.38-7.85 3.65-11.91 1.05-.59-.38-.07-.94.49-.69 3.49 1.54 8.01 1.76 11.02-.36.46-.33.9.27.4.7z" />
    <path d="M14.92 15.54c-.41-.53-2.73-.25-3.77-.13-.31.04-.36-.23-.08-.43 1.83-1.32 4.83-.94 5.19-.48.36.46-.1 3.47-1.84 4.93-.27.23-.52.1-.4-.2.4-.98.9-3.69-.3-4.32z" />
    <path d="M14.39 12.35c-.09.7-.15 1.54-.73 2.01-.52.42-1.22.49-1.86.49-1.21 0-2.4-.49-2.58-1.86-.19-1.46.88-2.31 2.09-2.52.92-.16 2.22-.19 2.97-.24l.11 2.12zm1.88 4.22c-.17.18-.42.23-.63.14-.85-.36-1.02-1.24-1.07-2.1l-.05-.88c-.68.04-1.55.08-2.22.21-1.72.33-3.32 1.39-3.05 3.51.23 1.82 1.83 2.68 3.43 2.68 1.48 0 2.59-.57 3.25-1.57.06.33.09.68.14 1.02.04.28.24.49.52.49h1.49c.28 0 .49-.22.46-.5l-.75-4.43c-.15-.88-.16-1.95-.73-2.67-.85-1.07-2.18-1.37-3.48-1.37-2.21 0-4.18.99-4.57 3.32-.05.28.16.52.45.54l1.65.12c.24.02.46-.16.5-.4.23-1.27 1.15-1.82 2.22-1.82.91 0 1.83.33 2.08 1.29.17.65.1 1.34.1 2.02l-.01.85z" />
  </svg>
);

export const ChaptersIcon = ({
  isOpen = false,
  isParentHovered = false,
}: {
  isOpen?: boolean;
  isParentHovered?: boolean;
}) => {
  const isHovered = !isOpen && isParentHovered;

  return (
    <div className="relative flex h-4 w-4 items-center justify-center">
      {/* Broken Rounded Square (visible when closed, rotates and scales out when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 0, rotate: 45, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="pointer-events-none absolute inset-0"
      >
        {/* Center Filled Square - visible at rest (non-hovered), scales down and fades out on hover */}
        <div
          className={cn(
            "absolute inset-0 m-auto aspect-square h-2 w-2 rounded-xs bg-current",
            "origin-center transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "scale-0 opacity-0"
              : "scale-100 opacity-100 group-hover/chapters:scale-0 group-hover/chapters:opacity-0"
          )}
        />

        {/* Top-Left Corner */}
        <div
          className={cn(
            "absolute top-0 left-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[3.75px] translate-y-[3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.75 5.5 V 2.5 C 0.75 1.5 1.5 0.75 2.5 0.75 H 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Top-Right Corner */}
        <div
          className={cn(
            "absolute top-0 right-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[-3.75px] translate-y-[3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.5 0.75 H 3.5 C 4.5 0.75 5.25 1.5 5.25 2.5 V 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Bottom-Left Corner */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[3.75px] translate-y-[-3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.75 0.5 V 3.5 C 0.75 4.5 1.5 5.25 2.5 5.25 H 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Bottom-Right Corner */}
        <div
          className={cn(
            "absolute right-0 bottom-0 h-1.5 w-1.5 text-current",
            "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
            isHovered
              ? "translate-x-0 translate-y-0 text-white"
              : "translate-x-[-3.75px] translate-y-[-3.75px] group-hover/chapters:translate-x-0 group-hover/chapters:translate-y-0"
          )}
        >
          <svg viewBox="0 0 6 6" className="block h-full w-full">
            <path
              d="M 0.5 5.25 H 3.5 C 4.5 5.25 5.25 4.5 5.25 3.5 V 0.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </motion.div>

      {/* Close Cross Icon (scales and rotates in when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/close:rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export const CurateIcon = ({
  isOpen = false,
  isParentHovered = false,
}: {
  isOpen?: boolean;
  isParentHovered?: boolean;
}) => {
  const isHovered = !isOpen && isParentHovered;

  return (
    <div className="relative flex aspect-square w-10 items-center justify-center">
      {/* Sliders Icon (visible when closed, rotates and scales out when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 0, rotate: 45, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-y-1.25"
      >
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
              isHovered
                ? "translate-x-3"
                : "translate-x-1 group-hover/curate:translate-x-3"
            )}
          />
        </div>
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
              isHovered
                ? "translate-x-1"
                : "translate-x-3 group-hover/curate:translate-x-1"
            )}
          />
        </div>
        <div className="relative h-0.5 w-5 bg-black">
          <div
            className={cn(
              "absolute top-1/2 aspect-square h-1.25 -translate-y-1/2 rounded-full bg-black",
              "transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
              isHovered
                ? "translate-x-3"
                : "translate-x-0.75 group-hover/curate:translate-x-3"
            )}
          />
        </div>
      </motion.div>

      {/* Close Cross Icon (scales and rotates in when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/curateclose:rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export const ShortlistIcon = ({
  isOpen = false,
  isParentHovered = false,
}: {
  isOpen?: boolean;
  isParentHovered?: boolean;
}) => {
  const isHovered = !isOpen && isParentHovered;

  return (
    <div className="relative flex aspect-square w-10 items-center justify-center">
      {/* Shortlist Bookmark Ribbon Icon (visible when closed, rotates and scales out when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 0, rotate: 45, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5 origin-center text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M 6.5 3 C 6.5 2.44772 6.94772 2 7.5 2 H 16.5 C 17.0523 2 17.5 2.44772 17.5 3 V 21.5 L 12 17.5 L 6.5 21.5 Z"
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
              isHovered
                ? "fill-black"
                : "fill-transparent group-hover/shortlist:fill-black"
            )}
          />
        </svg>
      </motion.div>

      {/* Close Cross Icon (scales and rotates in when open) */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{ duration: 0.5, ease: easing016 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/shortlistclose:rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};
