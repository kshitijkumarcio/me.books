"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  useReadBookModal,
  READ_BOOK_TRANSITION_DURATION,
  READ_BOOK_TRANSITION_EASE,
  type CoverRect,
} from "@/hooks/layout-hooks/use-read-book-modal";

const HOVER_SCALE = 1.1;

function parseRotationDegrees(rotation?: string): number {
  if (!rotation) return 0;
  if (rotation.includes("-rotate-3")) return -3;
  if (rotation.includes("rotate-3")) return 3;
  if (rotation.includes("-rotate-2")) return -2;
  if (rotation.includes("rotate-2")) return 2;
  if (rotation.includes("-rotate-1")) return -1;
  if (rotation.includes("rotate-1")) return 1;
  return 0;
}

function getFallbackHeroRect(initialRect: CoverRect): CoverRect {
  if (typeof window === "undefined") {
    return { top: 200, left: 200, width: 208, height: 308 };
  }
  const isLg = window.innerWidth >= 1024;
  const isSm = window.innerWidth >= 640;
  const targetWidth = isLg ? 224 : isSm ? 208 : 176;
  const aspectRatio =
    initialRect.width > 0 ? initialRect.height / initialRect.width : 1.48;
  const targetHeight = Math.round(targetWidth * aspectRatio);
  const targetLeft = Math.round((window.innerWidth - targetWidth) / 2);
  const targetTop = Math.max(80, Math.round(window.innerHeight * 0.28));

  return {
    top: targetTop,
    left: targetLeft,
    width: targetWidth,
    height: targetHeight,
  };
}

export const SharedBookCoverTransitionLayer = () => {
  const {
    activeBookId,
    initialCoverRect,
    restingCoverRect,
    heroCoverRect,
    coverImage,
    coverResolvedSrc,
    coverAlt,
    coverRotation,
    transitionPhase,
    markCoverLayerPainted,
    completeEnterTransition,
    completeExitTransition,
  } = useReadBookModal();

  const imgRef = useRef<HTMLImageElement>(null);

  const targetRect = useMemo(() => {
    if (!initialCoverRect) return null;
    return heroCoverRect || getFallbackHeroRect(initialCoverRect);
  }, [heroCoverRect, initialCoverRect]);

  const initialRotationDeg = useMemo(
    () => parseRotationDegrees(coverRotation),
    [coverRotation]
  );

  // Only mount while actively flying ("entering" or "exiting")—never sit idle as invisible opacity-0
  const isActiveFlight =
    activeBookId !== null &&
    initialCoverRect !== null &&
    coverImage !== null &&
    (transitionPhase === "entering" || transitionPhase === "exiting");

  const returnRect = useMemo<CoverRect | null>(() => {
    if (!initialCoverRect) return null;
    if (restingCoverRect) return restingCoverRect;
    const w = initialCoverRect.width / HOVER_SCALE;
    const h = initialCoverRect.height / HOVER_SCALE;
    return {
      width: w,
      height: h,
      left: initialCoverRect.left + initialCoverRect.width / 2 - w / 2,
      top: initialCoverRect.top + initialCoverRect.height / 2 - h / 2,
    };
  }, [initialCoverRect, restingCoverRect]);

  // Signal the underlying cover to hide only after this layer has a frame to paint
  useLayoutEffect(() => {
    if (!isActiveFlight) return;
    let rafId = 0;
    const markWhenReady = () => {
      rafId = requestAnimationFrame(() => {
        markCoverLayerPainted();
      });
    };

    if (!imgRef.current || imgRef.current.complete) {
      markWhenReady();
    }
    return () => cancelAnimationFrame(rafId);
  }, [isActiveFlight, transitionPhase, activeBookId, markCoverLayerPainted]);

  if (
    !isActiveFlight ||
    !initialCoverRect ||
    !targetRect ||
    !returnRect ||
    !coverImage
  ) {
    return null;
  }

  const gridCenterX = returnRect.left + returnRect.width / 2;
  const gridCenterY = returnRect.top + returnRect.height / 2;
  const heroCenterX = targetRect.left + targetRect.width / 2;
  const heroCenterY = targetRect.top + targetRect.height / 2;

  const heroDeltaX = heroCenterX - gridCenterX;
  const heroDeltaY = heroCenterY - gridCenterY;
  const heroScaleX =
    returnRect.width > 0 ? targetRect.width / returnRect.width : 1;
  const heroScaleY =
    returnRect.height > 0 ? targetRect.height / returnRect.height : 1;

  const isEntering = transitionPhase === "entering";

  const initialTransform = isEntering
    ? {
        x: 0,
        y: 0,
        scaleX: HOVER_SCALE,
        scaleY: HOVER_SCALE,
        rotate: initialRotationDeg,
      }
    : {
        x: heroDeltaX,
        y: heroDeltaY,
        scaleX: heroScaleX,
        scaleY: heroScaleY,
        rotate: 0,
      };

  const animateTransform = isEntering
    ? {
        x: heroDeltaX,
        y: heroDeltaY,
        scaleX: heroScaleX,
        scaleY: heroScaleY,
        rotate: 0,
        transition: {
          duration: READ_BOOK_TRANSITION_DURATION,
          ease: READ_BOOK_TRANSITION_EASE,
        },
      }
    : {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: initialRotationDeg,
        transition: {
          duration: READ_BOOK_TRANSITION_DURATION,
          ease: READ_BOOK_TRANSITION_EASE,
        },
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-70 overflow-hidden"
    >
      <motion.div
        key={`shared-cover-${activeBookId}-${transitionPhase}`}
        style={{
          position: "fixed",
          top: returnRect.top,
          left: returnRect.left,
          width: returnRect.width,
          height: returnRect.height,
          transformOrigin: "center center",
          willChange: "transform",
        }}
        initial={initialTransform}
        animate={animateTransform}
        onAnimationComplete={() => {
          if (isEntering) {
            completeEnterTransition();
          } else {
            completeExitTransition();
          }
        }}
        className="pointer-events-none z-70 select-none"
      >
        <div className="shadow-book relative h-full w-full overflow-hidden">
          {coverResolvedSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={coverResolvedSrc}
              alt={coverAlt || "Book Cover"}
              draggable={false}
              decoding="sync"
              onLoad={markCoverLayerPainted}
              className="h-full w-full object-cover select-none"
            />
          ) : (
            <Image
              src={coverImage}
              alt={coverAlt || "Book Cover"}
              draggable={false}
              priority
              decoding="sync"
              fill
              sizes="(min-width: 1024px) 240px, 200px"
              onLoad={markCoverLayerPainted}
              className="h-full w-full object-cover select-none"
            />
          )}
          <div className="pointer-events-none absolute inset-y-0 -left-0.5 w-[calc(8px*var(--book-scale))] bg-linear-to-r from-black/25 via-white/20 to-transparent" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset" />
        </div>
      </motion.div>
    </div>
  );
};

export default SharedBookCoverTransitionLayer;
