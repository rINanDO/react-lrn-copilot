# Design

## Context

Both document pages render through `DocumentView` (`src/component/document/document-view.tsx`). Once the document has loaded, `DocumentView` renders its title (`renderHeader`) and `WetgevingView` inside `<div id="regeling">`. The sidebar (table of contents), the XML link and the footer sit outside `#regeling`. Rendering happens in one synchronous pass, so a `useEffect` that runs after the `loaded` render sees the complete text.

The text is built two ways. `RawText` and the structural views produce React nodes. `AlView` sets processed XML through `dangerouslySetInnerHTML`, and that XML contains `<strong>`, `<em>`, `<a>` and `<span class="visually-hidden">Externe link: </span>`. React owns the whole subtree, so wrapping matches in `<mark>` elements would mean mutating DOM that React reconciles. It would also break the `innerHTML` that `AlView` re-applies on re-render.

`.bwb-artikel` uses `content-visibility: auto` (`src/component/elements/wetten.css`), so off-screen articles skip layout. Large regelingen (such as BWBR0041330) have thousands of articles and several MB of text.

The route pages (`ToestandPage`, `CvdrPage`) read their route parameters with `useParams`. The `ToestandView`, `CvdrView` and `DocumentView` beneath them have no router dependency: `toestand-view.test.tsx` renders `ToestandView` without a router.

## Goals / Non-Goals

**Goals:**
- Highlight matches without mutating the React-owned DOM.
- Keep matching (normalization, offset mapping) a pure function with unit tests that need no browser APIs.
- Keep the cost of a full pass over a large regeling to a single walk of the text, run only when `q` is set.

**Non-Goals:**
- A search box, match counter or next/previous navigation in the UI.
- Carrying `q` along when the user follows the version switcher or the expressions list. The links built there are unchanged; highlighting applies only when the URL itself has `q`.
- A `<mark>`-based fallback for browsers without the CSS Custom Highlight API.
- Matching inside the table of contents or the expressions/version modals.

## Decisions

### 1. Paint with the CSS Custom Highlight API
Build a `Range` per match, register them as `CSS.highlights.set("zoekterm", new Highlight(...ranges))`, and style them with `::highlight(zoekterm)` (a yellow background with dark text, such as `#ffe066` / `#000`). The DOM, the text, the links, copy and paste, and the accessibility tree all stay untouched, which is what the "Highlight preserves content" requirement asks for. React stays free to re-render.
- *Alternative: wrap matches in `<mark>`.* Rejected: it mutates React-owned and `innerHTML` content, splits text nodes inside links, and must be undone on every re-render.
- *Alternative: highlight at render time in `RawText` / `processAlHtml`.* Rejected: matches across inline markup would need state shared across components, and every element view would need the query.

Support: Chrome/Edge 105+, Safari 17.2+, Firefox 140+. When `CSS.highlights` is undefined, the hook returns without doing anything ("Unsupported browsers" requirement).

### 2. Read `q` in the route pages and pass it down as a prop
`ToestandPage` and `CvdrPage` read `useSearchParams().get("q")` and pass `highlightQuery` through `ToestandView` / `CvdrView` to `DocumentView`. The view components stay router-independent and easy to test. `q` is not part of the page `key`: a change of `q` alone re-highlights the page without reloading the document.

### 3. Pure matcher with normalization and an offset map
`findMatches(segments: string[], query: string): Match[]` lives in `src/component/document/highlight-matcher.ts`.
- **Normalize each character separately**: `ch.normalize("NFKD")`, strip `\p{M}` (combining marks), `toLowerCase()`, and map any `\s` (including NBSP) to a space. For each normalized character, record the index of its source character. NFKD (not NFD) also expands compatibility characters such as the Dutch `ĳ` → `ij` and `ﬁ` → `fi`, so one source character can produce several normalized characters and the map handles that.
- **Collapse whitespace**: a space that follows another space is dropped. The query gets the same normalization and is trimmed.
- **Search**: repeated `indexOf` from the end of the previous match, so matches never overlap. Each match maps back to `[sourceStart, sourceEnd)` through the offset map; the end is the source index of the last matched character plus one.

The function works on plain strings, so the edge cases (diacritics, ligatures, whitespace, no overlap) are covered by fast unit tests.

### 4. Collect text per block with a TreeWalker
`collectTextBlocks(root: Element)` walks `#regeling` with a `TreeWalker` (`SHOW_ELEMENT | SHOW_TEXT`):
- **Excluded subtrees**: `FILTER_REJECT` for `.visually-hidden`, `[hidden]`, `[aria-hidden="true"]`, `button`, `script` and `style`. Rejecting `button` keeps out header controls such as "Andere versies"; the others cover text that is not shown.
- **Block boundaries**: elements whose tag is in a fixed block set (`P, DIV, LI, TD, TH, H1–H6, TABLE, TR, UL, OL, DL, DT, DD, SECTION, ARTICLE, BLOCKQUOTE, FIGURE, BR`) start a new segment. Within a segment, the text nodes are concatenated and the walker keeps a `(node, startOffset)` list, so a source index in the segment string resolves to a `(Text, offset)` pair for `Range.setStart` / `setEnd`.
- The walker uses the tag set and not `getComputedStyle` / `checkVisibility()`. Computed styles would force style resolution for thousands of `content-visibility: auto` articles, and the tag set behaves the same in jsdom.

### 5. `useQueryHighlight(containerRef, query, ready)` in DocumentView
A `useEffect` keyed on `query` and the loaded `wetgeving` (identity):
1. Return if the query is blank, `ready` is false, or `CSS.highlights` is unsupported.
2. Collect the blocks, run `findMatches`, and build the `Range`s.
3. Call `CSS.highlights.set("zoekterm", new Highlight(...ranges))` (an empty highlight when there are no matches).
4. Scroll: if there is at least one range and `location.hash` does not resolve to an element (`document.getElementById(decodeURIComponent(hash.slice(1)))`), call `scrollIntoView({ block: "center" })` on the first range's `startContainer.parentElement`. Scrolling the element, not using range coordinates, lets the browser render a `content-visibility: auto` article before positioning it.
5. Cleanup: `CSS.highlights.delete("zoekterm")`. This covers a change of `q`, a different document and unmount ("Highlight follows the URL").

`DocumentView` attaches `containerRef` to `#regeling`, which already marks the right scope: title plus text.

## Risks / Trade-offs

- [Older browsers (such as Firefox before 140) show no highlight] → The spec accepts this. The page works normally, and the support matrix covers current evergreen browsers.
- [A full walk of a very large regeling costs tens of milliseconds] → It runs only when `q` is set, once per document and query, after paint. If profiling shows a problem, the work can be split into chunks with `requestIdleCallback` without changing behaviour.
- [The block tag set misses a block-level element rendered by a future view] → A match could then span two visual blocks. A unit test on the walker documents the set, and new block elements are rare.
- [The scroll position drifts as `content-visibility: auto` articles above the target render at their real size] → Scrolling to the containing element with `block: "center"` keeps the target in view in practice. The intrinsic size `auto 400px` limits the drift.
- [The `::highlight()` style is too faint or clashes with the link colour] → Use a solid background with explicit text colour, and check it against the links (`#154273`) for contrast.
- [jsdom has no `Highlight` or `CSS.highlights`] → Hook tests stub `globalThis.Highlight` and `CSS.highlights` with a `Map`-backed fake, and test the walker and the matcher on their own.
