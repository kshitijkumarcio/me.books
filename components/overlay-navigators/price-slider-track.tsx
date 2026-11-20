"use client";

import { useRef, useCallback } from "react";
import { MIN_BOOK_PRICE, MAX_BOOK_PRICE } from "./constants";

interface PriceSliderTrackProps {
  minPrice?: number;
  maxPrice?: number;
  step?: number;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
  compact?: boolean;
}

export const PriceSliderTrack = ({
  minPrice = MIN_BOOK_PRICE,
  maxPrice = MAX_BOOK_PRICE,
  step = 25,
  range,
  onRangeChange,
  compact = false,
}: PriceSliderTrackProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumbRef = useRef<"min" | "max" | null>(null);

  const [minVal, maxVal] = range;
  const totalSpan = maxPrice - minPrice;

  const leftPercent = Math.max(
    0,
    Math.min(100, ((minVal - minPrice) / totalSpan) * 100)
  );
  const rightPercent = Math.max(
    0,
    Math.min(100, ((maxVal - minPrice) / totalSpan) * 100)
  );

  const calculateSteppedValue = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return minPrice;
      const rect = trackRef.current.getBoundingClientRect();
      const rawRatio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const rawValue = minPrice + rawRatio * totalSpan;
      return Math.round(rawValue / step) * step;
    },
    [minPrice, totalSpan, step]
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
      const clamped = Math.max(minPrice, Math.min(stepped, maxVal - step));
      if (clamped !== minVal) {
        onRangeChange([clamped, maxVal]);
      }
    } else {
      const clamped = Math.min(maxPrice, Math.max(stepped, minVal + step));
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
      const clamped = Math.max(minPrice, Math.min(clickedVal, maxVal - step));
      onRangeChange([clamped, maxVal]);
    } else {
      const clamped = Math.min(maxPrice, Math.max(clickedVal, minVal + step));
      onRangeChange([minVal, clamped]);
    }
  };

  return (
    <div
      className={`flex items-center select-none ${
        compact
          ? "w-56 gap-x-4 sm:w-64 sm:gap-x-5"
          : "w-full gap-x-4 sm:gap-x-6"
      }`}
    >
      {/* Left Label */}
      <span className="font-mona-sans shrink-0 text-[12px] font-semibold text-black select-none sm:text-[13px]">
        ₹{minVal}
      </span>

      {/* Slider Track */}
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className="relative mx-1 flex h-7 flex-1 cursor-pointer touch-none items-center select-none"
      >
        {/* Base Track Line */}
        <div className="h-0.5 w-full rounded-full bg-black/25" />

        {/* Active Track Highlight */}
        <div
          className="absolute h-0.5 rounded-full bg-black"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(0, rightPercent - leftPercent)}%`,
          }}
        />

        {/* Left Thumb */}
        <button
          type="button"
          role="slider"
          aria-label="Minimum book price"
          aria-valuemin={minPrice}
          aria-valuemax={maxVal - step}
          aria-valuenow={minVal}
          onPointerDown={(e) => handlePointerDown(e, "min")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onRangeChange([Math.max(minPrice, minVal - step), maxVal]);
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onRangeChange([Math.min(maxVal - step, minVal + step), maxVal]);
            }
          }}
          style={{
            left: `${leftPercent}%`,
          }}
          className="group/thumb absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-black/40 bg-white shadow-sm transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-black active:scale-105 active:cursor-grabbing sm:h-5.5 sm:w-5.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-black transition-transform group-hover/thumb:scale-125" />
        </button>

        {/* Right Thumb */}
        <button
          type="button"
          role="slider"
          aria-label="Maximum book price"
          aria-valuemin={minVal + step}
          aria-valuemax={maxPrice}
          aria-valuenow={maxVal}
          onPointerDown={(e) => handlePointerDown(e, "max")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onRangeChange([minVal, Math.max(minVal + step, maxVal - step)]);
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onRangeChange([minVal, Math.min(maxPrice, maxVal + step)]);
            }
          }}
          style={{
            left: `${rightPercent}%`,
          }}
          className="group/thumb absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-black/40 bg-white shadow-sm transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-black active:scale-105 active:cursor-grabbing sm:h-5.5 sm:w-5.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-black transition-transform group-hover/thumb:scale-125" />
        </button>
      </div>

      {/* Right Label */}
      <span className="font-mona-sans shrink-0 text-right text-[12px] font-semibold text-black select-none sm:text-[13px]">
        {maxVal >= maxPrice ? "₹1000+" : `₹${maxVal}`}
      </span>
    </div>
  );
};
