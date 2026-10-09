# Proposal

## Why

The project adopted OpenSpec but has no specs yet, so there is no recorded contract for what the application already does. Later changes have nothing to modify against, and reviewers cannot tell intended behavior from accidental behavior. This change backfills a baseline that is true of the code today.

## What Changes

- Record the existing, working behavior of the application as six capabilities. No code changes.
- Only behavior that works today is specified. Known gaps are deliberately left out and tracked as follow-up changes instead:
  - Table-of-contents links do not match the anchors in the rendered content (`fix-toc-anchors`).
  - Two inline-markup pipelines exist; `BwbAl`/`processAlHtml` and `bwb-preview-modal` are unused, unknown inline tags render a `* TODO` marker, and the EUR-Lex link language differs between them (`unify-inline-markup`).
  - "In force today" is computed from the UTC date rather than the Dutch date (`fix-geldend-timezone`).
  - The "vervallen" check differs between articles and annexes (`align-vervallen-rule`).
- Deployment (Azure App Service, SPA rewrite in `web.config`) is out of scope.

## Capabilities

### New Capabilities

- `toestand-loading`: Fetching a toestand and a work manifest from the BWB repository, resolving illustration URLs, reporting progress, and mapping the XML to the typed model.
- `version-resolution`: The `/bwb/:bwbid` route, which forwards to the expression in force today or lists all expressions.
- `toestand-viewer`: The page that shows one toestand: loading and error states, title, source link, and the entry point to other versions.
- `version-switcher`: The "Andere versies" dialog for browsing, searching and selecting another expression of the same work.
- `table-of-contents`: The sidebar tree of chapters, paragraphs and articles with folding and article ranges.
- `regeling-rendering`: Rendering the regulation text: structural hierarchy, headings, paragraphs, lists, tables, illustrations, repealed parts and inline markup.

### Modified Capabilities

None.

## Impact

- Adds `openspec/specs/` content on archive; no application code, APIs or dependencies change.
- Establishes the baseline that the follow-up changes listed above will modify.
