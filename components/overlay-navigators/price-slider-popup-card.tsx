"use client";

import { motion } from "motion/react";
import { easing016 } from "@/constants";
import { PriceSliderTrack } from "./price-slider-track";
import { MIN_BOOK_PRICE, MAX_BOOK_PRICE } from "./constants";

interface PriceSliderPopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice?: number;
  maxPrice?: number;
  step?: number;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export const PriceSliderPopupCard = ({
  isOpen,
  onClose,
  minPrice = MIN_BOOK_PRICE,
  maxPrice = MAX_BOOK_PRICE,
  step = 25,
  range,
  onRangeChange,
}: PriceSliderPopupCardProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.26, ease: easing016 }}
      className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-[90vw] max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-xl border border-black/15 bg-[#FBFBFA] shadow-2xl sm:w-auto sm:min-w-95"
    >
      {/* Top Section: Dual-Thumb Slider */}
      <div className="flex items-center px-4 py-4 sm:px-6">
        <PriceSliderTrack
          minPrice={minPrice}
          maxPrice={maxPrice}
          step={step}
          range={range}
          onRangeChange={onRangeChange}
        />
      </div>

      {/* Bottom Section: Back Button with Left Arrow */}
      <div className="border-t border-black/10 bg-white/40">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to menu"
          className="group/back flex h-10 w-full cursor-pointer items-center justify-center text-black/70 transition-colors duration-200 outline-none select-none hover:bg-black/5 hover:text-black"
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
