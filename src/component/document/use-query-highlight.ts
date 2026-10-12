import { useEffect, type RefObject } from "react";
import { findMatches } from "./highlight-matcher";
import { blockRange, collectTextBlocks } from "./highlight-text-blocks";

/** Name of the highlight, styled by `::highlight(zoekterm)`. */
export const HIGHLIGHT_NAME = "zoekterm";

function supportsHighlights(): boolean {
  return (
    typeof CSS !== "undefined" &&
    CSS.highlights !== undefined &&
    typeof Highlight !== "undefined"
  );
}

/** Whether the URL fragment points at an element on the page. */
function hashTargetExists(): boolean {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;
  try {
    return document.getElementById(decodeURIComponent(hash)) !== null;
  } catch {
    return document.getElementById(hash) !== null;
  }
}

/** Ranges over every occurrence of `query` in the shown text under `root`. */
export function findQueryRanges(root: Element, query: string): Range[] {
  return collectTextBlocks(root).flatMap((block) =>
    findMatches(block.text, query).map(({ start, end }) =>
      blockRange(block, start, end),
    ),
  );
}

/**
 * Highlights the occurrences of `query` in the content of `containerRef` once
 * `ready`, and scrolls the first into view unless the URL fragment targets an
 * element. Leaves the DOM untouched: the matches are painted through the CSS
 * Custom Highlight API, so browsers without it show no highlight.
 */
export function useQueryHighlight(
  containerRef: RefObject<HTMLElement | null>,
  query: string | null | undefined,
  ready: boolean,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container || !query?.trim() || !supportsHighlights()) {
      return;
    }

    const ranges = findQueryRanges(container, query);
    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));

    // Scroll the element rather than to the range's coordinates, so the
    // browser lays out a content-visibility: auto article before it scrolls.
    const first = ranges[0];
    if (first && !hashTargetExists()) {
      first.startContainer.parentElement?.scrollIntoView({ block: "center" });
    }

    return () => {
      CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }, [containerRef, query, ready]);
}
