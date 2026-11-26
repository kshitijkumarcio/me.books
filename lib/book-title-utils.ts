export interface TitleMarqueeMetrics {
  fontSize: number;
  topTrim: number;
  bottomPad: number;
  copiesPerSet: number;
  setWidth: number;
}

/**
 * Computes 3-cell-tall font size, vertical ascender trim, descender padding,
 * and marquee repeat counts for a book title.
 */
export function computeTitleMarqueeMetrics(
  container: HTMLElement,
  measureItem: HTMLElement,
  title: string,
  ctx: CanvasRenderingContext2D | null
): TitleMarqueeMetrics | null {
  const availableWidth = container.clientWidth;
  if (availableWidth <= 0 || !title) return null;

  const computedContainer = getComputedStyle(container);
  const cellSize =
    parseFloat(computedContainer.getPropertyValue("--cell-size")) || 60;
  const targetCapHeight = cellSize * 3;

  const computedText = getComputedStyle(measureItem);
  let capRatio = 0.725;

  if (ctx) {
    const refSize = 100;
    ctx.font = `${computedText.fontWeight} ${refSize}px ${computedText.fontFamily}`;
    const capMetrics = ctx.measureText("M");
    if (capMetrics.actualBoundingBoxAscent > 0) {
      capRatio = capMetrics.actualBoundingBoxAscent / refSize;
    }
  }

  const fontSize = Math.round((targetCapHeight / capRatio) * 10) / 10;
  measureItem.style.fontSize = `${fontSize}px`;
  measureItem.style.lineHeight = `${fontSize}px`;

  let topTrim = 0;
  let bottomPad = 0;

  if (ctx) {
    ctx.font = `${computedText.fontWeight} ${fontSize}px ${computedText.fontFamily}`;
    const metrics = ctx.measureText(title);
    const fontAscent =
      metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
    const fontDescent =
      metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
    const actualAscent = metrics.actualBoundingBoxAscent;
    const actualDescent = metrics.actualBoundingBoxDescent;

    const halfLeading = (fontSize - (fontAscent + fontDescent)) / 2;
    const baselineFromTop = halfLeading + fontAscent;
    topTrim = Math.max(
      0,
      Math.round((baselineFromTop - actualAscent) * 10) / 10
    );
    const lowestInkFromTop = baselineFromTop + actualDescent;
    bottomPad = Math.max(6, Math.ceil(lowestInkFromTop - fontSize + 8));
  }

  const singleWidth = measureItem.getBoundingClientRect().width;
  const copiesPerSet =
    singleWidth > 0 ? Math.max(1, Math.ceil(availableWidth / singleWidth)) : 2;
  const setWidth = singleWidth > 0 ? copiesPerSet * singleWidth : 0;

  return {
    fontSize,
    topTrim,
    bottomPad,
    copiesPerSet,
    setWidth,
  };
}

/**
 * Measures immediately and subscribes to container resizes + font loading.
 * Returns a cleanup function.
 */
export function observeTitleMarqueeMetrics(
  container: HTMLElement,
  measureItem: HTMLElement,
  title: string,
  onUpdate: (metrics: TitleMarqueeMetrics) => void
): () => void {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const run = () => {
    const result = computeTitleMarqueeMetrics(
      container,
      measureItem,
      title,
      ctx
    );
    if (result) {
      onUpdate(result);
    }
  };

  run();

  const observer = new ResizeObserver(run);
  observer.observe(container);

  let cancelled = false;
  document.fonts?.ready.then(() => {
    if (!cancelled) {
      run();
    }
  });

  return () => {
    cancelled = true;
    observer.disconnect();
  };
}
