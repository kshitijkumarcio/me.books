/**
 * Rounds a number to the nearest multiple of 25.
 */
export function roundToNearest25(price: number): number {
  return Math.round(price / 25) * 25;
}

/**
 * Formats a book price to `~{price}` with price rounded to the nearest multiple of 25.
 * e.g. 450 -> "~450", 323 -> "~325", "480" -> "~475", "₹499" -> "~500"
 */
export function formatWishlistPrice(
  rawPrice: number | string | null | undefined
): string | null {
  if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
    return null;
  }

  if (typeof rawPrice === "number") {
    return `~${roundToNearest25(rawPrice)}`;
  }

  const str = String(rawPrice).trim();
  const numericMatch = str.match(/\d+(?:\.\d+)?/);
  if (numericMatch) {
    const num = parseFloat(numericMatch[0]);
    if (!isNaN(num)) {
      return `~${roundToNearest25(num)}`;
    }
  }

  return str.startsWith("~") ? str : `~${str}`;
}
