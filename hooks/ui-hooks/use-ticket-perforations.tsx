"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TicketPerforationOptions {
  /** Radius of each perforation hole in px. Default: 2.8 */
  holeRadius?: number;
  /** Standard pitch (distance between hole centers) in px. Default: 11 */
  standardPitch?: number;
  /** Inset from the corner to the first hole center in px. Default: 7 */
  cornerMargin?: number;
}

/**
 * Dynamically computes perforated ticket mask CSS with a standardized perforation size
 * and spacing, calculating the exact number of holes along each edge dynamically based
 * on the ticket's length.
 */
export const generatePerforatedMask = (
  width: number,
  height: number,
  options: TicketPerforationOptions = {}
): React.CSSProperties => {
  const { holeRadius = 2.8, standardPitch = 11, cornerMargin = 7 } = options;

  const getHoleCount = (len: number) => {
    const available = Math.max(0, len - cornerMargin * 2);
    return Math.max(2, Math.round(available / standardPitch) + 1);
  };

  const hCount = getHoleCount(width);
  const vCount = getHoleCount(height);

  const topGradients = Array.from({ length: hCount }).map((_, i) => {
    const pos =
      width > 0
        ? ((cornerMargin + i * ((width - cornerMargin * 2) / (hCount - 1))) /
            width) *
          100
        : 0;
    return `radial-gradient(circle at ${pos.toFixed(2)}% 0%, transparent 0, transparent ${holeRadius}px, black ${holeRadius + 0.3}px)`;
  });

  const bottomGradients = Array.from({ length: hCount }).map((_, i) => {
    const pos =
      width > 0
        ? ((cornerMargin + i * ((width - cornerMargin * 2) / (hCount - 1))) /
            width) *
          100
        : 0;
    return `radial-gradient(circle at ${pos.toFixed(2)}% 100%, transparent 0, transparent ${holeRadius}px, black ${holeRadius + 0.3}px)`;
  });

  const leftGradients = Array.from({ length: vCount }).map((_, i) => {
    const pos =
      height > 0
        ? ((cornerMargin + i * ((height - cornerMargin * 2) / (vCount - 1))) /
            height) *
          100
        : 0;
    return `radial-gradient(circle at 0% ${pos.toFixed(2)}%, transparent 0, transparent ${holeRadius}px, black ${holeRadius + 0.3}px)`;
  });

  const rightGradients = Array.from({ length: vCount }).map((_, i) => {
    const pos =
      height > 0
        ? ((cornerMargin + i * ((height - cornerMargin * 2) / (vCount - 1))) /
            height) *
          100
        : 0;
    return `radial-gradient(circle at 100% ${pos.toFixed(2)}%, transparent 0, transparent ${holeRadius}px, black ${holeRadius + 0.3}px)`;
  });

  const maskImage = [
    ...topGradients,
    ...bottomGradients,
    ...leftGradients,
    ...rightGradients,
  ].join(",\n  ");

  return {
    maskImage,
    WebkitMaskImage: maskImage,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

/**
 * Generates an SVG path string that traces the outer rectangular perimeter
 * with semicircular inward arcs at each perforation hole, producing a crisp
 * continuous border that follows the perforated edges.
 */
export const generatePerforatedBorderPath = (
  width: number,
  height: number,
  options: TicketPerforationOptions = {}
): string => {
  if (width <= 0 || height <= 0) return "";
  const { holeRadius = 2.8, standardPitch = 11, cornerMargin = 7 } = options;
  const r = holeRadius;

  const getHoleCount = (len: number) => {
    const available = Math.max(0, len - cornerMargin * 2);
    return Math.max(2, Math.round(available / standardPitch) + 1);
  };

  const hCount = getHoleCount(width);
  const vCount = getHoleCount(height);

  let d = "M 0 0";

  // 1. Top Edge: Left to Right (inward arcs into positive Y)
  for (let i = 0; i < hCount; i++) {
    const cx = cornerMargin + i * ((width - cornerMargin * 2) / (hCount - 1));
    d += ` L ${(cx - r).toFixed(2)} 0`;
    d += ` A ${r} ${r} 0 0 0 ${(cx + r).toFixed(2)} 0`;
  }
  d += ` L ${width} 0`;

  // 2. Right Edge: Top to Bottom (inward arcs into X < width)
  for (let i = 0; i < vCount; i++) {
    const cy = cornerMargin + i * ((height - cornerMargin * 2) / (vCount - 1));
    d += ` L ${width} ${(cy - r).toFixed(2)}`;
    d += ` A ${r} ${r} 0 0 0 ${width} ${(cy + r).toFixed(2)}`;
  }
  d += ` L ${width} ${height}`;

  // 3. Bottom Edge: Right to Left (inward arcs into Y < height)
  for (let i = hCount - 1; i >= 0; i--) {
    const cx = cornerMargin + i * ((width - cornerMargin * 2) / (hCount - 1));
    d += ` L ${(cx + r).toFixed(2)} ${height}`;
    d += ` A ${r} ${r} 0 0 0 ${(cx - r).toFixed(2)} ${height}`;
  }
  d += ` L 0 ${height}`;

  // 4. Left Edge: Bottom to Top (inward arcs into positive X)
  for (let i = vCount - 1; i >= 0; i--) {
    const cy = cornerMargin + i * ((height - cornerMargin * 2) / (vCount - 1));
    d += ` L 0 ${(cy + r).toFixed(2)}`;
    d += ` A ${r} ${r} 0 0 0 0 ${(cy - r).toFixed(2)}`;
  }
  d += " Z";

  return d;
};

/**
 * Overlay component that renders the black border following the perforations.
 */
export const TicketPerforatedBorder = ({
  borderPath,
  width,
  height,
  strokeWidth = 1,
  className,
}: {
  borderPath?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}) => {
  if (!borderPath || !width || !height) return null;

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible select-none",
        className
      )}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={borderPath}
        fill="none"
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
      />
    </svg>
  );
};

