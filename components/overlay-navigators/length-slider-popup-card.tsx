"use client";

import { useRef, useCallback } from "react";
import { motion } from "motion/react";
import { easing016 } from "@/constants";

interface LengthSliderPopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  minPages?: number;
  maxPages?: number;
  step?: number;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export const LengthSliderPopupCard = ({
  isOpen,
  onClose,
  minPages = 50,
  maxPages = 850,
  step = 25,
  range,
  onRangeChange,
}: LengthSliderPopupCardProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumbRef = useRef<"min" | "max" | null>(null);

  const [minVal, maxVal] = range;
  const totalSpan = maxPages - minPages;

  const leftPercent = Math.max(
    0,
    Math.min(100, ((minVal - minPages) / totalSpan) * 100)
  );
  const rightPercent = Math.max(
    0,
    Math.min(100, ((maxVal - minPages) / totalSpan) * 100)
  );

  const calculateSteppedValue = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return minPages;
      const rect = trackRef.current.getBoundingClientRect();
      const rawRatio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const rawValue = minPages + rawRatio * totalSpan;
      return Math.round(rawValue / step) * step;
    },
    [minPages, totalSpan, step]
  );

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    thumb: "min" | "max"
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingThumbRef.current = thumb;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingThumbRef.current) return;
    const stepped = calculateSteppedValue(e.clientX);

    if (draggingThumbRef.current === "min") {
      const clamped = Math.max(minPages, Math.min(stepped, maxVal - step));
      if (clamped !== minVal) {
        onRangeChange([clamped, maxVal]);
      }
    } else {
      const clamped = Math.min(maxPages, Math.max(stepped, minVal + step));
      if (clamped !== maxVal) {
        onRangeChange([minVal, clamped]);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingThumbRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      draggingThumbRef.current = null;
    }
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const clickedVal = calculateSteppedValue(e.clientX);
    const distToMin = Math.abs(clickedVal - minVal);
    const distToMax = Math.abs(clickedVal - maxVal);

    if (distToMin <= distToMax) {
      const clamped = Math.max(minPages, Math.min(clickedVal, maxVal - step));
      onRangeChange([clamped, maxVal]);
    } else {
      const clamped = Math.min(maxPages, Math.max(clickedVal, minVal + step));
      onRangeChange([minVal, clamped]);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.26, ease: easing016 }}
      className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-[calc(100vw-32px)] max-w-105 -translate-x-1/2 overflow-hidden rounded-xl border border-black/15 bg-[#FBFBFA] shadow-2xl sm:w-auto sm:min-w-95"
    >
      {/* Top Section: Dual-Thumb Slider (matching Image 4) */}
      <div className="flex items-center gap-x-4 px-5 py-6 sm:px-6">
        {/* Left Label: ø {minVal}p */}
        <span className="font-mona-sans min-w-16 text-[13px] font-semibold text-black select-none sm:text-[14px]">
          ø {minVal}p
        </span>

        {/* Range Slider Track */}
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative flex h-8 flex-1 cursor-pointer items-center select-none touch-none"
        >
          {/* Base Track Line */}
          <div className="h-[2px] w-full rounded-full bg-black/25" />

          {/* Active Track Highlight */}
          <div
            className="absolute h-[2px] rounded-full bg-black"
            style={{
              left: `${leftPercent}%`,
              width: `${Math.max(0, rightPercent - leftPercent)}%`,
            }}
          />

          {/* Left Thumb (with outer circle and centered black dot, matching Image 4) */}
          <button
            type="button"
            role="slider"
            aria-label="Minimum page length"
            aria-valuemin={minPages}
            aria-valuemax={maxVal - step}
            aria-valuenow={minVal}
            onPointerDown={(e) => handlePointerDown(e, "min")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onRangeChange([
                  Math.max(minPages, minVal - step),
                  maxVal,
                ]);
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onRangeChange([
                  Math.min(maxVal - step, minVal + step),
                  maxVal,
                ]);
              }
            }}
            style={{
              left: `${leftPercent}%`,
            }}
            className="group/thumb absolute -translate-x-1/2 cursor-grab active:cursor-grabbing flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-white shadow-sm transition-transform hover:scale-110 active:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {/* Inner Black Dot */}
            <span className="h-1.5 w-1.5 rounded-full bg-black transition-transform group-hover/thumb:scale-125" />
          </button>

          {/* Right Thumb (with outer circle and centered black dot, matching Image 4) */}
          <button
            type="button"
            role="slider"
            aria-label="Maximum page length"
            aria-valuemin={minVal + step}
            aria-valuemax={maxPages}
            aria-valuenow={maxVal}
            onPointerDown={(e) => handlePointerDown(e, "max")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onRangeChange([
                  minVal,
                  Math.max(minVal + step, maxVal - step),
                ]);
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onRangeChange([
                  minVal,
                  Math.min(maxPages, maxVal + step),
                ]);
              }
            }}
            style={{
              left: `${rightPercent}%`,
            }}
            className="group/thumb absolute -translate-x-1/2 cursor-grab active:cursor-grabbing flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-white shadow-sm transition-transform hover:scale-110 active:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {/* Inner Black Dot */}
            <span className="h-1.5 w-1.5 rounded-full bg-black transition-transform group-hover/thumb:scale-125" />
          </button>
        </div>

        {/* Right Label: ø {maxVal}p (or 850p+) */}
        <span className="font-mona-sans min-w-16 text-right text-[13px] font-semibold text-black select-none sm:text-[14px]">
          ø {maxVal >= maxPages ? `${maxPages}p+` : `${maxVal}p`}
        </span>
      </div>

      {/* Bottom Section: Back Button with Left Arrow (matching Image 4) */}
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
