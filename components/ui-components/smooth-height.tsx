"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { CANVAS_PHYSICS } from "@/components/infinite-canvas";
import { cn } from "@/lib/utils";

interface SmoothHeightProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export function SmoothHeight({
  children,
  className,
  duration = 0.85,
}: SmoothHeightProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const ease = gsap.parseEase(CANVAS_PHYSICS.bezierCurve);
    let prevHeight: number | null = null;
    let prevViewportWidth = window.innerWidth;
    let tween: gsap.core.Tween | null = null;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const nextHeight =
        entry.borderBoxSize?.[0]?.blockSize ?? inner.offsetHeight;

      // Initial mount: lock pixel height immediately without animating
      if (prevHeight === null) {
        prevHeight = nextHeight;
        outer.style.height = `${nextHeight}px`;
        return;
      }

      // If viewport width changed (e.g. mobile <-> desktop --cell-size), snap immediately
      const currentViewportWidth = window.innerWidth;
      if (currentViewportWidth !== prevViewportWidth) {
        prevViewportWidth = currentViewportWidth;
        prevHeight = nextHeight;
        tween?.kill();
        tween = null;
        outer.style.height = `${nextHeight}px`;
        return;
      }

      if (Math.abs(nextHeight - prevHeight) < 1) return;

      // Read current visual height so mid-flight filter toggles interrupt seamlessly
      const currentVisualHeight =
        outer.getBoundingClientRect().height || prevHeight;
      prevHeight = nextHeight;

      tween?.kill();
      tween = gsap.fromTo(
        outer,
        { height: currentVisualHeight },
        {
          height: nextHeight,
          duration,
          ease,
          overwrite: true,
          onComplete: () => {
            // Keep explicit pixel height so future React unmounts never collapse in layout
            outer.style.height = `${nextHeight}px`;
            tween = null;
          },
        }
      );
    });

    observer.observe(inner);

    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [duration]);

  return (
    <div ref={outerRef} className={cn("w-full", className)}>
      <div ref={innerRef} className="flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
