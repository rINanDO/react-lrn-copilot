# Tasks

## 1. SRU client

- [x] 1.1 Create `src/api/sruRepository.ts` with `SRU_BASE_URL`, `BwbSearchCriteria`, `buildBwbCql(criteria, date)` and `getSruSearchUrl(cql, startRecord, maximumRecords, baseUrl?)` per design.md §1–2. Clauses come in a fixed order joined with ` and `; values are trimmed, have whitespace collapsed and are quoted; `\ " * ? ^` are escaped; blank criteria are left out; the date clauses are always present. Verify with `npm run typecheck`
- [x] 1.2 Add `parseSearchResponse(xml)` and `SruDiagnosticError` per design.md §3. It parses namespace-aware; maps `overheidbwb:toestand` → expression `<date>_<n>`, with a fallback to `locatie_toestand`; collects repeated `overheid:authority`; drops `9999-12-31` as `geldigTot`; skips records without an id or expression; throws on a `<diagnostics>` root. Also add `searchBwb(criteria, { page, date, baseUrl, signal })`, which uses `fetchXml` (`Accept: application/xml`) and `PAGE_SIZE = 50`
- [x] 1.3 Add `src/api/sruRepository.test.ts` with trimmed fixtures recorded from the live service (one success response with two records, an empty response, and the "Unsupported index" diagnostics response). Cover: the CQL for q only, filters only, q plus all filters, and escaping of quotes; the URL parameters (`x-connection=BWB`, `version=2.0`, and `startRecord` for page 3 = 101); record mapping, including the expression and multiple authorities; empty results; the diagnostic → `SruDiagnosticError`; and `searchBwb` sending `Accept: application/xml` (mocked `fetch`). Verify with `npm test`

## 2. Search state hook and filter options

- [x] 2.1 Create `src/component/search/bwb-search-options.ts` with the Regelingsoort, Eerstverantwoordelijke and Rechtsgebied value lists from the appendices of the SRU BWB manual, per design.md §5: dedupe, sort with `localeCompare("nl")`, keep lowercase values, and add a label helper that capitalises the first letter but keeps `type` casing. Verify with a small test that the lists contain no duplicates and that `AMvB` keeps its casing
- [x] 2.2 Create `src/component/search/use-bwb-search.ts` per design.md §4. It returns `idle | loading | error | loaded`, keyed on criteria plus page; it returns `idle` without fetching when there is neither `q` nor a filter; it aborts on key change and unmount; and it maps errors to the `{ message, technical }` shape used by `LoadError`. Add `use-bwb-search.test.ts` with a mocked `searchBwb`, covering idle (no call), loaded, error, and a superseded search where only the latest result is shown. Verify with `npm test`

## 3. Results page

- [x] 3.1 Create `src/component/search/bwb-search-page.tsx` and `bwb-search-page.css` per design.md §4 and §6:
  - read `q`, `soort`, `ministerie`, `rechtsgebied` and `pagina` from `useSearchParams`, treating an invalid `pagina` as 1
  - a search form (`TextInput` + `PrimaryActionButton`, with `key={q}`) and three `FormFieldSelect` filters with an "Alle …" option, plus an extra option for an unknown URL value
  - pushing the new params on submit or filter change, dropping empty values and `pagina`
  - the title-search note, the `role="status"` count line, and an `<ol start>` result list whose links go to `/bwb/<id>/<expression>`, plus `?q=` when `q` is set
  - previous/next paging links
  - the idle prompt, the loading indicator, the no-results message, "Geen resultaten op deze pagina" with a link to page 1, and errors through `LoadError`

  Verify with `npm run typecheck`
- [x] 3.2 Add `bwb-search-page.test.tsx`, rendering in a `MemoryRouter` with `searchBwb` mocked. Cover:
  - URL → search box and filters prefilled, and the right criteria and page passed
  - submitting a new search pushes `?q=…`, keeps the filters and drops `pagina`
  - changing a filter drops `pagina`; choosing "Alle" removes the param
  - a result renders its title, type, authority, id and date, and links to `/bwb/BWBR0001840/2023-02-22_0?q=grondwet`
  - no `q` in result links for a filter-only search
  - paging shows the 51–100 range, previous/next links, and no next link on the last page
  - `pagina=abc` → page 1
  - a page beyond the results shows the message and a link to page 1
  - the idle state makes no call
  - no results; error alert

  Verify with `npm test`

## 4. Routing and landing page

- [x] 4.1 Add `bwbSearch: "/bwb/zoeken"` to `src/router/routes.ts` and register `BwbSearchPage` in `src/router/index.tsx` with `handle: { title: "Zoeken – Wetten" }`. Add a router test (`createMemoryRouter` with the app's route objects, or the same paths) asserting that `/bwb/zoeken` renders the search page and `/bwb/BWBR0001840` still renders the expressions page. Verify with `npm test`
- [x] 4.2 Change `src/component/page/bwb-landing-page.tsx` to navigate to `/bwb/zoeken` with `?q=<trimmed text>`, or without `q` when blank, per design.md §8. Remove the dialog, its state and the `__modal-backdrop`/`__dialog` CSS. Rewrite `bwb-landing-page.test.tsx` with a `MemoryRouter` to assert navigation for "grondwet" and for a whitespace-only query, and that no dialog appears. Verify with `npm test`

## 5. Integration check

- [x] 5.1 Run `npm run ci` (typecheck, lint, test, build) and verify it passes
- [x] 5.2 Run `npm run dev` and check against the live service:
  - from `/bwb`, searching "grondwet" lands on `/bwb/zoeken?q=grondwet` with the Grondwet listed once, and following it opens `/bwb/BWBR0001840/<expression>?q=grondwet` with highlighting
  - `soort=AMvB` combined with `q=wet` gives only AMvB results
  - `ministerie=justitie en veiligheid` + `rechtsgebied=strafrecht` without `q` gives results
  - paging forward and back, and the browser back button, restore earlier searches
  - a search with no hits shows the no-results message
  - blocking `zoekservice.overheid.nl` in DevTools shows the error alert
  - the layout works at 360 px width

## Workflow follow-up

- After review, archive this change so `bwb-search` becomes a main spec under `openspec/specs/`.
