"use client";

import { useEffect, useRef, useState } from "react";

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
 * React hook that attaches a ref to any ticket element, dynamically measures its dimensions
 * via ResizeObserver, and computes the exact perforation hole count for each edge.
 */
export const useTicketPerforations = (
  options: TicketPerforationOptions = {},
  fallbackWidth = 176,
  fallbackHeight = 90
) => {
  const { holeRadius, standardPitch, cornerMargin } = options;
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>(() =>
    generatePerforatedMask(fallbackWidth, fallbackHeight, options)
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
        setMaskStyle(
          generatePerforatedMask(roundedW, roundedH, {
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

  return { ticketRef, maskStyle };
};

export default useTicketPerforations;
