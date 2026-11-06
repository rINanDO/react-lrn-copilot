# Tasks

## 1. Table component

- [x] 1.1 Create `src/component/wti/wti-regeling-label-view.tsx` with `WtiRegelingLabelView` per design.md §5: takes a `wijzigingenRegelingelement`, renders a "Datum" table in document order, skips entries without `waarde`, and shows the "no dates known" message when none remain
- [x] 1.2 Add `wti-regeling-label-view.test.tsx` covering: rows in document order, the same date twice gives two rows, an entry without `waarde` gives no row, and no dates gives the message and no table; verify with `npm test`
- [x] 1.3 Extend `WtiRegelingLabelView` to the columns of the wetten.overheid.nl "Wijzigingenoverzicht" per design.md §5: one row per `details`, formatted dates, publications and dossier links, "samen met" between sources, and numbered opmerkingen below the table
- [x] 1.4 Update `wti-regeling-label-view.test.tsx` for the headers, every property of a row, "samen met", a pending row without a date, a publication without a URL, opmerkingen and several `details`; verify with `npm test`
- [x] 1.5 Compare the rendered table with the reference pages for `BWBR0026965` label `10324604` and `BWBR0001840` label `2940724` using the real `.wti` files: headers, rows and opmerkingen must match by text

## 2. Loading hook

- [x] 2.1 Create `src/component/wti/use-wet-technische-informatie.ts` with `useWetTechnischeInformatie(bwbId)` per design.md §2, passing `onProgress` and `signal` to `getWetTechnischeInformatie`, and reusing `toLoadError`
- [x] 2.2 Add `use-wet-technische-informatie.test.ts` covering: loading with progress, loaded document, an `Error` becomes its message, abort on unmount, one request while `bwbId` is unchanged, and a new `bwbId` reads as loading straight away; verify with `npm test`

## 3. Page

- [x] 3.1 Create `src/component/wti/wti-page.tsx` with `WtiView` and default export `WtiPage` per design.md §1 and §3: `LoadingProgress` while loading, `LoadError` on failure, otherwise the heading plus `WtiRegelingLabelView` for the item matching `labelId`, or the "no information found" message
- [x] 3.2 Add `wti-page.test.tsx` with `getWetTechnischeInformatie` mocked, covering: progress bar while loading, error alert on failure, only the matching item's dates shown, the message when no item matches or `regelingelementen` is absent, all dates shown whatever the expression, and a label id change showing the new item's dates without a new request; verify with `npm test`
- [x] 3.3 Add a link named `<bwbId>.wti` to `getWetTechnischeInformatieUrl(bwbId)` above the heading in `WtiView`, with tests for its URL and position, for showing it when no item matches, and for hiding it while loading and after a failure; verify with `npm test`

## 4. Route

- [x] 4.1 Add `wti: "/bwb/:bwbid/:expression/:labelid"` to `src/router/routes.ts` and register `WtiPage` in `src/router/index.tsx` with the title "Wetstechnische informatie – Wetten"; extend `src/router/router.test.tsx` so `/bwb/BWBR0001840/2023-02-22_0/2940504` renders the new page and the existing `/bwb/...` cases still pass; verify with `npm test`

## 5. Version links and current marking

- [x] 5.1 Add an optional `isToekomstig` parameter to `getManifestUrl` and `getManifest`, with a URL test; verify with `npm test`
- [x] 5.2 Create `src/component/wti/use-wti-versies.ts` per design.md §6, with `use-wti-versies.test.ts` covering current and future routes, the last correction on a date, a failing manifest and abort on unmount; verify with `npm test`
- [x] 5.3 Mark the current rows and link the other dates in `WtiRegelingLabelView`, passing `expression` and the versions from `WtiView`, with tests for the marking rules, the links, and plain dates when the manifests fail; verify with `npm test`
- [x] 5.4 Compare marking and links with the reference pages for `BWBR0026965` label `10324604` at `2026-01-01_0` and `BWBR0001840` label `2940724` at `2023-02-22_0`, using the real files

## 6. Integration check

- [x] 6.1 Run `npm run ci` (typecheck, lint, test, build) and verify it passes
- [x] 6.2 Run `npm run dev` and open `/bwb/BWBR0026965/2026-01-01_0/10324604`: the progress bar shows during loading, the `BWBR0026965.wti` link is above the heading, and the table looks like the one at https://wetten.overheid.nl/BWBR0026965/2026-01-01/0/Paragraaf1/Artikel1/informatie, including the marked `18-01-2014` row and its footnote links in both directions. Check that `01-01-2013` opens that version and `01-01-2027` opens the future version. Also check that a label id that does not exist shows the message, a non-existent BWB id shows the error alert, and `/bwb/BWBR0026965/2026-01-01_0` still shows the toestand

## Workflow follow-up

- After review, archive this change so `wetstechnische-informatie` becomes a main spec under `openspec/specs/`.
