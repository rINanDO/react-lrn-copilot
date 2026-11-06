# Proposal

## Why

The app can fetch and parse a regeling's wetstechnische informatie (`getWetTechnischeInformatie`), but no page shows it yet. Users have no way to see how a single regelingelement, such as an article, changed.

## What Changes

- Add a route `/bwb/:bwbid/:expression/:labelid` with a "Wetstechnische informatie" page.
- The page fetches the wetstechnische informatie of `:bwbid` and shows a progress bar while it loads.
- The page finds the item in `wijzigingen.regelingelementen.regelingelement` whose `label-id` equals `:labelid`.
- A new component, `WtiRegelingLabelView`, renders the changes of that item in a table with the same columns as the "Wijzigingenoverzicht" on wetten.overheid.nl, with its opmerkingen listed below.
- The page links to the source `.wti` document above its heading, once loaded.
- The page shows an error when loading fails, and a message when no item has that `label-id`.
- `:expression` does not filter the content: the table lists every change, and the change in force at that version is marked.
- Dates link to the version of the regeling that starts on them, when one exists, including future versions.

Out of scope:

- Links to this page from the toestand page or anywhere else; for now it is reached by its URL.
- The rest of the wetten.overheid.nl page: tabs and the other sections.
- Scrolling to the regelingelement after following a date link: the link opens the version at the top.
- Rectificaties of a publication, which do not occur in the regelingen checked.
- A BWBTT variant of the route (`/bwbtt/...`).

## Capabilities

### New Capabilities
- `wetstechnische-informatie`: the page that shows the wetstechnische informatie of one regelingelement, including its route, loading and failure states, and the table of changes.

### Modified Capabilities
<!-- None: the new route has three segments after /bwb, so the requirements for the existing routes do not change. -->

## Impact

- `src/router/routes.ts`, `src/router/index.tsx` and `src/router/router.test.tsx`: the new route.
- New folder `src/component/wti/`: the page, `WtiRegelingLabelView`, a loading hook and their tests.
- `src/api/bwbRepository.ts`: `getManifestUrl` and `getManifest` get an optional `isToekomstig` parameter, for the manifest of future versions. Existing callers are unaffected.
- Reuses the existing `getWetTechnischeInformatie`, `LoadingProgress`, `LoadError` and `toLoadError`. No new dependencies.
