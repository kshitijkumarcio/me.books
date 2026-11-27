"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type Transition,
} from "motion/react";
import { easing065 } from "@/constants";
import {
  observeTitleMarqueeMetrics,
  type TitleMarqueeMetrics,
} from "@/lib/book-title-utils";

const MARQUEE_SPEED_PX_PER_SEC = 135;

interface FullWidthPageTitleProps {
  title: string | string[];
  isIntercepted: boolean;
  isClosing: boolean;
  speed?: number;
  enterDelay?: number;
  enterDuration?: number;
  exitDuration?: number;
  heightInCells?: number;
}

export const FullWidthPageTitle = ({
  title,
  isIntercepted,
  isClosing,
  speed = MARQUEE_SPEED_PX_PER_SEC,
  enterDelay = 0.4,
  enterDuration = 0.6,
  exitDuration = 0.6,
  heightInCells = 3,
}: FullWidthPageTitleProps) => {
  const titles = Array.isArray(title) ? title : [title];
  const measureText = titles.join(" ");

  const containerRef = useRef<HTMLDivElement>(null);
  const measureItemRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const [metrics, setMetrics] = useState<TitleMarqueeMetrics>({
    fontSize: 0,
    topTrim: 0,
    bottomPad: 0,
    copiesPerSet: 2,
    setWidth: 0,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureItem = measureItemRef.current;
    if (!container || !measureItem || !measureText) return;

    return observeTitleMarqueeMetrics(
      container,
      measureItem,
      measureText,
      setMetrics,
      heightInCells
    );
  }, [measureText, heightInCells]);

  useAnimationFrame((_, delta) => {
    const track = trackRef.current;
    if (!track) return;

    const halfWidth = track.scrollWidth / 2;
    if (halfWidth <= 0) return;

    let next = x.get() - (speed * delta) / 1000;
    if (next <= -halfWidth) {
      next = next % halfWidth;
    }
    x.set(next);
  });

  const revealTransition: Transition = {
    duration: isClosing ? exitDuration : enterDuration,
    delay: isClosing ? 0 : enterDelay,
    ease: easing065,
  };

  const fontStyle =
    metrics.fontSize > 0
      ? {
          fontSize: `${metrics.fontSize}px`,
          lineHeight: `${metrics.fontSize}px`,
        }
      : undefined;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {/* Hidden single-set probe to measure exact rendered width */}
      <span
        ref={measureItemRef}
        aria-hidden="true"
        style={fontStyle}
        className="font-mona-sans pointer-events-none invisible absolute top-0 left-0 flex items-center leading-none font-bold tracking-tight whitespace-nowrap select-none"
      >
        {titles.map((item, itemIdx) => (
          <span key={itemIdx} className="flex items-center">
            <span className="px-[0.3em]">{item}</span>
            <span className="w-cell-2.5 inline-block h-2" />
          </span>
        ))}
      </span>

      <motion.div
        initial={isIntercepted ? { y: "100%" } : { y: "0%" }}
        animate={{
          y: isClosing ? "100%" : "0%",
          transition: revealTransition,
        }}
        style={{
          marginTop: metrics.topTrim > 0 ? `-${metrics.topTrim}px` : undefined,
          paddingBottom:
            metrics.bottomPad > 0 ? `${metrics.bottomPad}px` : undefined,
        }}
        className="translate-y-0.5"
      >
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max will-change-transform"
        >
          {Array.from({ length: metrics.copiesPerSet * 2 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {titles.map((item, itemIdx) =>
                idx === 0 && itemIdx === 0 ? (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-center"
                  >
                    <h1
                      style={fontStyle}
                      className="font-mona-sans shrink-0 px-[0.25em] leading-none font-semibold tracking-tight whitespace-nowrap text-black select-none"
                    >
                      {item}
                    </h1>
                    <div className="w-cell-2 h-2 bg-black" />
                  </div>
                ) : (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-center"
                  >
                    <span
                      aria-hidden="true"
                      style={fontStyle}
                      className="font-mona-sans shrink-0 px-[0.25em] leading-none font-semibold tracking-tight whitespace-nowrap text-black select-none"
                    >
                      {item}
                    </span>
                    <div className="w-cell-2 h-2 bg-black" />
                  </div>
                )
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FullWidthPageTitle;
