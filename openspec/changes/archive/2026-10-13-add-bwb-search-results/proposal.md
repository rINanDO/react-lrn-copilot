# Proposal

## Why

The `/bwb` landing page has a search box, but submitting it only opens a "Work in progress" dialog. Users have no way to find a regeling unless they already know its BWB identifier. The official SRU search service for the basiswettenbestand (`https://zoekservice.overheid.nl/sru/Search`, `x-connection=BWB`) can answer these searches directly from the browser, so the app can now offer a real results page.

## What Changes

- New page at `/bwb/zoeken` that lists the regelingen matching a search. The search terms and filters live in the query string (`q`, `soort`, `ministerie`, `rechtsgebied`, `pagina`), so a results page can be bookmarked, shared and reached with the browser's back button.
- The search uses the SRU API. `q` searches the regeling titles (citeertitel, officiële titel and niet-officiële titel). The SRU service has no full-text index, so the page searches titles only and says so.
- Results show only the toestand that is in force and visible today, so each regeling appears once.
- Optional filters, which narrow the results and can be combined with each other and with `q`: regelingsoort (e.g. wet, AMvB), eerstverantwoordelijke (ministry or other authority), and rechtsgebied. The choices come from the value lists in the SRU BWB manual.
- Each result shows the title, regelingsoort, eerstverantwoordelijke, BWB identifier and the date the toestand came into force. It links to the existing toestand page `/bwb/<bwbId>/<expression>` and passes `q` along, so the existing text highlighting marks the search terms.
- Results come in pages of 50, with the total number of results shown and links to the previous and next page.
- Loading, "no results", service errors and an empty search each get their own message.
- The landing page's search form navigates to `/bwb/zoeken?q=…` instead of opening the "Work in progress" dialog. The dialog is removed.

## Capabilities

### New Capabilities
- `bwb-search`: searching the basiswettenbestand through the SRU API. This covers the search form on the `/bwb` landing page, the `/bwb/zoeken` results page, its query-string contract, the filters, paging, and how results link to toestanden.

### Modified Capabilities
<!-- None. The landing page has no spec yet; its search behaviour is specified in bwb-search. The toestand-viewer and text-highlighting requirements are unchanged; result links reuse the existing `q` highlighting as is. -->

## Impact

- New SRU client in `src/api/` (`sruRepository.ts`): it builds the CQL query and URL and parses the `searchRetrieveResponse` and SRU diagnostics XML. It has unit tests based on recorded responses.
- New page component and hook under `src/component/` for the results page, with tests.
- `src/router/routes.ts` and `src/router/index.tsx`: new `bwbSearch` route `/bwb/zoeken`. It is declared alongside `/bwb/:bwbid`, and React Router ranks the static segment higher.
- `src/component/page/bwb-landing-page.tsx` (and its test and CSS): the form navigates to the results page, and the dialog is removed.
- External dependency: `zoekservice.overheid.nl`. It sends `Access-Control-Allow-Origin: *`, so no proxy is needed. It answers `406` unless the request sends `Accept: application/xml`.
- No new npm dependencies.