/**
 * React hook that attaches a ref to any ticket element, dynamically measures its dimensions
 * via ResizeObserver, and computes the exact perforation hole count for each edge and
 * generates both the mask CSS and the SVG border path that follows the perforations.
 */
export const useTicketPerforations = <T extends HTMLElement = HTMLDivElement>(
  options: TicketPerforationOptions = {},
  fallbackWidth = 160,
  fallbackHeight = 240
) => {
  const { holeRadius, standardPitch, cornerMargin } = options;
  const ticketRef = useRef<T | null>(null);

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: fallbackWidth,
    height: fallbackHeight,
  });

  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>(() =>
    generatePerforatedMask(fallbackWidth, fallbackHeight, options)
  );

  const [borderPath, setBorderPath] = useState<string>(() =>
    generatePerforatedBorderPath(fallbackWidth, fallbackHeight, options)
  );

  useEffect(() => {
    const el = ticketRef.current;
    if (!el) return;

    let prevW = 0;
    let prevH = 0;

    const updateMask = (w: number, h: number) => {
      const roundedW = Math.round(w);
      const roundedH = Math.round(h);
      if (
        roundedW > 0 &&
        roundedH > 0 &&
        (roundedW !== prevW || roundedH !== prevH)
      ) {
        prevW = roundedW;
        prevH = roundedH;
        setDimensions({ width: roundedW, height: roundedH });
        setMaskStyle(
          generatePerforatedMask(roundedW, roundedH, {
            holeRadius,
            standardPitch,
            cornerMargin,
          })
        );
        setBorderPath(
          generatePerforatedBorderPath(roundedW, roundedH, {
            holeRadius,
            standardPitch,
            cornerMargin,
          })
        );
      }
    };

    updateMask(el.offsetWidth, el.offsetHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w =
          entry.borderBoxSize?.[0]?.inlineSize ||
          el.offsetWidth ||
          entry.contentRect.width;
        const h =
          entry.borderBoxSize?.[0]?.blockSize ||
          el.offsetHeight ||
          entry.contentRect.height;
        updateMask(w, h);
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [holeRadius, standardPitch, cornerMargin]);

  return {
    ticketRef,
    maskStyle,
    borderPath,
    width: dimensions.width,
    height: dimensions.height,
  };
};

export default useTicketPerforations;
