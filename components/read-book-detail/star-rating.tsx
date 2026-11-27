"use client";

import React, { useId, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { easing065 } from "@/constants";
import {
  STAR_POINTS,
  formatRating,
  getStarFillFraction,
} from "@/lib/read-book-detail-utils";

interface StarRatingProps {
  rating: number;
  isIntercepted: boolean;
  isClosing: boolean;
}

const STARS = [1, 2, 3, 4, 5];
const OFFSET_X = 20;
const OFFSET_Y = 20;
const SPRING_CONFIG = { damping: 60, stiffness: 300, mass: 0.5 };

export const StarRating = ({
  rating = 4.5,
  isIntercepted,
  isClosing,
}: StarRatingProps) => {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);

  const updateCursorPosition = (
    e: React.MouseEvent<HTMLDivElement>,
    jump = false
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + OFFSET_X;
    const y = e.clientY - rect.top + OFFSET_Y;
    mouseX.set(x);
    mouseY.set(y);
    if (jump) {
      springX.jump(x);
      springY.jump(y);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCursorPosition(e, true);
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) {
      updateCursorPosition(e, true);
      setIsHovered(true);
    } else {
      updateCursorPosition(e, false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const formattedRating = formatRating(rating);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex cursor-default flex-col items-center justify-center select-none"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {/* Stars row with masked reveal */}
      <div className="overflow-hidden">
        <motion.div
          initial={isIntercepted ? { y: "105%" } : { y: "0%" }}
          animate={{
            y: isClosing ? "105%" : "0%",
            transition: {
              duration: isClosing ? 0.6 : 1,
              delay: isClosing ? 0 : 0.2,
              ease: easing065,
            },
          }}
          className="flex items-center justify-center gap-1.5"
        >
          {STARS.map((star) => {
            const roundedFraction = getStarFillFraction(rating, star);
            const starStyle: React.CSSProperties = {
              width: "calc((var(--cover-width, 224px) - 24px) / 5)",
              height: "calc((var(--cover-width, 224px) - 24px) / 5)",
            };

            if (roundedFraction >= 1) {
              return (
                <svg
                  key={star}
                  style={starStyle}
                  className="transition-transform hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points={STAR_POINTS} />
                </svg>
              );
            }

            if (roundedFraction <= 0) {
              return (
                <svg
                  key={star}
                  style={starStyle}
                  className="transition-transform hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points={STAR_POINTS} />
                </svg>
              );
            }

            const clipId = `star-clip-${baseId}-${star}`;
            return (
              <svg
                key={star}
                style={starStyle}
                className="transition-transform hover:scale-110"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                    <rect x="0" y="0" width={roundedFraction} height="1" />
                  </clipPath>
                </defs>
                <polygon
                  points={STAR_POINTS}
                  fill="currentColor"
                  stroke="none"
                  clipPath={`url(#${clipId})`}
                />
                <polygon points={STAR_POINTS} fill="none" />
              </svg>
            );
          })}
        </motion.div>
      </div>

      {/* Floating cursor-following rating label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-none absolute top-0 left-0 z-50 select-none"
          >
            <div className="bg-neon flex items-center gap-2 rounded-lg border border-black px-2 py-1.5 whitespace-nowrap">
              <div className="flex items-center gap-1.5 leading-none">
                <div className="font-mona-sans flex items-center gap-1.5 text-[14px] leading-none font-semibold text-black">
                  <p className="text-[16px] leading-none font-medium">+</p>
                  <p>{formattedRating}</p>
                  <p className="text-[16px] leading-none font-medium">+</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarRating;
