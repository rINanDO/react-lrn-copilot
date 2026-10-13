# bwb-search Specification

## Purpose

Lets users find regelingen in the basiswettenbestand by title and by metadata filters. Searches go to the official SRU search service, and each result leads to the regeling's current toestand.

## Requirements

### Requirement: Landing page search form
Submitting the search form on the `/bwb` landing page SHALL navigate to `/bwb/zoeken`. When the search text, with leading and trailing whitespace removed, is not empty, it SHALL be passed as the `q` parameter. The landing page SHALL NOT show a "Work in progress" dialog.

#### Scenario: Search from the landing page
- **WHEN** a user types "grondwet" in the landing page search box and submits
- **THEN** the browser navigates to `/bwb/zoeken?q=grondwet`

#### Scenario: Empty search from the landing page
- **WHEN** a user submits the landing page form with an empty or whitespace-only search box
- **THEN** the browser navigates to `/bwb/zoeken` without a `q` parameter

### Requirement: Search results route and query string
The system SHALL show search results at `/bwb/zoeken`. The search SHALL be defined entirely by the query-string parameters `q` (title text), `soort` (regelingsoort), `ministerie` (eerstverantwoordelijke), `rechtsgebied` and `pagina` (1-based page number), so that reloading, bookmarking or sharing the URL shows the same search.

#### Scenario: Bookmarked search
- **WHEN** a user opens `/bwb/zoeken?q=grondwet&soort=wet`
- **THEN** the page shows the results for title "grondwet" restricted to regelingsoort "wet", with the search box and filter filled in accordingly

#### Scenario: Back button restores the previous search
- **WHEN** a user changes the search and then presses the browser's back button
- **THEN** the page shows the previous search's results again

#### Scenario: Static route takes precedence over a BWB identifier
- **WHEN** a user opens `/bwb/zoeken`
- **THEN** the search results page is shown, not the version list of a regeling with identifier "zoeken"

### Requirement: Search through the SRU service
The system SHALL perform searches with the SRU 2.0 `searchRetrieve` operation of `https://zoekservice.overheid.nl/sru/Search` with `x-connection=BWB`. It SHALL request XML responses. It SHALL NOT call the service when the search has neither `q` nor any filter.

#### Scenario: Request sent for a search
- **WHEN** the page shows a search with `q` "grondwet"
- **THEN** one `searchRetrieve` request is sent to the SRU service for the BWB collection

#### Scenario: No search criteria
- **WHEN** a user opens `/bwb/zoeken` without `q` and without filters
- **THEN** no request is sent and the page invites the user to enter a search term or choose a filter

#### Scenario: Superseded search
- **WHEN** a user starts a new search while the previous one is still loading
- **THEN** only the results of the new search are shown

### Requirement: Title search
The `q` text SHALL match regelingen whose citeertitel, officiële titel or niet-officiële titel contains all words of `q`, in any order. The page SHALL state that only titles are searched. Characters with a special meaning in the service's query language SHALL be treated as literal text.

#### Scenario: All words required
- **WHEN** a user searches for "bescherming persoonsgegevens"
- **THEN** the results include regelingen whose title contains both "bescherming" and "persoonsgegevens", such as the "Wet bescherming persoonsgegevens"

#### Scenario: Quotes in the search text
- **WHEN** a user searches for `wet "x"`
- **THEN** the search runs without a service error

### Requirement: Current toestand only
The results SHALL contain only toestanden that are in force (geldig) and visible (zichtbaar) on the current date, so each regeling appears at most once.

#### Scenario: One result per regeling
- **WHEN** a user searches for "grondwet"
- **THEN** the Grondwet (BWBR0001840) appears once, as the toestand in force today

### Requirement: Filters
The page SHALL offer three optional filters: regelingsoort, eerstverantwoordelijke and rechtsgebied. Their choices SHALL come from the value lists in the SRU BWB manual, plus an "all" choice that removes the filter. Filters SHALL combine with each other and with `q`, and each one narrows the results. A search MAY use filters without `q`.

