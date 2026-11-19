import { useState, useRef, useEffect } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { calculateHoverCardPosition } from "@/lib/hover-card-utils";

export function useBlockHover() {
  const [isHovered, setIsHovered] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      mouseX.set(x);
      mouseY.set(y);
      springX.jump(x);
      springY.jump(y);
    }
    setIsHovered(true);
    setIsElevated(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        setIsHovered(true);
        setIsElevated(true);
      } else {
        mouseX.set(x);
        mouseY.set(y);
      }
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
