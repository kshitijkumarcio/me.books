"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export interface PaperBackgroundProps {
  /** Base paper color (e.g. "#F0EC76", "rgb(...)", or CSS variable) */
  color?: string;
  className?: string;

  /**
   * Seed for the procedural noise generator.
   * Giving different numbers (e.g. 1, 2, 42, 999) gives completely
   * different tear shapes, ripples, and surface fiber topographies.
   * Defaults to an auto-generated seed based on instance ID.
   */
  seed?: number;

  /**
   * Amplitude of the torn/ripped edge displacement in pixels.
   * 0 = straight clean cut
   * 4-6 = subtle deckled stationery edge
   * 8-12 = standard ripped notebook paper
   * 16-24 = deeply shredded / jagged scrap
   * @default 10
   */
  tearStrength?: number;

  /**
   * Frequency / chunkiness of the tears along the perimeter.
   * Lower (0.02 - 0.03) = broad, wavy organic rips
   * Higher (0.05 - 0.09) = fine, rapid jagged tears
   * @default 0.035
   */
  tearFrequency?: number;

  /**
   * 3D tactile paper tooth/depth (surfaceScale).
   * 0 = flat color
   * 1-2 = smooth cardstock / bond paper
   * 2.5-3.5 = sketchbook / watercolor paper
   * 4+ = rough handmade parchment
   * @default 2.2
   */
  roughness?: number;

  /**
   * Density/frequency of the microscopic paper fibers and grain.
   * Lower (0.03) = larger fiber patches
   * Higher (0.08) = tight, fine micro-grain
   * @default 0.05
   */
  grainDensity?: number;

  /**
   * Directional angle of the light source in degrees (0 - 360).
   * Changes which sides of the paper tooth receive highlights vs shadows.
   * @default 45
   */
  lightAngle?: number;

  /**
   * Elevation angle of the light source in degrees (10 - 80).
   * Lower angles create longer, dramatic creases; higher angles soften shadows.
   * @default 65
   */
  lightElevation?: number;

  /**
   * Quick toggle to enable or disable torn edges.
   * If false, tearStrength is set to 0.
   * @default true
   */
  tornEdges?: boolean;
}

function getSeedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 10000;
}

export const PaperBackground = ({
  color = "#F0EC76",
  className,
  seed,
  tearStrength = 10,
  tearFrequency = 0.035,
  roughness = 2.2,
  grainDensity = 0.05,
  lightAngle = 45,
  lightElevation = 65,
  tornEdges = true,
}: PaperBackgroundProps) => {
  const rawId = useId().replace(/:/g, "");
  const filterId = `paper-filter-${rawId}`;

  // Deterministic seed fallback if none passed
  const activeSeed = seed ?? getSeedFromId(rawId);
  const effectiveTearStrength = tornEdges ? tearStrength : 0;

  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none saturate-[1.1] absolute inset-0 h-full w-full overflow-visible",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={filterId}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          {/* 1. Surface Texture Noise (tuned for micro-pulp & paper grain) */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={grainDensity}
            numOctaves={5}
            seed={activeSeed}
            result="surfaceNoise"
          />

          {/* 2. 3D Lighting (creates physical paper tooth highlights and creases) */}
          <feDiffuseLighting
            in="surfaceNoise"
            lightingColor="#ffffff"
            surfaceScale={roughness}
            result="light"
          >
            <feDistantLight azimuth={lightAngle} elevation={lightElevation} />
          </feDiffuseLighting>

          {/* 3. Clip light strictly to shape alpha (prevents any external grey box) */}
          <feComposite
            in="light"
            in2="SourceAlpha"
            operator="in"
            result="lightCut"
          />

          {/* 4. Multiply light & shadow onto the dynamic color */}
          <feBlend
            mode="multiply"
            in="SourceGraphic"
            in2="lightCut"
            result="texturedPaper"
          />

          {/* 5. Edge Tear Noise (uses dedicated frequency & offset seed for organic rips) */}
          {effectiveTearStrength > 0 && (
            <feTurbulence
              type="fractalNoise"
              baseFrequency={tearFrequency}
              numOctaves={4}
              seed={activeSeed + 137}
              result="tearNoise"
            />
          )}

          {/* 6. Displace perimeter into unique torn shape */}
          {effectiveTearStrength > 0 && (
            <feDisplacementMap
              in="texturedPaper"
              in2="tearNoise"
              scale={effectiveTearStrength}
              xChannelSelector="D"
              yChannelSelector="A"
            />
          )}
        </filter>
      </defs>

      <rect
        width="100%"
        height="100%"
        fill={color}
        filter={`url(#${filterId})`}
      />
    </svg>
  );
};

export default PaperBackground;