#### Scenario: Filter combined with title search
- **WHEN** a user searches for "wet" with regelingsoort "AMvB"
- **THEN** every result has regelingsoort "AMvB" and "wet" in its title

#### Scenario: Filters without search text
- **WHEN** a user opens `/bwb/zoeken?ministerie=justitie%20en%20veiligheid&rechtsgebied=strafrecht`
- **THEN** the results are the regelingen of eerstverantwoordelijke "Justitie en Veiligheid" in rechtsgebied "strafrecht"

#### Scenario: Removing a filter
- **WHEN** a user sets the regelingsoort filter back to "all"
- **THEN** the `soort` parameter is removed from the URL and results of every regelingsoort are shown

### Requirement: Changing the search
The results page SHALL show a search box and the filters, filled in from the current URL. Submitting the search box or changing a filter SHALL update the URL to the new search and SHALL reset the page number to the first page.

#### Scenario: New search from the results page
- **WHEN** a user on page 3 of a search changes the search text to "omgevingswet" and submits
- **THEN** the URL becomes `/bwb/zoeken?q=omgevingswet` with the filters kept and no `pagina`, and the first page of the new results is shown

#### Scenario: Changing a filter
- **WHEN** a user on page 2 selects a rechtsgebied
- **THEN** the URL gets that `rechtsgebied` value and loses `pagina`, and the first page of the filtered results is shown

### Requirement: Result list
For each result the page SHALL show the title, the regelingsoort, the eerstverantwoordelijke, the BWB identifier and the start date of the toestand's validity. Results SHALL be listed in the order the service returns them. The page SHALL show the total number of results.

#### Scenario: Result details
- **WHEN** the results include the Grondwet
- **THEN** its entry shows "Grondwet", its regelingsoort, its eerstverantwoordelijke, "BWBR0001840" and the date its current toestand came into force

#### Scenario: Total count
- **WHEN** a search matches 2519 regelingen
- **THEN** the page states that there are 2519 results

### Requirement: Result links
Each result SHALL link to the regeling's toestand page at `/bwb/<bwbId>/<expression>`, where the expression is that of the toestand found. When the search has `q`, the link SHALL pass it on as the `q` parameter so the toestand page highlights it.

#### Scenario: Link to the toestand
- **WHEN** a result is the toestand `2023-02-22_0` of `BWBR0001840` and the search was `q=grondwet`
- **THEN** the result links to `/bwb/BWBR0001840/2023-02-22_0?q=grondwet`

#### Scenario: Link without search text
- **WHEN** the search used only filters
- **THEN** result links have no `q` parameter

### Requirement: Paging
Results SHALL be shown 50 per page. The page SHALL show which range of results is displayed and offer links to the previous and next page when they exist. A missing or invalid `pagina` SHALL be treated as page 1.

#### Scenario: Second page
- **WHEN** a user opens a search with `pagina=2` that has 120 results
- **THEN** results 51 to 100 are shown, with links to page 1 and page 3

#### Scenario: Last page
- **WHEN** a user is on the last page of the results
- **THEN** no link to a next page is shown

#### Scenario: Invalid page number
- **WHEN** a user opens a search with `pagina=abc` or `pagina=0`
- **THEN** the first page of results is shown

#### Scenario: Page beyond the results
- **WHEN** a user opens `pagina=99` for a search with 120 results
- **THEN** the page says there are no results on this page and links to the first page

### Requirement: Search status messages
While a search loads, the page SHALL show a loading indicator announced to assistive technology. When a search has no results, the page SHALL say so. When the service cannot be reached, answers with an HTTP error or returns an SRU diagnostic, the page SHALL show an error alert instead of results; technical details SHALL be shown only in development builds.

#### Scenario: Loading
- **WHEN** a search request is in progress
- **THEN** the page shows a loading indicator with a status message

#### Scenario: No results
- **WHEN** a search returns zero records
- **THEN** the page shows a message that nothing was found, and the search box and filters stay available

#### Scenario: Service error
- **WHEN** the SRU service answers with an HTTP error or a diagnostic such as "Unsupported index"
- **THEN** an error alert is shown and no result list is rendered
