"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type PanInfo,
} from "motion/react";
import type { ImageLayoutElement, ReadBook } from "@/books/books-index";
import { easing016 } from "@/constants";
import { useReadBookModal } from "@/hooks/layout-hooks/use-read-book-modal";
import { useDrawerLenis } from "@/hooks/layout-hooks/use-drawer-lenis";
import {
  getKeywordRepeatCount,
  getKeywordScrollStep,
  getReadBookRevealVariants,
  wrapKeywordX,
} from "@/lib/read-book-detail-utils";

interface UseReadBookDetailOptions {
  book: ReadBook;
  isIntercepted: boolean;
}

export function useReadBookDetail({
  book,
  isIntercepted,
}: UseReadBookDetailOptions) {
  const router = useRouter();
  const {
    isClosing,
    isDrawerClosing,
    triggerClose,
    setIsInterceptedOpen,
    clearActiveModal,
    setHeroCoverRect,
    transitionPhase,
  } = useReadBookModal();

  const drawerRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const keywordViewportRef = useRef<HTMLDivElement>(null);
  const keywordCycleRef = useRef<HTMLDivElement>(null);
  const genreX = useMotionValue(0);
  const cycleWidthMV = useMotionValue(0);
  const keywordTargetXRef = useRef(0);
  const isKeywordAnimatingRef = useRef(false);
  const keywordAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const [keywordRepeatCount, setKeywordRepeatCount] = useState(3);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);

  const keywordX = useTransform([genreX, cycleWidthMV], ([x, width]) =>
    wrapKeywordX(x as number, width as number)
  );

  useDrawerLenis(drawerRef, isIntercepted);

  const { scrollY } = useScroll({ container: drawerRef });
  useMotionValueEvent(scrollY, "change", (latest) => {
    const past = latest >= 100;
    if (past !== hasScrolledPast) {
      setHasScrolledPast(past);
    }
  });

  useEffect(() => {
    if (isIntercepted) {
      setIsInterceptedOpen(true);
      return () => {
        setIsInterceptedOpen(false);
      };
    } else {
      setIsInterceptedOpen(false);
    }
  }, [isIntercepted, setIsInterceptedOpen]);

  useLayoutEffect(() => {
    if (!isIntercepted || !heroContainerRef.current) return;
    const heroEl = heroContainerRef.current;
    const parentEl = heroEl.parentElement;
    const drawerEl = heroEl.closest('[data-drawer="true"]');

    const measure = () => {
      const rect = heroEl.getBoundingClientRect();
      const drawerRect = drawerEl?.getBoundingClientRect();
      const drawerTop = drawerRect ? drawerRect.top : 0;
      const drawerLeft = drawerRect ? drawerRect.left : 0;

      setHeroCoverRect({
        top: Math.round(rect.top - drawerTop),
        left: Math.round(rect.left - drawerLeft),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(heroEl);
    if (parentEl) {
      resizeObserver.observe(parentEl);
    }

    window.addEventListener("resize", measure);
    drawerEl?.addEventListener("scroll", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      drawerEl?.removeEventListener("scroll", measure);
    };
  }, [isIntercepted, setHeroCoverRect]);

  const handleClose = useCallback(() => {
    triggerClose(() => {
      clearActiveModal();
      if (isIntercepted) {
        router.back();
      } else {
        router.push("/");
      }
    });
  }, [isIntercepted, triggerClose, router, clearActiveModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const tagItems = useMemo(() => book.keywords ?? [], [book.keywords]);

  useLayoutEffect(() => {
    const viewport = keywordViewportRef.current;
    const cycle = keywordCycleRef.current;
    if (!viewport || !cycle || tagItems.length === 0) return;

    const measure = () => {
      const viewportWidth = viewport.clientWidth;
      const cycleWidth = cycle.getBoundingClientRect().width;
      if (cycleWidth <= 0) return;

      cycleWidthMV.set(cycleWidth);
      const nextCount = getKeywordRepeatCount(viewportWidth, cycleWidth);
      setKeywordRepeatCount((prev) => (prev === nextCount ? prev : nextCount));
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    resizeObserver.observe(cycle);
    return () => resizeObserver.disconnect();
  }, [tagItems, cycleWidthMV]);

  useEffect(() => {
    return () => {
      keywordAnimRef.current?.stop();
    };
  }, []);

  const animateKeywordX = useCallback(
    (target: number, duration = 0.5) => {
      keywordTargetXRef.current = target;
      isKeywordAnimatingRef.current = true;
      keywordAnimRef.current?.stop();
      keywordAnimRef.current = animate(genreX, target, {
        duration,
        ease: easing016,
        onComplete: () => {
          isKeywordAnimatingRef.current = false;
        },
      });
    },
    [genreX]
  );

  const handleScrollKeywords = useCallback(
    (direction: "left" | "right") => {
      const viewport = keywordViewportRef.current;
      if (!viewport) return;

      const step = getKeywordScrollStep(viewport.clientWidth);
      const base = isKeywordAnimatingRef.current
        ? keywordTargetXRef.current
        : genreX.get();
      const target = direction === "left" ? base + step : base - step;
      animateKeywordX(target, 0.5);
    },
    [animateKeywordX, genreX]
  );

  const handleKeywordPanStart = useCallback(() => {
    keywordAnimRef.current?.stop();
    isKeywordAnimatingRef.current = false;
  }, []);

  const handleKeywordPan = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const next = genreX.get() + info.delta.x;
      genreX.set(next);
      keywordTargetXRef.current = next;
    },
    [genreX]
  );

  const handleKeywordPanEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (Math.abs(info.velocity.x) > 20) {
        animateKeywordX(genreX.get() + info.velocity.x * 0.15, 0.45);
      }
    },
    [animateKeywordX, genreX]
  );

  const showInlineCover = !isIntercepted || transitionPhase === "entered";
  const publishedDisplay =
    book.publishedYear ?? book.firstPublishedYear ?? book.yearRead;
  const firstLayoutImage = book.layout?.find(
    (el): el is ImageLayoutElement => el.type === "image"
  );
  const { revealInitial, revealAnimate } = getReadBookRevealVariants(
    isIntercepted,
    isClosing
  );

  return {
    isClosing,
    isDrawerClosing,
    drawerRef,
    heroContainerRef,
    keywordViewportRef,
    keywordCycleRef,
    keywordX,
    keywordRepeatCount,
    hasScrolledPast,
    showInlineCover,
    handleScrollKeywords,
    handleKeywordPanStart,
    handleKeywordPan,
    handleKeywordPanEnd,
    tagItems,
    publishedDisplay,
    firstLayoutImage,
    revealInitial,
    revealAnimate,
  };
}
