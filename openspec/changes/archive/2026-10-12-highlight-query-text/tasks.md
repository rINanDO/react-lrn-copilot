# Tasks

## 1. Matcher

- [x] 1.1 Create `src/component/document/highlight-matcher.ts` with `findMatches(text, query)` per design.md §3: per-character NFKD, strip combining marks, lower-case, whitespace→space, collapse repeated spaces, offset map back to source indices, non-overlapping `indexOf` search, blank query → no matches
- [x] 1.2 Add `highlight-matcher.test.ts` covering: case ("Grondwet"/"GRONDWET"), diacritics both ways ("geeist"↔"geëist", match range covers the accented char), `ĳ`→"ij", NBSP and line breaks vs. single space, phrase vs. separate words, no overlap ("aa" in "aaa"), blank and whitespace-only query; verify with `npm test`

## 2. Text collection

- [x] 2.1 Create `src/component/document/highlight-text-blocks.ts` with `collectTextBlocks(root)` per design.md §4: TreeWalker rejecting `.visually-hidden`, `[hidden]`, `[aria-hidden="true"]`, `button`, `script`, `style`; splitting segments at the block tag set; returning per segment its text and a way to resolve a source index to `(Text, offset)`
- [x] 2.2 Add `highlight-text-blocks.test.ts` (jsdom) covering: a phrase across `<em>`/`<a>` within one `<p>` forms one segment, two `<p>`s and two `<td>`s form separate segments, `.visually-hidden` and `button` text are excluded, index→(node, offset) resolves at node boundaries; verify with `npm test`

## 3. Highlight hook and styling

- [x] 3.1 Create `src/component/document/use-query-highlight.ts` with `useQueryHighlight(containerRef, query, ready)` per design.md §5: feature-detect `CSS.highlights`/`Highlight`, build ranges from `collectTextBlocks` + `findMatches`, register them under the name `zoekterm`, scroll the first match's parent element into view (`block: "center"`) unless `location.hash` resolves to an element, and delete the highlight on cleanup
- [x] 3.2 Add the `::highlight(zoekterm)` rule (solid background with explicit dark text colour, readable on links in `#154273`) to `src/component/elements/wetten.css`; verify visually in step 5.2
- [x] 3.3 Add `use-query-highlight.test.tsx` with a `Map`-backed fake for `CSS.highlights` and a stub `Highlight` class plus a mocked `Element.prototype.scrollIntoView`, covering: ranges registered for matches, nothing registered for blank query, highlight deleted on query change and unmount, scroll called once for the first match, no scroll when the hash targets an existing element or there are no matches, and no error when `CSS.highlights` is undefined; verify with `npm test`

## 4. Wire into the pages

- [x] 4.1 Add an optional `highlightQuery` prop to `DocumentView`, attach a ref to `#regeling` and call `useQueryHighlight` with `ready` true only in the `loaded` state; verify existing `toestand-view.test.tsx` still passes
- [x] 4.2 Pass `highlightQuery` through `ToestandView` and `CvdrView`, and read it with `useSearchParams().get("q")` in `ToestandPage` and `CvdrPage` (not part of the page `key`); verify with `npm run typecheck`
- [x] 4.3 Extend `toestand-view.test.tsx` with a case rendering `ToestandView` with `highlightQuery` and the `CSS.highlights` fake, asserting a match in the citeertitel is registered and that no highlight is registered for a term only present in the sidebar; verify with `npm test`

## 5. Integration check

- [x] 5.1 Run `npm run ci` (typecheck, lint, test, build) and verify it passes
- [x] 5.2 Run `npm run dev` and check in a current Chromium and Firefox: `/bwb/BWBR0001840/<expression>?q=grondrechten` highlights the matches and scrolls to the first; `?q=geeist` matches "geëist"; a phrase partly inside a link is highlighted and the link still works; adding `#<artikel-id>` suppresses the scroll; `?q=` and a non-matching `q` leave the page unchanged; the sidebar and "Andere versies" button are never highlighted; a `/cvdr/...` page with `q` highlights as well; a large regeling (BWBR0041330) with `q` stays responsive

## Workflow follow-up

- After review, archive this change so `text-highlighting` becomes a main spec under `openspec/specs/`.
