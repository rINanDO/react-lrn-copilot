# Design

## Context

See proposal.md for the motivation and specs/bwb-search/spec.md for the behaviour.

**Current code.**
- `src/router/routes.ts` declares `bwbLanding: "/bwb"` and `bwbExpressions: "/bwb/:bwbid"`. `src/router/index.tsx` wires them up with `createBrowserRouter`.
- The landing page (`src/component/page/bwb-landing-page.tsx`) builds its form from Rijkshuisstijl components (`TextInput`, `PrimaryActionButton`, `Heading`) and styles it with BEM classes in `bwb-landing-page.css`. On submit it opens a "Work in progress" dialog.
- Data access lives in `src/api/`. `repository.ts` holds the shared fetch and XML helpers, and the per-source modules are `bwbRepository.ts` and `cvdrRepository.ts`. Each source module builds its URLs with pure `get…Url` functions, parses with pure `parse…` functions (tested with inline XML strings), and fetches with a thin `get…` function that takes `{ baseUrl, signal }`.
- `useWetgeving` (`src/component/document/use-wetgeving.ts`) shows how the app loads data: it keys state by a string, aborts on key change, and exposes a `loading | error | loaded` union. `LoadError` shows `technical` details only when `import.meta.env.DEV` is true.

**SRU service, checked against the live service on 2026-10-13.**
- `GET https://zoekservice.overheid.nl/sru/Search?operation=searchRetrieve&version=2.0&x-connection=BWB&query=…&startRecord=…&maximumRecords=…`
- It sends `Access-Control-Allow-Origin: *`. It answers **406** to `Accept: */*`, which is what `fetch` sends by default, and **200** to `Accept: application/xml`. `Accept` is a CORS-safelisted header, so the request triggers no preflight.
- A success response is `<searchRetrieveResponse xmlns="http://docs.oasis-open.org/ns/search-ws/sruResponse">` with `numberOfRecords`, `records/record/recordData/gzd/…`, `recordPosition` and an optional `nextRecordPosition`.
- A failure is still **HTTP 200**, with a root `<diagnostics>` element that holds `<diagnostic><uri/><details/><message/></diagnostic>`. Examples: a bare term gives "Unsupported index" (`cql.serverChoice`), and `sortby` gives "Unsupported sort index". There is no full-text index and no server-side sort.
- Fields used:

  | Use | CQL index |
  |---|---|
  | title search | `overheidbwb.titel` with `all` |
  | regelingsoort | `dcterms.type==` |
  | eerstverantwoordelijke | `overheid.authority==` |
  | rechtsgebied | `overheidbwb.rechtsgebied==` |
  | current toestand | `overheidbwb.geldigheidsdatum==` and `overheidbwb.zichtdatum==` |

  All of these combine with `and`, and value matching ignores case.
- Each record carries the following:
  - `dcterms:identifier`: the BWB id
  - `dcterms:title`
  - `dcterms:type`
  - `overheid:authority`: may repeat
  - `overheidbwb:toestand`: e.g. `http://wetten.overheid.nl/id/BWBR0001840/2023-02-22/0`
  - `overheidbwb:geldigheidsperiode_startdatum` and `…_einddatum` (`9999-12-31` means open-ended)
  - `overheidbwb:locatie_toestand`: e.g. `…/bwb/BWBR0001840/2023-02-22_0/xml/…`
  - Without the date clauses, every historic toestand comes back. With them, each regeling appears once (Grondwet: 63 hits → 10).

## Goals / Non-Goals

**Goals:**
- Keep URL building, CQL building and response parsing pure and unit-testable without the network, as `bwbRepository.ts` does.
- Treat the URL as the only source of truth for the search, so back/forward, reload and sharing work without extra state.
- Cancel superseded requests.

**Non-Goals:**
- Full-text search in regeling content: the service does not offer it.
- Sorting other than the service's own order: `sortby` is unsupported.
- A "geldig op" date picker, or showing historic toestanden. Today's date is fixed for this version.
- Facet counts on the filters: the service returns none.
- Searching CVDR, or Explain-driven discovery of the filter value lists.
- Result caching beyond what the browser does.

## Decisions

