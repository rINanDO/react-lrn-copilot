# Tasks

## 1. Loading hook

- [x] 1.1 Create `src/component/toestand/use-toestand.ts` with `useToestand(bwbId, expression, isToekomstig)` returning the `loading` / `error` / `loaded` union from design.md. Pass `onProgress` and an `AbortController` signal to `getToestand`, abort on cleanup, and ignore results after an abort
- [x] 1.2 Implement the simplified error mapping in the hook (an `Error` shows its message; anything else shows the generic message with `String(err)` as technical detail) and drop the `HttpError` branch
- [x] 1.3 Add `use-toestand.test.ts` covering: loading with progress, a loaded result with `wetgeving`, `Error` → message, and abort on unmount (no state update after unmount); verify with `npm test`

## 2. Presentational components

- [x] 2.1 Move `BwbLoadingProgress` and `formatMegabytes` unchanged into `bwb-loading-progress.tsx`, and add a test for the determinate ("6,2 van 14,1 MB"), indeterminate and "Regeling verwerken…" labels; verify with `npm test`
- [x] 2.2 Create `bwb-load-error.tsx` with the error `Alert` and the technical details only in development builds (markup identical to today); verify it renders `role="alert"` in a test
- [x] 2.3 Create `bwb-toestand-header.tsx` with the citeertitel H1, the "Andere versies" button (hidden for toekomstig), and `BwbExpressionsModal` with its own open state. Add a test that the button is absent for a toekomstig toestand and opens the dialog otherwise; verify with `npm test`
- [x] 2.4 Create memoized `bwb-wetgeving.tsx` rendering verdragen, regelingTekst, wettekst and bijlagen inside `<div className="wetgeving">` in the current order; verify it type-checks with `npm run typecheck`

## 3. Compose the page

- [x] 3.1 Rewrite `BwbPreviewContent` in `bwb-preview.tsx` to switch on `useToestand` status and compose the new components, keeping the wrappers, ids and classes (`.preview`, `.container.columns.columns--sticky-sidebar.row`, `#content`, `#regeling`), the `BwbToestandContext` provider, `SideBar` and `Footer`; keep the `BwbPreviewContent` named export and the `BwbPreview` default export unchanged
- [x] 3.2 Build the source-XML link with `getToestandUrl` and remove the unused imports and the commented-out `getApiBeheerToestand` import; verify with `npm run lint`
- [x] 3.3 Update `bwb-preview.test.tsx`: expect `{ onProgress, signal }` in the `getToestand` call and provide `getToestandUrl` in the module mock (via `importOriginal`). All four existing scenarios must pass with `npm test`

## 4. Integration check

- [x] 4.1 Run `npm run ci` (typecheck, lint, test, build) and verify it passes
- [x] 4.2 Run `npm run dev` and compare before/after on `/bwb/BWBR0001840` (redirected version), a large regeling, and a `/bwbtt/...` toestand: same progress text, title, "Andere versies" dialog, sidebar, body and footer, and an error alert for a non-existent expression

## Workflow follow-up

- Archive `add-baseline-specs` first, so `toestand-viewer` exists as the spec this refactor preserves.
- Archive this change after review; it has no delta specs to sync.
