# cvdr-search Specification

## Purpose

Lets users find CVDR regulations from the app by search term, inspect paged results, and open the selected CVDR expression directly.

## Requirements

### Requirement: CVDR search route and URL contract
The system SHALL expose a CVDR search page at `/cvdr`, and the query string SHALL define the full search state via `q` (text) and `pagina` (1-based page), so reloading, sharing, and browser navigation restore the same result set.

#### Scenario: Bookmarked CVDR search
- **WHEN** a user opens `/cvdr?q=handhaving&pagina=2`
- **THEN** the page shows CVDR results for `handhaving` on page 2 with the search box prefilled

#### Scenario: Invalid page value
- **WHEN** a user opens `/cvdr?pagina=abc`
- **THEN** the first page is used

### Requirement: CVDR SRU search execution
The system SHALL search through SRU `searchRetrieve` at `https://zoekservice.overheid.nl/sru/Search` with `x-connection=CVDR`, SHALL request XML responses, and SHALL not call SRU when `q` is blank.

#### Scenario: Search with text
- **WHEN** the URL is `/cvdr?q=veiligheid`
- **THEN** the app sends one CVDR SRU request and displays returned matches

#### Scenario: No text
- **WHEN** the URL is `/cvdr` without `q`
- **THEN** the page keeps the search form visible, hides the result block, and sends no request

### Requirement: CVDR result rendering and navigation
The search page SHALL show a total-count status, paged results, and links to `/cvdr/<cvdrId>/<expression>`. When a search has `q`, each link SHALL pass `q` as query-string parameter.

#### Scenario: Result link includes highlight query
- **WHEN** a result for `CVDR744131` expression `2` is shown for `q=handhaving`
- **THEN** its link is `/cvdr/CVDR744131/2?q=handhaving`

#### Scenario: No results
- **WHEN** SRU returns zero matches
- **THEN** the page states no regulations were found and keeps the search form visible

### Requirement: CVDR loading and error messages
The search page SHALL show a loading status while searching and SHALL render an error alert when the request fails or SRU responds with diagnostics.

#### Scenario: Loading indicator
- **WHEN** a CVDR search request is in progress
- **THEN** a status message indicates the search is loading

#### Scenario: Service failure
- **WHEN** SRU cannot be reached or rejects the query
- **THEN** an error alert is shown and no result list is rendered
