# toestand-viewer Specification

## Purpose

Provides the page that displays one toestand of a regulation, from loading through to the rendered text with its title, table of contents, source link and access to other versions.

## Requirements

### Requirement: Toestand routes
The system SHALL show a current toestand at `/bwb/<bwbId>/<expression>` and a future toestand at `/bwbtt/<bwbId>/<expression>`. Navigating to a different BWB identifier, expression or collection SHALL load that toestand afresh.

#### Scenario: Current toestand route
- **WHEN** a user opens `/bwb/BWBR0001840/2023-02-22_0`
- **THEN** the current toestand `BWBR0001840` expression `2023-02-22_0` is loaded and shown

#### Scenario: Future toestand route
- **WHEN** a user opens `/bwbtt/BWBR0001840/2026-01-01_0`
- **THEN** the future toestand is loaded from the BWBTT collection and shown

### Requirement: Loading progress
While the toestand loads, the system SHALL show a status message and a progress bar. During download the message SHALL read "Regeling laden…" with the megabytes received, plus the total when known; the bar SHALL be determinate only when the total is known. During parsing the message SHALL read "Regeling verwerken…".

#### Scenario: Download with known size
- **WHEN** 1.5 MB of a 3.0 MB toestand has been received
- **THEN** the page shows "Regeling laden… 1,5 van 3,0 MB" and a progress bar at 50%

#### Scenario: Download with unknown size
- **WHEN** 1.5 MB has been received and the total is unknown
- **THEN** the page shows "Regeling laden… 1,5 MB" and an indeterminate progress bar

#### Scenario: Parsing
- **WHEN** the download has completed and the toestand is being parsed
- **THEN** the page shows "Regeling verwerken…"

### Requirement: Load failure
When the toestand cannot be loaded, the system SHALL show an error alert in place of the content. Technical details of the failure SHALL be shown only in development builds.

#### Scenario: Toestand not found
- **WHEN** loading the toestand fails
- **THEN** an error alert is shown and no regulation content is rendered

### Requirement: Toestand page content
Once loaded, the page SHALL show a link to the source XML file named `<bwbId>_<expression>.xml`, the citeertitel as the main heading, the table of contents, the regulation text, and the site footer.

#### Scenario: Loaded toestand
- **WHEN** the toestand has loaded
- **THEN** the citeertitel is shown as level-1 heading and a link to the toestand XML in the repository is shown

### Requirement: Access to other versions
For a current toestand, the page SHALL offer an "Andere versies" button that opens the version switcher. For a future toestand, the button SHALL NOT be shown.

#### Scenario: Current toestand
- **WHEN** a current toestand is shown
- **THEN** an "Andere versies" button is available next to the title

#### Scenario: Future toestand
- **WHEN** a future toestand is shown
- **THEN** no "Andere versies" button is shown
