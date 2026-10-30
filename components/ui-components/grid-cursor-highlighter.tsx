"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface GridCursorHighlighterProps {
  /** Maximum number of simultaneous trailing cells in trail mode */
  trailCount?: number;
  /** Duration of the phosphor trail decay in milliseconds */
  fadeDurationMs?: number;
  className?: string;
}

export const GridCursorHighlighter = ({
  trailCount = 24,
  fadeDurationMs = 600,
  className,
}: GridCursorHighlighterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pool of cell elements for the phosphor trail
  const trailPoolRef = useRef<HTMLDivElement[]>([]);
  const poolIndexRef = useRef(0);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  // Read current --cell-size in pixels
  const getCellSize = useCallback(() => {
    if (typeof window === "undefined") return 72;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      "--cell-size"
    );
    const parsed = parseFloat(raw);
    return !isNaN(parsed) && parsed > 0
      ? parsed
      : window.innerWidth < 768
      ? 40
      : 72;
  }, []);

  // Pointer movement listener
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Check if pointer is inside container bounds
      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height) {
        return;
      }

      const cellSize = getCellSize();
      const snappedX = Math.floor(rawX / cellSize) * cellSize;
      const snappedY = Math.floor(rawY / cellSize) * cellSize;

      // Avoid re-triggering for the same grid cell
      if (
        lastCellRef.current &&
        lastCellRef.current.x === snappedX &&
        lastCellRef.current.y === snappedY
      ) {
        return;
      }

      lastCellRef.current = { x: snappedX, y: snappedY };

      const pool = trailPoolRef.current;
      if (pool.length === 0) return;

      const cellEl = pool[poolIndexRef.current % pool.length];
      poolIndexRef.current++;

      if (cellEl) {
        cellEl.style.transform = `translate3d(${snappedX}px, ${snappedY}px, 0)`;
        // Web Animations API: reliable keyframe fade on compositor thread
        cellEl.animate(
          [{ opacity: 0.95 }, { opacity: 0 }],
          {
            duration: fadeDurationMs,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          }
        );
      }
    };

    const handlePointerLeave = () => {
      lastCellRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [getCellSize, fadeDurationMs]);

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
          className="absolute top-0 left-0 pointer-events-none rounded-xs border border-black/15"
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
