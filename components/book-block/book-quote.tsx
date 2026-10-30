"use client";

import PaperBackground from "@/components/ui-components/paper-background";
import { cn } from "@/lib/utils";

interface BookQuoteProps {
  quote: string;
  author?: string;
  color?: string;
  textColor?: "black" | "white";
  seed?: number;
  tearStrength?: number;
  tearFrequency?: number;
  roughness?: number;
  lightAngle?: number;
  lightElevation?: number;
  rotation?: string;
  className?: string;
  maxWidthClass?: string;
}

export const BookQuote = ({
  quote,
  author,
  color = "#FFF27B",
  textColor = "black",
  seed = 42,
  tearStrength = 6,
  tearFrequency = 0.08,
  roughness = 1.5,
  lightAngle = 45,
  lightElevation = 70,
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
        <p
          className={cn(
            "font-mona-sans relative z-10 text-[12px] leading-snug font-semibold italic md:text-[13px]",
            textColor === "white" ? "text-white" : "text-neutral-900"
          )}
        >
          {quote}
        </p>

        <PaperBackground
          color={color}
          seed={seed}
          tearStrength={tearStrength}
          tearFrequency={tearFrequency}
          roughness={roughness}
          lightAngle={lightAngle}
          lightElevation={lightElevation}
        />
      </div>
    </div>
  );
};

export default BookQuote;