### 1. SRU client `src/api/sruRepository.ts`, following the BWB repository pattern
Exports:
- `SRU_BASE_URL`
- `type BwbSearchCriteria = { q?: string; soort?: string; ministerie?: string; rechtsgebied?: string }`
- `buildBwbCql(criteria, date: string): string`
- `getSruSearchUrl(cql, startRecord, maximumRecords, baseUrl?)`
- `parseSearchResponse(xml): BwbSearchResult`
- `searchBwb(criteria, { page, date, baseUrl?, signal? }): Promise<BwbSearchResult>`

`BwbSearchResult` is `{ total: number; records: BwbSearchRecord[] }`, and each `BwbSearchRecord` holds `{ bwbId, title, type, authorities: string[], expression, geldigVanaf, geldigTot? }`.

The fetch sends `Accept: application/xml` and uses `fetchXml` from `repository.ts` without `onProgress`, so it shares error handling for non-2xx answers. A small new module beats bending `getToestand` to fit, and it keeps the SRU specifics (diagnostics, namespaces) in one place.

### 2. CQL construction and escaping
`buildBwbCql` joins the following clauses with ` and `, in this order:
1. `overheidbwb.titel all "<q>"`, when `q` is not blank
2. `dcterms.type=="<soort>"`
3. `overheid.authority=="<ministerie>"`
4. `overheidbwb.rechtsgebied=="<rechtsgebied>"`
5. `overheidbwb.geldigheidsdatum==<date> and overheidbwb.zichtdatum==<date>`

Each value is trimmed, its runs of whitespace are collapsed, and it is put inside double quotes. Inside the quotes, `\`, `"`, `*`, `?` and `^` are backslash-escaped. These are CQL's quote, escape, masking and anchoring characters, so the spec's "treated as literal text" holds.

`all` is used rather than `=`/`adj`, which would require the phrase in order. It forgives word order ("bescherming persoonsgegevens wet"), which suits a single search box.
- *Alternative: send the raw text as CQL.* Rejected: a bare word gives "Unsupported index", and users would need CQL syntax.

The date is the browser's local date (`YYYY-MM-DD`), computed once per search and passed in, so tests can fix it.

### 3. Parsing with namespace-aware DOM lookups
`parseSearchResponse` uses `DOMParser`, like `parseManifest`.
- If the root's local name is `diagnostics`, it throws an `SruDiagnosticError`. Its message is a Dutch user message, and its `technical` field holds `uri`, `details` and `message`.
- Otherwise it reads `numberOfRecords` and, for each `record`, uses `getElementsByTagNameNS` with the dcterms, overheid and overheidbwb namespace URIs, so it does not depend on the prefixes.
- The expression comes from `overheidbwb:toestand`: the last two path segments `<date>/<n>` become `<date>_<n>`. If that pattern does not match, it falls back to the path segment after the BWB id in `locatie_toestand`.
- A record without a BWB id or expression is skipped, so a malformed record cannot produce a broken link.
- `geldigTot` is left out when it is `9999-12-31`.

### 4. URL as state: `useSearchParams` → criteria → `useBwbSearch`
- `src/component/search/bwb-search-page.tsx` is the route element. It reads `q`, `soort`, `ministerie`, `rechtsgebied` and `pagina` with `useSearchParams`. `pagina` is parsed with `Number.parseInt`, and any value that is not an integer ≥ 1 becomes 1.
- Submitting the search box and changing a filter both call `setSearchParams` (push, not replace, so the back button works). Empty values are deleted, `pagina` is deleted, and the other filters are kept.
- Paging links are plain `<Link to="?…">` elements that carry the current parameters with the new `pagina`.
- `src/component/search/use-bwb-search.ts` mirrors `useWetgeving`. Its state is keyed by a string built from the criteria and page, it aborts on key change, and its states are `idle | loading | error | loaded`. The `idle` state covers "no q and no filter", which sends no request.
  - *Alternative: reuse `useWetgeving`.* Rejected: its types are tied to `Wetgeving` and progress reporting. A generic extraction is possible later, but it is not needed for one more caller.
- The search box keeps local state seeded from `q`. It re-seeds when `q` changes through navigation, by putting `key={q}` on the form, so the box follows back/forward.

