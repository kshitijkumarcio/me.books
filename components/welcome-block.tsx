"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WelcomeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export const WelcomeBlock = ({ children, className }: WelcomeBlockProps) => {
  return (
    <div
      data-welcome-block="true"
      className={cn(
        "w-cell-8 h-cell-8 relative flex select-none flex-col justify-between aspect-square",
        "rounded-2xl border-2 border-dashed border-neutral-300 bg-white/95 p-4 shadow-sm backdrop-blur-xs transition-all hover:border-neutral-400",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Welcome · 8 × 8 Cells
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#d9ff36] ring-2 ring-black/10" />
          </div>

          <div className="space-y-1">
            <h2 className="font-mona-sans text-xl font-bold tracking-tight text-neutral-900">
              Kshelf.
            </h2>
            <p className="font-mona-sans text-[11px] leading-tight font-medium text-neutral-500">
              Curated library, current readings & future wishlist.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5">
            <span className="font-mono text-[9px] text-neutral-400">
              Custom welcome block
            </span>
            <span className="font-mono text-[9px] font-semibold text-neutral-700">
              center canvas
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBlock;
