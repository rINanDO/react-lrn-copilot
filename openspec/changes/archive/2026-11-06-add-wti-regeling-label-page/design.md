# Design

## Context

`getWetTechnischeInformatie(bwbId, options)` in `src/api/bwbRepository.ts` fetches and parses `<bwbId>.wti` and reports progress through `FetchOptions.onProgress`. The result type has the path `wijzigingen.regelingelementen.regelingelement[]`, where each item has `labelId` and `datum[]`, and each `datum` has an optional `waarde`.

The Grondwet's `.wti` file (fetched for this design) shows what the page must handle:

- It is 4.4 MB and has 205 items with 205 unique `label-id` values, so label ids are unique there and the first match is enough.
- Dates are listed newest first.
- The same `waarde` can occur twice in one item, with different `versie-id` values.
- 29 of the 2649 `datum` entries have no `waarde`.
- `label-id` values are long numbers, kept as strings by the parser.

`useWetgeving` (`src/component/document/use-wetgeving.ts`) has the loading pattern needed here, but its state and its `load` callback are typed to `Wetgeving`. `LoadingProgress` and `LoadError` are reusable as they are.

React Router ranks routes by specificity, and the new route has one more segment than `/bwb/:bwbid/:expression`, so the two cannot match the same URL.

## Goals / Non-Goals

**Goals:**
- Fetch once per regeling, so changing the label id does not download 4.4 MB again.
- Follow the existing loading, error and table conventions.

**Non-Goals:**
- Making `useWetgeving` generic, or moving the search hooks onto a shared loader.
- Sorting: the order of the source is kept, which is also what wetten.overheid.nl shows.

## Decisions

### 1. Folder and components
New folder `src/component/wti/`, parallel to `bwb/` and `cvdr/`:
- `wti-page.tsx`: the default export `WtiPage` reads the route parameters and renders the named `WtiView` (props `bwbId`, `labelId`), which can be tested without a router, like `ToestandView`.
- `wti-regeling-label-view.tsx`: `WtiRegelingLabelView`, which takes the `wijzigingenRegelingelement` as a prop and only renders it. It knows nothing about loading or the route.
- `use-wet-technische-informatie.ts`: the loading hook.

### 2. A dedicated loading hook
`useWetTechnischeInformatie(bwbId)` follows the structure of `useWetgeving`: state tagged with the key, an `AbortController` per load, and `toLoadError` for failures. It returns `loading` (with `progress`), `error` or `loaded` (with the document).

The alternative is to make `useWetgeving` generic. That is about the same amount of code but changes a hook that BWB and CVDR depend on, for a page with one caller; it can be done later if a third document type appears.

The hook is keyed on `bwbId` only. The page does not put `labelId` in a React `key`, which gives the "Changing the label id" requirement: selection happens during render, with no reload.

### 3. Selecting the item during render
`WtiView` selects with `regelingelement?.find((item) => item.labelId === labelId)`. This is a linear scan on each render over a few hundred items, cheap enough not to memoize. The comparison is on strings, without converting to numbers. React Router has already decoded the URL parameter.

### 4. Reuse `LoadingProgress` as it is
Its text reads "Regeling laden…" and "Regeling verwerken…". That is not strictly accurate for this document, but it is understandable, and adding a label prop for a wording difference is not worth it. The spec therefore does not fix the message text.

### 5. Table markup and messages
The table follows the "Wijzigingenoverzicht" on wetten.overheid.nl, using `table--condensed` inside `table__container`, classes that `generic.css` already has. It was derived from two reference pages: `BWBR0026965` label `10324604` (a Staatscourant regeling) and `BWBR0001840` label `2940724` (a law with a pending change).

- **Rows:** one per `details`, because a `datum` can have several. A `datum` without a `waarde` is kept when it has `details`: these are the "Aanhangig" rows the reference shows. Rows use the array index as key, because `waarde` is not unique and those rows have no `versie-id`.
- **Kenmerk column:** the reference calls it "Kenmerk" on the Staatscourant regeling and "Kamerstukken" on the law. The rule used is inferred from those pages: "Kenmerk" when any row has a kenmerk. A dossier number takes precedence in a cell and links to `/dossier/<nummer>`.
- **Opmerkingen:** `al` content is raw inner XML, so it renders through the existing `AlView`.

"No information found" and "no changes known" use an MUI `Alert` with `severity="info"`, since neither is a failure:
- "Er is geen wetstechnische informatie gevonden voor dit regelingelement."
- "Er zijn geen wijzigingen bekend voor dit regelingelement."

The link to the source document is a plain `<a>` above the heading, like the XML link on the toestand page, with its URL from `getWetTechnischeInformatieUrl`. As on that page, it appears only once the document has loaded.

The main heading uses `Heading level={1}`, and the route handle's title is "Wetstechnische informatie – Wetten".

### 6. Which dates link, and which row is current
Derived from the same two reference pages, plus their manifests:

- **Current:** the latest date on or before the date of the expression (`2018-12-21` for Grondwet version `2023-02-22`). It is computed with a maximum, not the first match, so it does not depend on the source order. When the date occurs twice, both rows are marked: the reference has no case to copy, and both changes took effect on that date.
- **Links:** a date links when a version starts on it. The reference does not link `18-06-1987` because the Grondwet's manifest starts in 2002, which rules out "all dates except the current one". Future versions are only in the BWBTT manifest, as with `01-01-2027` on the reference page.
- **Several versions on one date:** the highest sequence number is used, since `parseManifest` sorts oldest first.

`useWtiVersies` loads both manifests with `Promise.allSettled`, separately from the document, so a missing manifest cannot break the page. Most regelingen have no BWBTT manifest. `useManifestExpressions` is not reused because it loads one manifest and reports errors the page does not want.

`getManifest` takes `isToekomstig` as a new last parameter rather than matching the order of `getToestand`, to leave its existing callers untouched.

## Risks / Trade-offs

- [The page is only reachable by typing the URL, as nothing links to it yet] → Accepted: links are a follow-up. The page can be used and tested on its own.
- [Each visit downloads the full `.wti` file (4.4 MB for the Grondwet)] → The progress bar covers the wait. Caching across pages is left out until it proves necessary.
- [Very old dossiers link differently on the reference: `11303` goes to a search URL there, and to `/dossier/11303` here] → The text is the same. Fix the link if such dossier pages turn out not to resolve.
- [A date link opens the version at the top, where the reference goes to the element itself] → Accepted for now: this needs the toestand page to find an element by `label-id`.
- [Each page view makes two extra manifest requests, one of which usually fails] → Both are small, and the failure is handled silently. The browser console may still log it.
- [The "Kenmerk" or "Kamerstukken" rule comes from two pages] → It is one line to change if another regeling shows otherwise.
