# Tasks

## 1. SRU API support for CVDR search

- [x] 1.1 Extend `src/api/sruRepository.ts` with connection-aware URL construction and `searchCvdr`/CVDR parsing types, then verify with `npm run typecheck`
- [x] 1.2 Add/extend `src/api/sruRepository.test.ts` to cover CVDR URL parameters, parsing, and diagnostics handling, then verify with `npm run test -- src/api/sruRepository.test.ts`

## 2. CVDR search state and page

- [x] 2.1 Create `src/component/search/use-cvdr-search.ts` with idle/loading/error/loaded states and abort behavior, then verify with `npm run test -- src/component/search/use-cvdr-search.test.ts`
- [x] 2.2 Create `src/component/search/cvdr-search-page.tsx` (and CSS if needed) with URL-driven search, paging, result links, and status/error rendering, then verify with `npm run test -- src/component/search/cvdr-search-page.test.tsx`

## 3. Routing and integration checks

- [x] 3.1 Add a `/cvdr/zoeken` route in `src/router/routes.ts` and `src/router/index.tsx`, with route test coverage, then verify with `npm run test -- src/router/router.test.tsx`
- [x] 3.2 Run focused checks for changed behavior (`npm run test -- src/api/sruRepository.test.ts src/component/search/use-cvdr-search.test.ts src/component/search/cvdr-search-page.test.tsx src/router/router.test.tsx`) and a final `npm run typecheck`
