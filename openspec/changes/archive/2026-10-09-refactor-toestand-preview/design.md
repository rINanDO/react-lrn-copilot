# Design

## Context

`BwbPreviewContent` is rendered in three places: the `/bwb/...` and `/bwbtt/...` routes through `BwbPreview`, the unused `bwb-preview-modal.tsx`, and `bwb-preview.test.tsx`. The test mocks `getToestand` and checks the call arguments, the error alert, the progress text and the title heading. The page relies on stable markup for styling (`.preview`, `.container.columns.columns--sticky-sidebar`, `#content`, `#regeling`, `.wetgeving`). `BwbPreview` already remounts `BwbPreviewContent` per `bwbId:expression:isToekomstig` key, so each mount loads exactly one toestand.

## Goals / Non-Goals

**Goals:**
- Each file has one responsibility and fits on a screen.
- Loading state can only be in one valid shape (no "loading and error at the same time").
- Identical DOM output for the loading, error and loaded states.

**Non-Goals:**
- Fixing any of the known gaps (`fix-toc-anchors`, `unify-inline-markup`, etc.).
- Replacing MUI or Rijkshuisstijl components, or changing styling.
- Deleting `bwb-preview-modal.tsx`. It stays compiling; whether to remove it belongs to `unify-inline-markup` or a cleanup change.
- Changing the components that render the regulation (`BwbVerdrag`, `BwbRegelingTekst`, ...).

## Decisions

### Target structure

```
bwb-preview.tsx            BwbPreview (route params -> keyed content)
                           BwbPreviewContent (switch on load state, page layout)
  |
  +-- use-toestand.ts      useToestand(bwbId, expression, isToekomstig)
  |                          -> { status: "loading", progress? }
  |                           | { status: "error", error: { message, technical? } }
  |                           | { status: "loaded", wetgeving }
  |
  +-- bwb-loading-progress.tsx   BwbLoadingProgress + formatMegabytes
  +-- bwb-load-error.tsx         error Alert, technical details in DEV only
  +-- bwb-toestand-header.tsx    citeertitel H1 + "Andere versies" button
  |                              + BwbExpressionsModal (owns its open state)
  +-- bwb-wetgeving.tsx          verdragen, regelingTekst, wettekst, bijlagen
```

New files follow the existing `bwb-*` / `use-*` kebab-case naming and live flat in `src/component/toestand/`, like `use-manifest-expressions.ts`. A sub-folder would be the only one in the tree.

### One discriminated-union state in a hook
The hook returns a tagged union instead of six `useState`s plus `loading`/`error` flags. `wetgeving` is kept whole and the sidebar, header and body read the parts they need from it. Alternative: keep separate states and move them into the hook. That is rejected because it keeps the duplication and still allows impossible combinations. Alternative: a data library (TanStack Query). That is rejected because it adds a dependency for one call, and `useManifestExpressions` already sets the in-repo pattern.

### Abort on unmount
The hook creates an `AbortController`, passes `signal` to `getToestand`, aborts in the effect cleanup and ignores results after an abort. This mirrors `useManifestExpressions`. With multi-MB toestanden, switching versions should not keep downloading the old one. The `getToestand` call gains a `signal` option, so the existing test expectation changes from `{ onProgress }` to `{ onProgress, signal }`.

### Simplified error mapping
`getToestand` throws `Error` for HTTP and XML failures. The mapping becomes: an `Error` shows its message. Anything else shows the generic Dutch message, with `String(err)` as the technical detail. The `HttpError` shape handling is dropped, because nothing produces it anymore.

### Header owns the version dialog state
`expressionsOpen` moves into `bwb-toestand-header.tsx`, the only place that opens it, so opening the dialog no longer re-renders the whole content tree. The large body (`BwbWetgeving`) is wrapped in `memo`, like `BwbWettekst` and `SideBar` already are.

### Source link via the URL helper
The XML link uses `getToestandUrl(bwbId, expression, isToekomstig)`, so the page and the loader cannot drift apart.

## Risks / Trade-offs

- [Subtle DOM changes break styling] → Move the JSX across verbatim. Keep wrapper elements, ids and classes, and compare the rendered page before and after on a large regeling (e.g. `BWBR0001840`) and a BWBTT toestand.
- [The `getToestandUrl` link encodes components, while the old link did not] → BWB ids and expression labels contain only `[A-Za-z0-9_-]`, so the URL is identical in practice.
- [Test mocks of `wettenRepository` no longer provide `getToestandUrl`] → Extend the mock in `bwb-preview.test.tsx` (`vi.mock` currently only stubs `getToestand`), or use `importOriginal` to keep the real helper.
