"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { rowIndexToLetters } from "./shelf-grid";

export interface GridSizeIndicatorProps {
  cols: number; // K (columns)
  rows: number; // R (rows)
  blockSize?: number; // cells per block
  gapX?: number; // horizontal gap between blocks in cells
  gapY?: number; // vertical gap between rows in cells
  totalBooks?: number;
  explicitBooksCount?: number;
  unpositionedBooksCount?: number;
  totalCapacity?: number;
  isCoordinatesVisible?: boolean;
  onToggleCoordinates?: () => void;
  showGridBounds?: boolean;
  onToggleGridBounds?: () => void;
  enableGridSizeDisplay?: boolean;
}

export const GridSizeIndicator = ({
  cols,
  rows,
  blockSize = 8,
  gapX = 1,
  gapY = 0,
  totalBooks = 0,
  explicitBooksCount = 0,
  unpositionedBooksCount = 0,
  totalCapacity: propTotalCapacity,
  isCoordinatesVisible = false,
  onToggleCoordinates,
  showGridBounds = false,
  onToggleGridBounds,
  enableGridSizeDisplay,
}: GridSizeIndicatorProps) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<"colsXrows" | "rowsXcols">(
    "colsXrows"
  );
  const [isDevParam, setIsDevParam] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check URL param ?dev=true after hydration to safely avoid SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "true") {
        setIsDevParam(true);
      }
    }
  }, []);

  const isDevEnvironment = process.env.NODE_ENV === "development";
  const isDeveloperMode = isDevEnvironment || isDevParam;

  // Only display in developer mode by default, unless explicitly forced via prop
  const shouldShow =
    enableGridSizeDisplay !== undefined
      ? enableGridSizeDisplay
      : isDeveloperMode;

  // Keyboard shortcut: Press 'S' to toggle inspector, 'Escape' to close
  useEffect(() => {
    if (!shouldShow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "s" || e.key === "S") {
        setIsInspectorOpen((prev) => !prev);
      } else if (e.key === "Escape" && isInspectorOpen) {
        setIsInspectorOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow, isInspectorOpen]);

  // Click outside listener to dismiss popup
  useEffect(() => {
    if (!isInspectorOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsInspectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInspectorOpen]);

  // Calculate total capacity across alternating rows
  const calculatedCapacity = useMemo(() => {
    let sum = 0;
    for (let r = 0; r < rows; r++) {
      sum += r % 2 === 0 ? cols : Math.max(1, cols - 1);
    }
    return sum;
  }, [rows, cols]);

  const totalCapacity = propTotalCapacity ?? calculatedCapacity;
  const emptySlotsCount = Math.max(0, totalCapacity - totalBooks);
  const endRowLetter = rowIndexToLetters(Math.max(0, rows - 1));

  if (!shouldShow) {
    return null;
  }

  const primaryLabel =
    displayOrder === "colsXrows" ? `${cols} × ${rows}` : `${rows} × ${cols}`;
  const subLabel =
    displayOrder === "colsXrows"
      ? `${cols}c × ${rows}r`
      : `${rows}r × ${cols}c`;

  return (
    <div ref={containerRef} className="select-none">
      {/* Floating Popover Inspector */}
      <AnimatePresence>
        {isInspectorOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-16 left-4 z-50 mb-2 flex w-84 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 font-sans text-neutral-900 shadow-2xl backdrop-blur-md sm:bottom-18 sm:left-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-neutral-800"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
                <span className="text-xs font-semibold tracking-tight text-neutral-900">
                  Grid System Inspector
                </span>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                  DEV
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-xs text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Primary Dimension Card */}
            <div className="flex items-center justify-between rounded-xl bg-neutral-100/80 p-3">
              <div>
                <p className="font-mono text-2xl font-bold tracking-tight text-neutral-950">
                  {primaryLabel}
                </p>
                <p className="font-mono text-[11px] text-neutral-500">
                  {displayOrder === "colsXrows"
                    ? `${cols} cols × ${rows} rows`
                    : `${rows} rows × ${cols} cols`}
                  <span className="ml-1 text-neutral-400">
                    ({displayOrder === "colsXrows" ? "Cartesian" : "Matrix"})
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDisplayOrder((prev) =>
                    prev === "colsXrows" ? "rowsXcols" : "colsXrows"
                  )
                }
                title="Toggle between Cols × Rows and Rows × Cols"
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50"
              >
                <span>⇄</span>
                <span>{displayOrder === "colsXrows" ? "R × C" : "C × R"}</span>
              </button>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-black/5 bg-neutral-50/80 p-2">
                <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  Pattern
                </p>
                <p className="font-semibold text-neutral-800">
                  Alternating {cols} / {Math.max(1, cols - 1)}
                </p>
                <p className="font-mono text-[10px] text-neutral-500">
                  Even {cols} · Odd {Math.max(1, cols - 1)}
                </p>
              </div>

              <div className="rounded-lg border border-black/5 bg-neutral-50/80 p-2">
                <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  Capacity
                </p>
                <p className="font-semibold text-neutral-800">
                  {totalCapacity} Slots
                </p>
                <p className="font-mono text-[10px] text-neutral-500">
                  {totalBooks} books · {emptySlotsCount} empty
                </p>
              </div>

              <div className="rounded-lg border border-black/5 bg-neutral-50/80 p-2">
                <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  Row Range
                </p>
                <p className="font-semibold text-neutral-800">
                  Rows A – {endRowLetter}
                </p>
                <p className="font-mono text-[10px] text-neutral-500">
                  {rows} rows total
                </p>
              </div>

              <div className="rounded-lg border border-black/5 bg-neutral-50/80 p-2">
                <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  Cell Sizing
                </p>
                <p className="font-mono font-semibold text-neutral-800">
                  {blockSize} × {blockSize} cells
                </p>
                <p className="font-mono text-[10px] text-neutral-500">
                  Gap X:{gapX} · Y:{gapY}
                </p>
              </div>
            </div>

            {/* Placement Breakdown */}
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-1.5 font-mono text-[11px] text-neutral-600">
              <span>Explicit: {explicitBooksCount}</span>
              <span className="text-neutral-300">•</span>
              <span>Autoflow: {unpositionedBooksCount}</span>
              <span className="text-neutral-300">•</span>
              <span>Empty: {emptySlotsCount}</span>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex flex-col gap-1.5 pt-1">
              {onToggleCoordinates && (
                <button
                  type="button"
                  onClick={onToggleCoordinates}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium transition-colors",
                    isCoordinatesVisible
                      ? "bg-neutral-900 text-white"
                      : "border border-black/10 bg-white text-neutral-800 hover:bg-neutral-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isCoordinatesVisible
                          ? "bg-emerald-400"
                          : "bg-neutral-400"
                      )}
                    />
                    <span>Coordinate Badges</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">[G]</span>
                </button>
              )}

              {onToggleGridBounds && (
                <button
                  type="button"
                  onClick={onToggleGridBounds}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium transition-colors",
                    showGridBounds
                      ? "bg-neutral-900 text-white"
                      : "border border-black/10 bg-white text-neutral-800 hover:bg-neutral-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        showGridBounds ? "bg-indigo-400" : "bg-neutral-400"
                      )}
                    />
                    <span>Highlight Grid Rows</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">
                    {showGridBounds ? "ON" : "OFF"}
                  </span>
                </button>
              )}
            </div>

            {/* Footer keyboard hints */}
            <div className="border-t border-black/5 pt-2 text-center font-mono text-[10px] text-neutral-400">
              Press <kbd className="font-semibold text-neutral-600">S</kbd> to
              toggle · <kbd className="font-semibold text-neutral-600">G</kbd>{" "}
              for coordinates ·{" "}
              <kbd className="font-semibold text-neutral-600">Esc</kbd> to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Grid Size Pill (Bottom-Left Corner) */}
      <button
        type="button"
        onClick={() => setIsInspectorOpen((prev) => !prev)}
        title={`Grid size: ${cols} cols × ${rows} rows (Shortcut: S)`}
        className={cn(
          "fixed bottom-4 left-4 z-50 flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200 select-none sm:bottom-6 sm:left-6",
          isInspectorOpen
            ? "bg-black text-white hover:bg-neutral-800"
            : "border border-black/10 bg-white/90 text-neutral-800 hover:bg-white"
        )}
      >
        <svg
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            isInspectorOpen ? "rotate-90 text-white" : "text-neutral-700"
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>

        <span>Grid: {primaryLabel}</span>
        <span
          className={cn(
            "hidden font-mono text-[10px] opacity-60 transition-opacity sm:inline",
            isInspectorOpen ? "text-neutral-300" : "text-neutral-500"
          )}
        >
          ({subLabel})
        </span>

        <span
          className={cn(
            "ml-0.5 h-1.5 w-1.5 rounded-full transition-colors",
            isInspectorOpen ? "bg-indigo-400" : "bg-neutral-400"
          )}
        />
      </button>
    </div>
  );
};

export default GridSizeIndicator;
