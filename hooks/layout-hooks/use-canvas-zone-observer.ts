"use client";

import { useEffect, type RefObject } from "react";
import { useCanvasNavigation } from "./usecanvasnavigation";

/**
 * Robust, high-performance canvas zone detection.
 * Tracks the boundary positions of the canvas sections relative to the viewport focus line
 * to determine whether the user is in 'books-read' (Bookshelf), 'current-reads', or 'wishlist'.
 *
 * Section layout in DOM:
 * 1. 'introduction' + 'books-read' -> 'books-read' zone (the Bookshelf)
 * 2. 'current-reads'              -> 'current-reads' zone
 * 3. 'wishlist'                   -> 'wishlist' zone
 *
 * Boundary rules with hysteresis:
 * - Above 'current-reads'                 -> 'books-read'
 * - Between 'current-reads' and 'wishlist' -> 'current-reads'
 * - At or below 'wishlist'                -> 'wishlist'
 *
 * This geometry-based detection is completely immune to dynamic section resizing and filtering
 * (e.g. when books are filtered in shelf-grid and its height shrinks from ~4000px to ~400px).
 */
export function useCanvasZoneObserver(
  wrapperRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let rafId: number | null = null;

    const checkActiveZone = () => {
      const crEl = document.getElementById("current-reads");
      const wlEl = document.getElementById("wishlist");

      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportHeight = wrapper.clientHeight || window.innerHeight;

      const currentActive = useCanvasNavigation.getState().activeZoneId;

      let crTop = Infinity;
      let wlTop = Infinity;

      if (crEl) {
        crTop = crEl.getBoundingClientRect().top - wrapperRect.top;
      }
      if (wlEl) {
        wlTop = wlEl.getBoundingClientRect().top - wrapperRect.top;
      }

      // Hysteresis thresholds to avoid jitter at boundary lines:
      // When moving forward (downward): enter section when its top passes 45% of viewport
      // When moving backward (upward): leave section when its top drops below 55% of viewport
      let targetZone = currentActive;

      if (currentActive === "books-read") {
        if (wlTop <= viewportHeight * 0.45) {
          targetZone = "wishlist";
        } else if (crTop <= viewportHeight * 0.45) {
          targetZone = "current-reads";
        }
      } else if (currentActive === "current-reads") {
        if (wlTop <= viewportHeight * 0.45) {
          targetZone = "wishlist";
        } else if (crTop >= viewportHeight * 0.55) {
          targetZone = "books-read";
        }
      } else if (currentActive === "wishlist") {
        if (wlTop >= viewportHeight * 0.55) {
          if (crTop >= viewportHeight * 0.55) {
            targetZone = "books-read";
          } else {
            targetZone = "current-reads";
          }
        }
      } else {
        // Fallback for initial state
        if (wlTop <= viewportHeight * 0.5) {
          targetZone = "wishlist";
        } else if (crTop <= viewportHeight * 0.5) {
          targetZone = "current-reads";
        } else {
          targetZone = "books-read";
        }
      }

      if (targetZone && targetZone !== currentActive) {
        useCanvasNavigation.getState().setActiveZoneId(targetZone);
      }
    };

    const scheduleCheck = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        checkActiveZone();
      });
    };

    // 1. Initial check immediately, plus a brief timeout in case elements mount asynchronously
    scheduleCheck();
    const retryTimer = setTimeout(checkActiveZone, 150);

    // 2. Listen to scroll events on wrapper (dispatched continuously as Lenis scrolls)
    wrapper.addEventListener("scroll", scheduleCheck, { passive: true });

    // 3. Listen to window resize
    window.addEventListener("resize", scheduleCheck, { passive: true });

    // 4. ResizeObserver on content container to immediately re-check when filtering changes section sizes
    let resizeObserver: ResizeObserver | null = null;
    const content = wrapper.firstElementChild;
    if (content && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleCheck();
      });
      resizeObserver.observe(content);
    }

    return () => {
      clearTimeout(retryTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      wrapper.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      resizeObserver?.disconnect();
    };
  }, [wrapperRef]);
}
