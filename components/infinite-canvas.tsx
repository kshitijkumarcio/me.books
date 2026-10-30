"use client";

import React, {
  useRef,
  useCallback,
  useMemo,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

// ============================================================================
// SINGLE SOURCE OF TRUTH: CANVAS PHYSICS & EASING CONFIGURATION
// ============================================================================
export const CANVAS_PHYSICS = {
  /**
   * Choose "lerp" for continuous exponential damping,
   * or "bezier" to use `duration` + `bezierCurve` below.
   */
  mode: "bezier" as "lerp" | "bezier",

  /** Used when mode === "lerp" (and for elastic edge bounce snapback) */
  lerp: 0.08,

  /** Used when mode === "bezier": glide duration in seconds */
  duration: 1.1,

  /** Used when mode === "bezier": any CSS cubic-bezier(x1, y1, x2, y2) or GSAP ease */
  bezierCurve: "cubic-bezier(0.16, 1, 0.3, 1)",

  /** Wheel & trackpad scroll speed multiplier */
  wheelMultiplier: 1,

  /** Pointer drag speed multiplier (1 = 1:1 parity with wheelMultiplier: 1) */
  dragSpeed: 1,

  /** Flick projection multiplier on quick pointer release (0 = pure lag, 8 = natural flick) */
  throwMultiplier: 8,

  /** Elastic rubber-band resistance at canvas edges (0 = hard stop, 0.35 = iOS bounce) */
  elasticResistance: 0.05,
  maxElasticPx: 72,
};

export interface InfiniteCanvasProps {
  children?: React.ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
  initialCenter?: boolean | "horizontal" | "vertical" | "both";
  /** Optional overrides if you ever want a specific page to deviate from CANVAS_PHYSICS */
  physicsOverride?: Partial<typeof CANVAS_PHYSICS>;
  onPanToReady?: (panTo: (x: number, y: number) => void) => void;
}

const InfiniteCanvas = ({
  children,
  wrapperClassName,
  contentClassName,
  initialCenter = true,
  physicsOverride,
  onPanToReady,
}: InfiniteCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisXRef = useRef<Lenis | null>(null);
  const lenisYRef = useRef<Lenis | null>(null);

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  // Merge top-level config with any optional prop overrides
  const cfg = useMemo(
    () => ({ ...CANVAS_PHYSICS, ...physicsOverride }),
    [physicsOverride]
  );

  // Parse the Bezier curve once into an easing function (t: number) => number
  const easingFn = useMemo(
    () => gsap.parseEase(cfg.bezierCurve),
    [cfg.bezierCurve]
  );

  // Unified animation options passed to BOTH `new Lenis()` and `lenis.scrollTo()`
  const scrollAnimOptions = useMemo(
    () =>
      cfg.mode === "bezier"
        ? { duration: cfg.duration, easing: easingFn, lerp: undefined }
        : { lerp: cfg.lerp, duration: undefined, easing: undefined },
    [cfg.mode, cfg.duration, cfg.lerp, easingFn]
  );

  /** Single helper to pan both axes using the unified physics config */
  const panTo = useCallback(
    (x: number, y: number) => {
      lenisXRef.current?.scrollTo(x, scrollAnimOptions);
      lenisYRef.current?.scrollTo(y, scrollAnimOptions);
    },
    [scrollAnimOptions]
  );

  /** Standard iOS-style rubber-band resistance for elastic boundary drag */
  const getElastic = useCallback(
    (val: number, max: number) => {
      if (val < 0) {
        return {
          scroll: 0,
          elastic: -Math.min(
            cfg.maxElasticPx,
            Math.abs(val) * cfg.elasticResistance
          ),
        };
      }
      if (val > max) {
        return {
          scroll: max,
          elastic: Math.min(
            cfg.maxElasticPx,
            (val - max) * cfg.elasticResistance
          ),
        };
      }
      return { scroll: val, elastic: 0 };
    },
    [cfg.maxElasticPx, cfg.elasticResistance]
  );

  // Lightweight state for drag tracking & elastic edge bounce
  const p = useRef({
    rawX: 0,
    rawY: 0,
    ex: 0,
    ey: 0,
    tex: 0,
    tey: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    vx: 0,
    vy: 0,
  });

  const getMax = useCallback(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return { x: 0, y: 0 };
    return {
      x: Math.max(0, content.scrollWidth - wrapper.clientWidth),
      y: Math.max(0, content.scrollHeight - wrapper.clientHeight),
    };
  }, []);

  useGSAP(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // 1. Initial Center
    const max = getMax();
    const shouldCenterX =
      initialCenter === true ||
      initialCenter === "both" ||
      initialCenter === "horizontal";
    const shouldCenterY =
      initialCenter === true ||
      initialCenter === "both" ||
      initialCenter === "vertical";

    const startX = shouldCenterX ? Math.round(max.x / 2) : 0;
    const startY = shouldCenterY ? Math.round(max.y / 2) : 0;

    wrapper.scrollLeft = startX;
    wrapper.scrollTop = startY;

    p.current.rawX = startX;
    p.current.rawY = startY;

    // 2. Dual-axis Lenis instances (Automatically inherits scrollAnimOptions)
    const baseLenisOptions = {
      wrapper,
      content,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      wheelMultiplier: cfg.wheelMultiplier,
      virtualScroll: (data: { event: Event }) => {
        // Prevent Lenis's stopPropagation check from swallowing the event for the
        // sibling axis. On non-window wrappers, Lenis sets `event.lenisStopPropagation = true`,
        // which completely blocks the second Lenis instance from processing diagonal trackpad/wheel gestures.
        (data.event as unknown as { lenisStopPropagation?: boolean }).lenisStopPropagation = false;
        return true;
      },
      ...scrollAnimOptions,
    };

    const lenisY = new Lenis({
      ...baseLenisOptions,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });

    const lenisX = new Lenis({
      ...baseLenisOptions,
      orientation: "horizontal",
      gestureOrientation: "horizontal",
    });

    lenisXRef.current = lenisX;
    lenisYRef.current = lenisY;

    // Expose panTo to parent or canvas navigation store
    onPanToReady?.(panTo);

    // 3. Unified Ticker: Lenis ALWAYS runs and interpolates both wheel & drag!
    const update = (time: number, deltaTime: number) => {
      const ms = time * 1000;
      lenisY.raf(ms);
      lenisX.raf(ms);

      // Elastic bounce decay matches Lenis's exact exponential damp formula
      const phys = p.current;
      const dtSec = deltaTime / 1000;
      const lenisFactor = 1 - Math.exp(-60 * cfg.lerp * dtSec);

      phys.ex += (phys.tex - phys.ex) * lenisFactor;
      phys.ey += (phys.tey - phys.ey) * lenisFactor;

      const hasElastic = Math.abs(phys.ex) > 0.05 || Math.abs(phys.ey) > 0.05;
      if (hasElastic) {
        content.style.transform = `translate3d(${-phys.ex}px, ${-phys.ey}px, 0)`;
      } else if (content.style.transform) {
        phys.ex = 0;
        phys.ey = 0;
        content.style.transform = "";
      }
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenisY.destroy();
      lenisX.destroy();
      lenisXRef.current = null;
      lenisYRef.current = null;
    };
  }, [initialCenter, cfg.wheelMultiplier, cfg.lerp, scrollAnimOptions, getMax]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement | null)?.closest(
        'a, button, input, textarea, select, [role="button"], [data-no-drag]'
      )
    ) {
      return;
    }

    const wrapper = wrapperRef.current;
    const lenisX = lenisXRef.current;
    const lenisY = lenisYRef.current;
    if (!wrapper || !lenisX || !lenisY) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const phys = p.current;
    phys.startX = e.clientX;
    phys.startY = e.clientY;
    phys.lastX = e.clientX;
    phys.lastY = e.clientY;
    phys.lastTime = performance.now();
    phys.vx = 0;
    phys.vy = 0;

    // Catch the canvas smoothly at its current animated scroll position
    phys.rawX = lenisX.scroll;
    phys.rawY = lenisY.scroll;
    panTo(phys.rawX, phys.rawY);

    wrapper.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const phys = p.current;
    const now = performance.now();
    const dt = Math.max(1, now - phys.lastTime);
    const stepX = e.clientX - phys.lastX;
    const stepY = e.clientY - phys.lastY;

    if (
      !hasMovedRef.current &&
      (Math.abs(e.clientX - phys.startX) > 3 ||
        Math.abs(e.clientY - phys.startY) > 3)
    ) {
      hasMovedRef.current = true;
    }

    // Track velocity for natural flick release
    phys.vx = phys.vx * 0.6 + (stepX / dt) * 16 * 0.4;
    phys.vy = phys.vy * 0.6 + (stepY / dt) * 16 * 0.4;

    phys.lastX = e.clientX;
    phys.lastY = e.clientY;
    phys.lastTime = now;

    phys.rawX -= stepX * cfg.dragSpeed;
    phys.rawY -= stepY * cfg.dragSpeed;

    const m = getMax();
    const resX = getElastic(phys.rawX, m.x);
    const resY = getElastic(phys.rawY, m.y);

    phys.tex = resX.elastic;
    phys.tey = resY.elastic;

    // Feed target directly into Lenis via the single panTo helper
    panTo(resX.scroll, resY.scroll);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
    document.body.style.userSelect = "";

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Fallback
    }

    const lenisX = lenisXRef.current;
    const lenisY = lenisYRef.current;
    if (!lenisX || !lenisY) return;

    const phys = p.current;
    const m = getMax();

    // Snap elastic rubber-band back to 0
    phys.tex = 0;
    phys.tey = 0;

    // Project target on flick, then let Lenis glide to it via panTo
    if (performance.now() - phys.lastTime < 65 && cfg.throwMultiplier > 0) {
      const targetX = gsap.utils.clamp(
        0,
        m.x,
        lenisX.targetScroll - phys.vx * cfg.throwMultiplier
      );
      const targetY = gsap.utils.clamp(
        0,
        m.y,
        lenisY.targetScroll - phys.vy * cfg.throwMultiplier
      );
      panTo(targetX, targetY);
      phys.rawX = targetX;
      phys.rawY = targetY;
    } else {
      phys.rawX = lenisX.targetScroll;
      phys.rawY = lenisY.targetScroll;
    }
  };

  const handleClickCapture = (e: ReactMouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      className={cn(
        "no-scrollbar fixed inset-0 h-screen w-screen cursor-grab overflow-scroll overscroll-none touch-none",
        wrapperClassName
      )}
    >
      <div
        ref={contentRef}
        className={cn(
          "relative h-max min-h-full w-max min-w-full",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default InfiniteCanvas;
