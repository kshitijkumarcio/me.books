"use client";

import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

/**
 * Attaches a scoped Lenis smooth-scroll instance to an intercepted route drawer
 * container without affecting window/document or the underlying main canvas.
 */
export function useDrawerLenis(
  wrapperRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const content = wrapper.firstElementChild as HTMLElement | null;

    const lenis = new Lenis({
      wrapper,
      content: content ?? wrapper,
      eventsTarget: wrapper,
      autoRaf: true,
      overscroll: false,
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [wrapperRef, enabled]);
}
