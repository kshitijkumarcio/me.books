import { cn } from "@/lib/utils";

interface TicketStampProps {
  text: "FINISHED" | "READING" | "WISHLIST" | string;
  className?: string;
}

export const TicketStamp = ({ text, className }: TicketStampProps) => {
  return (
    <svg
      width="132"
      height="132"
      viewBox="-66 -66 132 132"
      className={cn(
        "pointer-events-none h-33 w-33 stroke-black/15 text-black/15 select-none",
        className
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="rotate(-28)">
        {/* Outer concentric circle */}
        <circle cx="0" cy="0" r="56" stroke="currentColor" strokeWidth="1.2" />

        {/* Inner concentric circle */}
        <circle cx="0" cy="0" r="45" stroke="currentColor" strokeWidth="1" />

        {/* Top parallel chord line */}
        <line
          x1="-43.5"
          y1="-11"
          x2="43.5"
          y2="-11"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Bottom parallel chord line */}
        <line
          x1="-43.5"
          y1="11"
          x2="43.5"
          y2="11"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Stamp text */}
        <text
          x="0"
          y="3.5"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          className="font-mona-sans select-none"
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          {text}
        </text>
      </g>
    </svg>
  );
};

export default TicketStamp;
