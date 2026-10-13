# Design

## Context

See proposal.md for motivation and specs for behavior. The project already has a BWB search implementation composed of SRU query/parsing logic (`src/api/sruRepository.ts`), a route-level page, and a hook that keeps URL parameters as source of truth.

## Goals / Non-Goals

**Goals:**
- Reuse the existing SRU infrastructure for a CVDR search connection.
- Keep CVDR search state URL-driven (`q`, `pagina`) with browser back/forward support.
- Keep UI behavior aligned with BWB search (idle/loading/error/results/paging).

**Non-Goals:**
- Adding CVDR-specific metadata filters in this first version.
- Changing CVDR document rendering behavior.
- Reworking BWB search UX beyond shared SRU utility extraction.

## Decisions

### 1. Generalize SRU URL construction and add CVDR search parsing
Add a connection-aware SRU URL builder that preserves BWB behavior and supports `CVDR`. Implement `searchCvdr` and parser types beside existing BWB functions to keep SRU concerns centralized.

Alternative: create a separate `cvdrSruRepository.ts`. Rejected to avoid duplicated diagnostics handling and pagination mechanics.

### 2. Build a dedicated CVDR search page and hook
Create `cvdr-search-page.tsx` and `use-cvdr-search.ts` following the BWB pattern: parse query params, skip empty searches, abort superseded requests, and render all state variants.

Alternative: make one generic search page for BWB and CVDR. Rejected for now to keep scope small and avoid cross-feature refactoring.

### 3. Use minimal CVDR result metadata
Render title and CVDR id/expression link; include optional authority/type/date metadata only when available from SRU records.

Alternative: enforce rich metadata fields. Rejected because CVDR SRU records may vary; this would reduce resilience.

### 4. Route at `/cvdr/zoeken`
Add `cvdrSearch` route and register it as a static path so it wins over `/cvdr/:cvdr/:expression`.

Alternative: host search directly on `/cvdr`. Rejected to stay parallel with `/bwb/zoeken` and avoid changing existing dynamic-document route semantics.

## Risks / Trade-offs

- [CVDR SRU fields differ from assumed mapping] → Parse defensively and skip malformed records instead of generating broken links.
- [Service downtime or diagnostics] → Reuse existing error mapping and alert component.
- [No filters in v1] → Keep implementation modular so filters can be added later without route redesign.

## Migration Plan

This is additive and backward compatible. Rollback is a revert of the change; no data migration is required.
