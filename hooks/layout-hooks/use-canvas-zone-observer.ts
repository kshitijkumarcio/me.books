"use client";

import { useEffect, type RefObject } from "react";
import { useCanvasNavigation } from "./usecanvasnavigation";

/**
 * Maps DOM section IDs to their corresponding canvas zone IDs.
 * Both 'introduction' and 'books-read' correspond to the shelf grid zone.
 */
const SECTION_TO_ZONE: Record<string, string> = {
  introduction: "books-read",
  "books-read": "books-read",
  "current-reads": "current-reads",
  wishlist: "wishlist",
};

/**
 * High-performance, off-thread section detection using IntersectionObserver.
 * Tracks which section is currently dominant in the viewport's vertical focus band
 * (middle 50% of the screen) and keeps `useCanvasNavigation.activeZoneId` in sync.
 */
export function useCanvasZoneObserver(
  wrapperRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observedIds = Object.keys(SECTION_TO_ZONE);
    const visibleHeights = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeights.set(entry.target.id, entry.intersectionRect.height);
          } else {
            visibleHeights.delete(entry.target.id);
          }
        });

        // Tally visible height by canvas zone
        const zoneScores: Record<string, number> = {
          "books-read": 0,
          "current-reads": 0,
          wishlist: 0,
        };

        visibleHeights.forEach((height, elId) => {
          const zone = SECTION_TO_ZONE[elId];
          if (zone) {
            zoneScores[zone] = (zoneScores[zone] || 0) + height;
          }
        });

        let highestZone = "books-read";
        let maxScore = 0;

        for (const [zone, score] of Object.entries(zoneScores)) {
          if (score > maxScore) {
            maxScore = score;
            highestZone = zone;
          }
        }

        if (maxScore > 0) {
          const currentActive = useCanvasNavigation.getState().activeZoneId;
          if (highestZone !== currentActive) {
            useCanvasNavigation.getState().setActiveZoneId(highestZone);
          }
        }
      },
      {
        root: wrapper,
        rootMargin: "-25% 0px -25% 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    const observeElements = () => {
      let count = 0;
      observedIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          observer.observe(el);
          count++;
        }
      });
      return count;
    };

    const initialCount = observeElements();
    let retryTimer: NodeJS.Timeout | null = null;

    if (initialCount < observedIds.length) {
      retryTimer = setTimeout(() => {
        observeElements();
      }, 200);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      observer.disconnect();
    };
  }, [wrapperRef]);
}
