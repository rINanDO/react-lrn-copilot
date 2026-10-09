# Proposal

## Why

`bwb-preview.tsx` handles everything on the toestand page in one component: route parameters, fetching, six separate pieces of state copied from a single response, error parsing for an HTTP client that is no longer used, the loading indicator, the page layout, the title bar with the version dialog, and the regulation body. That makes it hard to read, test and change. Each follow-up change on this page (for example `fix-toc-anchors`) would have to work around it.

## What Changes

- Move toestand loading into a dedicated hook that keeps the response in one state value instead of six, and cancels the request when the page switches to another toestand.
- Remove the dead error-parsing branch for HTTP-client error shapes (`response`, `error.response`, `_data`). `getToestand` only throws plain `Error`s.
- Split the rendering into small components: loading progress, load error, title bar with the "Andere versies" dialog, and the regulation body.
- Build the source-XML link with the existing repository URL helper instead of a second hard-coded copy of the URL.
- Keep `BwbPreviewContent` and the default `BwbPreview` export, so the router, the preview modal and the tests keep working.
- No user-visible behavior changes: markup, CSS classes, texts and routes stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a structural refactor. The behavior described by `toestand-viewer` (added as a baseline in `add-baseline-specs`) stays the same, so this change declares `skip_specs: true`.

## Impact

- Code: `src/component/toestand/bwb-preview.tsx` becomes a thin composition. New files are added next to it in `src/component/toestand/`.
- Tests: `bwb-preview.test.tsx` keeps its scenarios. Its expectation on the `getToestand` options is updated for the added abort signal. The extracted pieces get their own focused tests.
- No API, dependency, route or styling changes.
