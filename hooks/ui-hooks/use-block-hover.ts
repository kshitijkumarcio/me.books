import { useState, useRef } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { calculateHoverCardPosition } from "@/lib/hover-card-utils";

export function useBlockHover() {
  const [isHovered, setIsHovered] = useState(false);
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
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      mouseX.set(x);
      mouseY.set(y);
      springX.jump(x);
      springY.jump(y);
    }
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const { x, y } = calculateHoverCardPosition(e.clientX, e.clientY, rect);
      if (!isHovered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        setIsHovered(true);
      } else {
        mouseX.set(x);
        mouseY.set(y);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return {
    blockRef,
    isHovered,
    springX,
    springY,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  };
}

export default useBlockHover;
