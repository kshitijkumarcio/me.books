"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { images } from "@/constants/images";
import useTicketPerforations from "@/hooks/ui-hooks/use-ticket-perforations";
import { cn } from "@/lib/utils";

export interface WishlistStampTicketProps {
  className?: string;
}

export const WishlistStampTicket = ({
  className,
}: WishlistStampTicketProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic postage stamp perforations
  const { ticketRef, maskStyle } = useTicketPerforations<HTMLDivElement>({
    holeRadius: 2.8,
    standardPitch: 11,
    cornerMargin: 7,
  });

  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring values for smooth 3D tilt animation
  const springConfig = { damping: 20, stiffness: 280, mass: 0.6 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Transform parameters from reference
  const rotateDepth = 15; // Degrees of rotation
  const translateDepth = 12; // Pixels of translation

  // Transform mouse position to rotation values (tilted toward cursor)
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`]
  );

  // Translation transforms
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`]
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000 }}
      className={cn(
        "pointer-events-auto relative block drop-shadow-[0_8px_16px_rgba(0,0,0,0.14)] filter transition-all duration-300 select-none",
        isHovered && "drop-shadow-[0_16px_30px_rgba(0,0,0,0.26)]",
        className
      )}
    >
      <motion.div
        ref={ticketRef}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
        style={{
          ...maskStyle,
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          translateX: isHovered ? translateX : 0,
          translateY: isHovered ? translateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full cursor-pointer overflow-hidden will-change-transform"
      >
        <div className="relative block h-full w-full">
          {/* Background image */}
          <Image
            src={images.BoyWithBook}
            alt="boy with book"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover select-none"
            priority
          />

          {/* Ticket overlay elements */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3.5 text-white select-none">
            {/* Top Heading */}
            <div>
              <p className="font-mona-sans text-[13px] leading-3.25 font-medium tracking-tight text-white drop-shadow-sm">
                wishlist for
                <br />
                books
              </p>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col gap-3">
              {/* Horizontal dividing line */}
              <div className="h-px w-full bg-white" />

              {/* Footer Info & QR Code */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col leading-tight">
                  <span className="font-mona-sans text-[5px] font-medium text-white/90">
                    last updated
                  </span>
                  <span className="font-mona-sans mt-0.5 text-[7px] font-medium tracking-tight whitespace-nowrap text-white">
                    22 November
                  </span>
                </div>

                {/* QR Code */}
                <div className="relative h-8 w-8 shrink-0">
                  <Image
                    src={images.WishlistAmazonQr}
                    alt="Amazon Wishlist QR"
                    draggable={false}
                    className="pointer-events-none h-full w-full object-contain select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WishlistStampTicket;
