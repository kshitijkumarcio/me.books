import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { calculateHoverCardPosition } from "@/lib/hover-card-utils";

export function useBlockHover() {
  const [isHovered, setIsHovered] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(
    null
  );
  const labelDimsRef = useRef<{ cardWidth: number; cardHeight: number }>({
    cardWidth: 180,
    cardHeight: 28,
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });
  const springY = useSpring(mouseY, {
    damping: 60,
    stiffness: 300,
    mass: 0.5,
  });

  const updateCardDimensions = useCallback(() => {
    if (!blockRef.current) return false;
    const labelEl = blockRef.current.querySelector<HTMLElement>(
      "[data-book-hover-label]"
    );
    if (labelEl) {
      const width =
        labelEl.offsetWidth || labelEl.getBoundingClientRect().width;
      const height =
        labelEl.offsetHeight || labelEl.getBoundingClientRect().height;
      if (width > 0 && height > 0) {
        labelDimsRef.current = { cardWidth: width, cardHeight: height };
        return true;
      }
    }
    return false;
  }, []);

  const updatePosition = useCallback(
    (clientX: number, clientY: number, jump = false) => {
      if (!blockRef.current) return;
      updateCardDimensions();
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(
        clientX,
        clientY,
        rect,
        labelDimsRef.current
      );
      if (jump) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
      } else {
        mouseX.set(x);
        mouseY.set(y);
      }
    },
    [mouseX, mouseY, springX, springY, updateCardDimensions]
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    updatePosition(e.clientX, e.clientY, true);
    setIsHovered(true);
    setIsElevated(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!isHovered) {
      updatePosition(e.clientX, e.clientY, true);
      setIsHovered(true);
      setIsElevated(true);
    } else {
      updatePosition(e.clientX, e.clientY, false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    // Maintain elevation during the 180ms AnimatePresence exit transition
    leaveTimerRef.current = setTimeout(() => {
      setIsElevated(false);
      leaveTimerRef.current = null;
    }, 250);
  };

  useEffect(() => {
    if (!isHovered || !blockRef.current) return;
    const labelEl = blockRef.current.querySelector<HTMLElement>(
      "[data-book-hover-label]"
    );
    if (!labelEl) return;

    if (lastMousePosRef.current) {
      updatePosition(
        lastMousePosRef.current.clientX,
        lastMousePosRef.current.clientY,
        false
      );
    }

    const observer = new ResizeObserver(() => {
      if (lastMousePosRef.current) {
        updatePosition(
          lastMousePosRef.current.clientX,
          lastMousePosRef.current.clientY,
          false
        );
      }
    });

    observer.observe(labelEl);
    return () => observer.disconnect();
  }, [isHovered, updatePosition]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  return {
    blockRef,
    isHovered,
    isElevated,
    springX,
    springY,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  };
}

export default useBlockHover;
