# Proposal

## Why

For BWB we already provide a dedicated search page and searchable results, but CVDR content still needs direct IDs to open a document. Users should be able to search local regulations in the same way, using a URL-driven experience comparable to overheid.nl/lokaleregelgeving.

## What Changes

- Add a CVDR search results route driven by query-string parameters.
- Add a CVDR search client in the SRU repository for the CVDR connection.
- Add a CVDR search page and state hook that mirror the BWB search flow (idle/loading/error/results/paging).
- Add routing updates and tests for the new CVDR search path and result links.

## Capabilities

### New Capabilities
- `cvdr-search`: Search CVDR regulations through SRU, browse paged results, and open a CVDR expression from each result.

### Modified Capabilities
- `bwb-search`: Reuse shared SRU utilities for multiple connections without changing BWB behavior.

## Impact

- Affected code: `src/api/sruRepository.ts`, new CVDR search UI/hook files under `src/component/search`, `src/router/routes.ts`, `src/router/index.tsx`, router and search tests.
- No new npm dependencies.
- External dependency remains the SRU endpoint at `https://zoekservice.overheid.nl/sru/Search`.
