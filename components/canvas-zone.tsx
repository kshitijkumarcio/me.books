"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ZoneConfig } from "@/hooks/layout-hooks/usecanvasnavigation";

interface CanvasZoneProps {
  zone: ZoneConfig;
  children: React.ReactNode;
  itemCount?: number;
  className?: string;
}

export const CanvasZone = ({
  zone,
  children,
  itemCount,
  className,
}: CanvasZoneProps) => {
  return (
    <div
      id={zone.id}
      style={{
        backgroundColor: zone.bgColor,
      }}
      className={cn(
        "p-cell relative rounded-2xl transition-colors duration-700 ease-out",
        className
      )}
    >
      {/* Grid Content */}
      <div className="relative">{children}</div>
    </div>
  );
};

export default CanvasZone;
