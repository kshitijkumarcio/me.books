"use client";

import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";

interface UseAdaptiveGridCellOptions {
  coverRef?: React.RefObject<HTMLElement | null>;
}

const REFERENCE_ATF_CELLS = 15.5;
const REFERENCE_TITLE_CELLS = 3;
const REFERENCE_COVER_CELLS = 5.8;
const REFERENCE_COVER_BOTTOM_CELLS = 6.7;
const REFERENCE_KEYWORD_ROW = 9;
const REFERENCE_QUOTE_CENTER_CELLS = 12;

/**
 * Measures the grid container (`mainRef`) and above-the-fold hero section (`sectionRef`)
 * to compute the exact cell dimensions produced by CSS `background-repeat: round`
 * (`.bg-grid-dashed-accurate`) and responsive ATF cell ratios:
 * - `--adaptive-cell-x` / `--adaptive-cell-y`
 * - `--cover-cells`: `(5.8 / 15.5) * atfCells`
 * - `--cover-bottom-cells`: `(6.7 / 15.5) * atfCells`
 * - `--meta-row`: `ceil(coverBottomCells)` (row immediately below the cover's ending cell)
 * - `--keyword-row`: `round((9 / 15.5) * atfCells)` (clamped below `metaRow`)
 * - `--quote-center-cells`: `max(keywordRow + 2, (12 / 15.5) * atfCells)`
 *
 * Also returns `titleCells = round((3 / 15.5) * atfCells)` for `FullWidthPageTitle`.
 */
export function useAdaptiveGridCell<
  TMain extends HTMLElement = HTMLElement,
  TSection extends HTMLElement = HTMLElement,
>(options?: UseAdaptiveGridCellOptions) {
  const mainRef = useRef<TMain>(null);
  const sectionRef = useRef<TSection>(null);
  const coverRef = options?.coverRef;
  const [titleCells, setTitleCells] = useState(REFERENCE_TITLE_CELLS);

  useLayoutEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const update = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        "--cell-size"
      );
      const parsed = parseFloat(raw);
      const base =
        !isNaN(parsed) && parsed > 0
          ? parsed
          : window.innerWidth < 768
            ? 40
            : 60;

      const mainRect = mainEl.getBoundingClientRect();
      if (mainRect.width <= 0 || mainRect.height <= 0) return;

      const cols = Math.max(1, Math.round(mainRect.width / base));
      const rows = Math.max(1, Math.round(mainRect.height / base));
      const cellW = mainRect.width / cols;
      const cellH = mainRect.height / rows;

      mainEl.style.setProperty("--adaptive-cell-x", `${cellW}px`);
      mainEl.style.setProperty("--adaptive-cell-y", `${cellH}px`);

      const sectionEl = sectionRef.current;
      const atfHeight = sectionEl
        ? sectionEl.getBoundingClientRect().height
        : mainRect.height;
      const atfCells = atfHeight / cellH;
      const isCompactDesktop = window.innerWidth < 1300;

      const titleTopCells = isCompactDesktop ? 1.5 : 2;
      const nextTitleCells = isCompactDesktop
        ? 2
        : Math.max(
            2,
            Math.round(atfCells * (REFERENCE_TITLE_CELLS / REFERENCE_ATF_CELLS))
          );
      const coverCells =
        atfCells * (REFERENCE_COVER_CELLS / REFERENCE_ATF_CELLS);
      const coverBottomCells =
        atfCells * (REFERENCE_COVER_BOTTOM_CELLS / REFERENCE_ATF_CELLS);
      const floorBottom = Math.floor(coverBottomCells);
      const occupiedFraction = coverBottomCells - floorBottom;
      // Place meta row in the ending cell row if >= 80% of it is blank
      const metaRow =
        occupiedFraction > 0 && occupiedFraction <= 0.2
          ? floorBottom
          : Math.ceil(coverBottomCells);
      const keywordRow = Math.max(
        metaRow + 2,
        Math.round(atfCells * (REFERENCE_KEYWORD_ROW / REFERENCE_ATF_CELLS))
      );
      const quoteCenterCells = Math.max(
        keywordRow + 2,
        atfCells * (REFERENCE_QUOTE_CENTER_CELLS / REFERENCE_ATF_CELLS)
      );

      mainEl.style.setProperty("--title-top-cells", `${titleTopCells}`);
      mainEl.style.setProperty("--cover-cells", `${coverCells}`);
      mainEl.style.setProperty("--cover-bottom-cells", `${coverBottomCells}`);
      mainEl.style.setProperty("--meta-row", `${metaRow}`);
      mainEl.style.setProperty("--keyword-row", `${keywordRow}`);
      mainEl.style.setProperty("--quote-center-cells", `${quoteCenterCells}`);

      const coverEl = coverRef?.current;
      if (coverEl) {
        const coverWidth = coverEl.getBoundingClientRect().width;
        if (coverWidth > 0) {
          mainEl.style.setProperty("--cover-width", `${coverWidth}px`);
        }
      }

      setTitleCells((prev) =>
        prev === nextTitleCells ? prev : nextTitleCells
      );
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(mainEl);
    if (sectionRef.current) {
      ro.observe(sectionRef.current);
    }
    if (coverRef?.current) {
      ro.observe(coverRef.current);
    }
    window.addEventListener("resize", update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [coverRef]);

  return { mainRef, sectionRef, titleCells };
}
