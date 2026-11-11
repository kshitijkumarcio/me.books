"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GridCursorHighlighterProps {
  trailCount?: number;
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
  const cellSizeRef = useRef<number>(60);
  const rafIdRef = useRef<number | null>(null);
  const latestEventRef = useRef<PointerEvent | null>(null);

  // Cache current --cell-size in pixels on mount and window resize
  useEffect(() => {
    const updateCellSize = () => {
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
    };

    updateCellSize();
    window.addEventListener("resize", updateCellSize, { passive: true });
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

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

      const cellSize = cellSizeRef.current;
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
  }, [fadeDurationMs]);

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
