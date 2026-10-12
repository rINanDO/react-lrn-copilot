# Proposal

## Why

Users who reach a regeling from a search result or a shared link want to see where a specific term or phrase appears in the text. Today the document page has no way to point them to it, so they have to search the long text by hand. A `q` query-string parameter lets a link say which text to highlight on the page.

## What Changes

- The document pages (BWB toestand at `/bwb/...` and `/bwbtt/...`, CVDR regeling at `/cvdr/...`) read an optional `q` query-string parameter.
- When `q` is present and not blank, every occurrence of its value in the visible regeling text gets a highlight once the document has rendered.
- Matching uses the whole phrase, ignores case and diacritics (`geeist` matches `geëist`), and treats runs of whitespace as one space. A match may run across inline markup, such as a phrase that is partly bold or partly a link.
- Only the regeling content (title and text) is searched. The table of contents, the XML download link, the footer and text hidden from view (for example `visually-hidden` screen-reader labels) are not.
- After highlighting, the page scrolls the first match into view, unless the URL also has a `#fragment` that targets an element on the page.
- When `q` is missing or blank, or matches nothing, the page behaves as it does today.
- Highlighting does not change the document text or structure: copying, links and the screen-reader output stay the same.

## Capabilities

### New Capabilities
- `text-highlighting`: highlighting the occurrences of the text given in the `q` query-string parameter in a rendered document, including matching rules, scope and scrolling to the first match.

### Modified Capabilities
<!-- None: the existing toestand-viewer and regeling-rendering requirements are unchanged; highlighting is layered over the rendered content. -->

## Impact

- `src/component/document/document-view.tsx`: reads `q` and applies highlighting to the `#regeling` content after it renders.
- New highlighting module under `src/component/document/` (text matching plus the code that applies the highlight), with unit tests.
- New CSS for the highlight style, in `src/component/elements/wetten.css` or a dedicated stylesheet.
- Uses the browser's CSS Custom Highlight API, so no new npm dependencies. Browsers without it get no highlight; the page still works (see design.md).
- Both BWB and CVDR pages get the feature through the shared `DocumentView`.