### 5. Filter value lists in `src/component/search/bwb-search-options.ts`
These are static arrays copied from the appendices of the SRU BWB manual: Regelingsoort (19 values), Eerstverantwoordelijke (about 120) and Rechtsgebied (about 130).
- Exact duplicates in the manual, such as "militair recht" and "octrooirecht", are removed.
- The lists are sorted with `localeCompare("nl")`.
- The option `value` is the manual's lowercase string, which is also the URL value.
- The label capitalises only the first letter. `type` values keep their own casing: `AMvB`, `KB`, `rijksAMvB`, `wet-BES`.

Filters render as `FormFieldSelect` from `@rijkshuisstijl-community/components-react/no-side-effects`, with a first option "Alle …" whose value is `""`. A URL value that is not in the list is still sent to the service and is shown as an extra selected option, so a shared URL is never silently changed.
- *Alternative: fetch the values via SRU Explain.* Rejected: Explain lists indexes, not their values.

### 6. Results rendering
- The page reuses the landing page's look: the `rhc-theme` wrapper, the shell width and the card style. It has its own `bwb-search-page.css` with BEM classes `bwb-search-page__…`.
- A note under the search box reads "Er wordt gezocht in de titels van regelingen die vandaag geldig zijn."
- The count line reads "`<total>` resultaten" and adds "(`<from>`–`<to>`)" when there is more than one page. It has `role="status"`, so screen readers announce the new count after a search.
- Results form an `<ol start={from}>` list. Each item has:
  - a `Link` to `appRoutes.bwb` filled in, plus `?q=` when `q` is set
  - a line with type · authority (joined with ", ") · BWB id · "geldig vanaf `<d-m-yyyy>`" (`nl-NL` date)
- Loading uses MUI `LinearProgress` with a `role="status"` label "Zoeken…", matching `LoadingProgress`.
- Errors render through the existing `LoadError` component. Its `WetgevingLoadError` shape (`message`, `technical`) already fits, so the `SruDiagnosticError` and HTTP errors map to it.
- Page size is a constant `PAGE_SIZE = 50`, the service default. `startRecord = (pagina - 1) * 50 + 1`.
- When `records` is empty but `total > 0`, the requested page lies beyond the results. The page then shows "Geen resultaten op deze pagina" with a link to page 1.

### 7. Routing
- `appRoutes.bwbSearch = "/bwb/zoeken"` is added and registered in `router/index.tsx` with `handle: { title: "Zoeken – Wetten" }`.
- React Router v7 ranks static segments above dynamic ones, so `/bwb/zoeken` wins over `/bwb/:bwbid` whatever the declaration order. A router test asserts this.
- `web.config` needs no change: its rewrite already serves `index.html` for every non-file path.

### 8. Landing page
- `handleSubmit` calls `useNavigate()` with `{ pathname: appRoutes.bwbSearch, search: q ? "?" + new URLSearchParams({ q }) : "" }`.
- The dialog markup, its `isOpen` state and the `__modal-backdrop`/`__dialog` CSS are removed.
- The landing page test now needs a router wrapper (`MemoryRouter` with a `/bwb/zoeken` route that renders a marker). It asserts the navigation instead of the dialog.

## Risks / Trade-offs

- [The service changes behaviour or goes down] → Errors render through `LoadError`. The parser is tolerant: it skips incomplete records and ignores unknown elements. Recorded fixtures in the tests document the response shape we rely on.
- [The `406` on `Accept: */*`] → The fetch always sends `Accept: application/xml`, and a unit test asserts the header.
- [Title-only search disappoints users who expect full text] → The page says so explicitly under the search box.
- [`all` matches word parts; for example "wet" also matches "Wijzigingswet"] → That is the service's tokenisation, and it is acceptable for a title search. Result links pass `q`, so the toestand page highlights where the phrase occurs.
- [Static value lists go stale, for example when a ministry is renamed] → They come from the manual, and an unknown URL value still works (Decision 5). Updating them is a data-only edit.
- [Local date versus Dutch date around midnight] → It is at most one day off for users outside the Europe/Amsterdam timezone, which is acceptable for "in force today".
- [Rate limits or slow responses on rapid filter changes] → Superseded requests are aborted, and each filter change makes one request.

## Migration Plan

This is additive, apart from removing the landing page's placeholder dialog. Rollback is a revert of the change; there is no data or config migration.
