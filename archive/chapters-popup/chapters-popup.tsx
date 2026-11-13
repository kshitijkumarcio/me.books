"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { images } from "@/constants";

export interface ChapterItem {
  id: string;
  title: string;
  subtitle: string;
  image: StaticImageData | string;
  bgImage: StaticImageData | string;
}

export const CHAPTER_ITEMS: ChapterItem[] = [
  {
    id: "books-read",
    title: "Book shelf",
    subtitle: "Looking to borrow any book?",
    image: images.chapter1a,
    bgImage: images.chapter1b,
  },
  {
    id: "current-reads",
    title: "Current reads",
    subtitle: "What am i reading rn?",
    image: images.chapter2a,
    bgImage: images.chapter2b,
  },
  {
    id: "wishlist",
    title: "Wishlist",
    subtitle: "Perfect to gift me something!",
    image: images.chapter3a,
    bgImage: images.chapter3b,
  },
];

interface ChaptersPopupProps {
  onSelect: (zoneId: string) => void;
  className?: string;
}

export const ChaptersPopup = forwardRef<HTMLDivElement, ChaptersPopupProps>(
  ({ onSelect, className }, ref) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{
      width: number;
      height: number;
    }>({
      width: 473,
      height: 228,
    });

    useEffect(() => {
      if (!frameRef.current) return;

      const updateDimensions = () => {
        if (frameRef.current) {
          const rect = frameRef.current.getBoundingClientRect();
          setDimensions({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      };

      updateDimensions();
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(frameRef.current);

      return () => observer.disconnect();
    }, []);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "pointer-events-auto fixed bottom-20 left-1/2 z-50 mb-3 -translate-x-1/2 select-none lg:absolute lg:right-0 lg:bottom-full lg:left-auto lg:mb-3.5 lg:translate-x-0",
          className
        )}
      >
        {/* Main Figma Frame container */}
        <div
          ref={frameRef}
          className="bg-white relative w-86 max-w-[calc(100vw-36px)] border border-[#0d99ff] p-1.5"
        >
          {/* Top Figma Header: Frame 8 + Dev Mode icons */}
          <div className="pointer-events-none absolute -top-5.5 right-0 left-0 flex items-center justify-between select-none">
            <span className="font-sans text-[11px] font-medium tracking-tight text-blue-400">
              Frame 8
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-blue-400">
                &lt;/&gt;
              </span>
            </div>
          </div>

          {/* 4 Corner Vertices (Figma selection handles) */}
          <div className="pointer-events-none absolute top-[-3.5px] left-[-3.5px] h-1.75 w-1.75 border-[1.5px] border-blue-400 bg-white" />
          <div className="pointer-events-none absolute top-[-3.5px] right-[-3.5px] h-1.75 w-1.75 border-[1.5px] border-blue-400 bg-white" />
          <div className="pointer-events-none absolute bottom-[-3.5px] left-[-3.5px] h-1.75 w-1.75 border-[1.5px] border-blue-400 bg-white" />
          <div className="pointer-events-none absolute right-[-3.5px] bottom-[-3.5px] h-1.75 w-1.75 border-[1.5px] border-blue-400 bg-white" />

          {/* Bottom Dimensions Pill Badge */}
          <div className="pointer-events-none absolute -bottom-5.5 left-1/2 -translate-x-1/2 select-none">
            <div className="flex items-center justify-center rounded-xs bg-blue-400 px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium text-white shadow-xs">
              {dimensions.width} × {dimensions.height}
            </div>
          </div>

          {/* Inner Content Grid */}
          <div className="space-y-2">
            {CHAPTER_ITEMS.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onSelect(chapter.id)}
                className="group/item relative flex w-full cursor-pointer items-center justify-between overflow-hidden border p-1 text-left transition-colors duration-150 focus:outline-none"
              >
                {/* Left: Thumbnail & Text */}
                <div className="relative z-10 flex items-center gap-2">
                  <div className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden">
                    <Image
                      src={chapter.image}
                      alt={chapter.title}
                      fill
                      sizes="80px"
                      className="object-cover "
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mona-sans text-[16px] font-semibold lg:text-[20px] whitespace-nowrap">
                      {chapter.title}
                    </span>
                    <span className="font-mona-sans text-[12px] font-medium text-black/50">
                      {chapter.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right: Graphic illustration banner fading from right edge */}
                <div className="pointer-events-none absolute top-0 right-0 bottom-0 h-full w-[45%] overflow-hidden">
                  <Image
                    src={chapter.bgImage}
                    alt=""
                    fill
                    sizes="520px"
                    className="object-cover object-right opacity-80  sm:opacity-90"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
);

ChaptersPopup.displayName = "ChaptersPopup";
export default ChaptersPopup;

