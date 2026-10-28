"use client";

import PaperBackground from "@/components/ui-components/paper-background";
import { cn } from "@/lib/utils";

interface BookQuoteProps {
  quote: string;
  author?: string;
  color?: string;
  seed?: number;
  tearStrength?: number;
  rotation?: string;
  className?: string;
  maxWidthClass?: string;
}

export const BookQuote = ({
  quote,
  author,
  color = "#FFF27B",
  seed = 42,
  tearStrength = 6,
  rotation = "rotate-0",
  className,
  maxWidthClass = "max-w-[260px] md:max-w-[300px]",
}: BookQuoteProps) => {
  return (
    <div
      className={cn(
        "relative select-none",
        rotation,
        className
      )}
    >
      <div className={cn("relative p-3.5", maxWidthClass)}>
        <p className="font-mona-sans relative z-10 text-[12px] leading-snug font-semibold text-neutral-900 italic md:text-[13px]">
          {quote}
        </p>

        <PaperBackground
          color={color}
          seed={seed}
          tearStrength={tearStrength}
          tearFrequency={0.08}
          roughness={1.5}
          lightAngle={45}
          lightElevation={70}
        />
      </div>
    </div>
  );
};

export default BookQuote;
