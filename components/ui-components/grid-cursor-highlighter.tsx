"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface GridCursorHighlighterProps {
  /** Maximum number of simultaneous trailing cells in trail mode */
  trailCount?: number;
  /** Duration of the phosphor trail decay in milliseconds */
  fadeDurationMs?: number;
  className?: string;
  /**
   * When true, dynamically calculates cell width and height using the same
   * rounding algorithm as CSS `background-repeat: round` so that tiles and trail
   * match perfectly on dynamic-grid surfaces like `.bg-grid-dashed-accurate`.
   */
  dynamicGrid?: boolean;
}

export const GridCursorHighlighter = ({
  trailCount = 24,
  fadeDurationMs = 600,
  className,
  dynamicGrid = false,
}: GridCursorHighlighterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pool of cell elements for the phosphor trail
  const trailPoolRef = useRef<HTMLDivElement[]>([]);
  const poolIndexRef = useRef(0);
  const lastCellRef = useRef<{ col: number; row: number } | null>(null);
  const cellSizeRef = useRef<number>(60);
  const dynamicCellSizeRef = useRef<{ cellWidth: number; cellHeight: number }>({
    cellWidth: 60,
    cellHeight: 60,
  });
  const rafIdRef = useRef<number | null>(null);
  const latestEventRef = useRef<PointerEvent | null>(null);

  // Cache current --cell-size in pixels on mount and window resize
  const updateBaseCellSize = useCallback(() => {
    if (typeof window === "undefined") return;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      "--cell-size"
    );
    const parsed = parseFloat(raw);
    cellSizeRef.current =
      !isNaN(parsed) && parsed > 0
        ? parsed
        : window.innerWidth < 768
          ? 40
          : 60;
  }, []);

  useEffect(() => {
    updateBaseCellSize();
    window.addEventListener("resize", updateBaseCellSize, { passive: true });
    return () => window.removeEventListener("resize", updateBaseCellSize);
  }, [updateBaseCellSize]);

  // If dynamicGrid is enabled, track container dimensions to match `background-repeat: round`
  useEffect(() => {
    if (!dynamicGrid) return;
    const container = containerRef.current;
    if (!container) return;

    const updateDynamicSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const base = cellSizeRef.current;
      const cols = Math.max(1, Math.round(rect.width / base));
      const rows = Math.max(1, Math.round(rect.height / base));
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;

      dynamicCellSizeRef.current = { cellWidth: cellW, cellHeight: cellH };

      // Pre-apply dimensions to pool elements
      trailPoolRef.current.forEach((el) => {
        if (el) {
          el.style.width = `${cellW}px`;
          el.style.height = `${cellH}px`;
        }
      });
    };

    updateDynamicSize();

    const ro = new ResizeObserver(updateDynamicSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [dynamicGrid]);

  // Pointer movement listener with RAF throttling to prevent layout thrashing
  useEffect(() => {
    const processPointerMove = () => {
      rafIdRef.current = null;
      const e = latestEventRef.current;
      const container = containerRef.current;
      if (!e || !container) return;

      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Check if pointer is inside container bounds
      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height) {
        return;
      }

      let cellW: number;
      let cellH: number;

      if (dynamicGrid) {
        const base = cellSizeRef.current;
        const cols = Math.max(1, Math.round(rect.width / base));
        const rows = Math.max(1, Math.round(rect.height / base));
        cellW = rect.width / cols;
        cellH = rect.height / rows;
        dynamicCellSizeRef.current = { cellWidth: cellW, cellHeight: cellH };
      } else {
        cellW = cellSizeRef.current;
        cellH = cellSizeRef.current;
      }

      const col = Math.floor(rawX / cellW);
      const row = Math.floor(rawY / cellH);
      const snappedX = col * cellW;
      const snappedY = row * cellH;

      // Avoid re-triggering for the same grid cell
      if (
        lastCellRef.current &&
        lastCellRef.current.col === col &&
        lastCellRef.current.row === row
      ) {
        return;
      }

      lastCellRef.current = { col, row };

      const pool = trailPoolRef.current;
      if (pool.length === 0) return;

      const cellEl = pool[poolIndexRef.current % pool.length];
      poolIndexRef.current++;

      if (cellEl) {
        if (dynamicGrid) {
          cellEl.style.width = `${cellW}px`;
          cellEl.style.height = `${cellH}px`;
        }
        cellEl.style.transform = `translate3d(${snappedX}px, ${snappedY}px, 0)`;
        cellEl.animate([{ opacity: 0.95 }, { opacity: 0 }], {
          duration: fadeDurationMs,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      latestEventRef.current = e;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(processPointerMove);
      }
    };

    const handlePointerLeave = () => {
      lastCellRef.current = null;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [dynamicGrid, fadeDurationMs]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-visible",
        className
      )}
    >
      {Array.from({ length: trailCount }).map((_, idx) => (
        <div
          key={`trail-${idx}`}
          ref={(el) => {
            if (el) trailPoolRef.current[idx] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 rounded-xs border border-black/15"
          style={{
            width: "var(--cell-size)",
            height: "var(--cell-size)",
            backgroundColor: "var(--color-neon)",
            transform: "translate3d(-9999px, -9999px, 0)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};

export default GridCursorHighlighter;
