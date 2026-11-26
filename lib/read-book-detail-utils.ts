import { easing016 } from "@/constants";

export const PLACEHOLDER_QUOTE =
  "“Lorem ipsum is scrambled Latin placeholder text used in graphic design, publishing, and web development to preview layouts”";

export const PLACEHOLDER_TAKEAWAYS =
  "Adding here my personal takeaways from this read soon as i get more time to work on this project.";

export const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

/** Formats a numeric rating to 1 decimal for integers or up to 2 decimals otherwise. */
export function formatRating(rating: number): string {
  return Number.isInteger(rating)
    ? rating.toFixed(1)
    : `${Math.round(rating * 100) / 100}`;
}

/** Returns the fill fraction (0 to 1, rounded to 2 decimal places) for a 1-indexed star. */
export function getStarFillFraction(rating: number, starIndex: number): number {
  const fillFraction = Math.max(0, Math.min(1, rating - (starIndex - 1)));
  return Math.round(fillFraction * 100) / 100;
}

/** Computes the horizontal step distance for a keyword bar button click. */
export function getKeywordScrollStep(viewportWidth: number): number {
  return Math.max(160, Math.round(viewportWidth * 0.15));
}

/** Wraps horizontal track offset into [-cycleWidth, 0) for seamless infinite looping. */
export function wrapKeywordX(x: number, cycleWidth: number): number {
  if (cycleWidth <= 0) return 0;
  return (((x % cycleWidth) + cycleWidth) % cycleWidth) - cycleWidth;
}

/** Computes how many keyword cycles are needed to cover the viewport during wrapping. */
export function getKeywordRepeatCount(
  viewportWidth: number,
  cycleWidth: number
): number {
  if (viewportWidth <= 0 || cycleWidth <= 0) return 3;
  return Math.max(3, Math.ceil(viewportWidth / cycleWidth) + 2);
}

/** Returns initial and animate props for masked/faded content reveals in ReadBookDetail. */
export function getReadBookRevealVariants(
  isIntercepted: boolean,
  isClosing: boolean
) {
  return {
    revealInitial: isIntercepted
      ? { opacity: 0, y: 12 }
      : { opacity: 1, y: 0 },
    revealAnimate: {
      opacity: isClosing ? 0 : 1,
      y: isClosing ? 12 : 0,
      transition: {
        duration: isClosing ? 0.25 : 0.55,
        delay: isClosing ? 0 : 0.6,
        ease: easing016,
      },
    },
  };
}
