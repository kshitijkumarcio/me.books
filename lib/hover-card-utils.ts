export interface HoverCardPositionOptions {
  cardWidth?: number;
  cardHeight?: number;
  offsetX?: number;
  offsetY?: number;
  edgePadding?: number;
}

/**
 * Calculates container-relative (x, y) coordinates for a hover card follower,
 * ensuring the card flips to the opposite side of the cursor when near screen edges
 * so it never overflows the viewport.
 */
export const calculateHoverCardPosition = (
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  options: HoverCardPositionOptions = {}
): { x: number; y: number } => {
  const {
    cardWidth = 220,
    cardHeight = 125,
    offsetX = 24,
    offsetY = 24,
    edgePadding = 16,
  } = options;

  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Horizontal: default to right of cursor (+offsetX).
  // If placing it to the right exceeds the right edge, flip to the left of the cursor (-cardWidth - offsetX).
  let targetViewportX = clientX + offsetX;
  if (targetViewportX + cardWidth > windowWidth - edgePadding) {
    targetViewportX = clientX - cardWidth - offsetX;
  }
  // Clamp within viewport bounds
  targetViewportX = Math.max(
    edgePadding,
    Math.min(targetViewportX, windowWidth - cardWidth - edgePadding)
  );

  // Vertical: default to below cursor (+offsetY).
  // If placing it below exceeds the bottom edge, flip above the cursor (-cardHeight - offsetY).
  let targetViewportY = clientY + offsetY;
  if (targetViewportY + cardHeight > windowHeight - edgePadding) {
    targetViewportY = clientY - cardHeight - offsetY;
  }
  // Clamp within viewport bounds
  targetViewportY = Math.max(
    edgePadding,
    Math.min(targetViewportY, windowHeight - cardHeight - edgePadding)
  );

  return {
    x: targetViewportX - containerRect.left,
    y: targetViewportY - containerRect.top,
  };
};

export default calculateHoverCardPosition;

