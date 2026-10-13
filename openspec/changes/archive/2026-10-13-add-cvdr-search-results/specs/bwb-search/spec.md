# Spec Delta

## MODIFIED Requirements

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
