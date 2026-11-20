"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { easing016 } from "@/constants";

export interface SubOptionItem {
  id: string;
  label: string;
}

interface SubOptionPopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  options: readonly SubOptionItem[];
  selectedValues: string[];
  onToggleValue: (value: string) => void;
  focusedIndex?: number | null;
}

export const SubOptionPopupCard = ({
  isOpen,
  onClose,
  options,
  selectedValues,
  onToggleValue,
  focusedIndex = null,
}: SubOptionPopupCardProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.26, ease: easing016 }}
      className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-max max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-xl border border-black/15 bg-[#FBFBFA] shadow-2xl sm:min-w-85"
    >
      {/* Top Section: Pill Options (matching Image 3) */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-4 sm:p-4.5 max-w-[90vw]">
        {options.map((opt, index) => {
          const isAllOption = opt.id === "all";
          const isSelected = isAllOption
            ? selectedValues.length === 0
            : selectedValues.includes(opt.id);
          const isFocused = focusedIndex !== null && focusedIndex === index;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggleValue(opt.id)}
              className={cn(
                "group/pill pointer-events-auto flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-[13px] sm:text-[14px] font-semibold transition-all duration-200 outline-none select-none",
                isFocused
                  ? "bg-neon text-black"
                  : isSelected
                    ? "bg-black text-white hover:bg-black/90"
                    : "bg-black/6 text-black hover:bg-neon hover:text-black"
              )}
            >
              <span className="font-mona-sans whitespace-nowrap">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Back Button with Left Arrow (matching Image 3) */}
      <div className="border-t border-black/10 bg-white/40">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to menu"
          className="group/back flex h-11 w-full cursor-pointer items-center justify-center text-black/70 transition-colors duration-200 hover:bg-black/5 hover:text-black outline-none select-none"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5 transition-transform duration-200 ease-out group-hover/back:-translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};
