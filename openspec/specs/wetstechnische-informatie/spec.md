# wetstechnische-informatie Specification

## Purpose

Provides the page that shows the wetstechnische informatie of one regelingelement of a BWB regeling, so that a reader can see how that element changed.

## Requirements

### Requirement: Wetstechnische informatie route
The system SHALL show the "Wetstechnische informatie" page, with that text as its main heading, at `/bwb/<bwbId>/<expression>/<labelId>`. The existing routes `/bwb/<bwbId>` and `/bwb/<bwbId>/<expression>` SHALL keep showing their current pages.

#### Scenario: Opening the page
- **WHEN** a user opens `/bwb/BWBR0001840/2023-02-22_0/2940504`
- **THEN** the "Wetstechnische informatie" page is shown for `BWBR0001840` and label id `2940504`

#### Scenario: Existing toestand route
- **WHEN** a user opens `/bwb/BWBR0001840/2023-02-22_0`
- **THEN** the toestand page is shown

### Requirement: Link to the source document
Once the wetstechnische informatie has loaded, the page SHALL show a link to the source document at the top of the page, above the main heading. The link text SHALL be the file name `<bwbId>.wti`. The link SHALL NOT depend on whether the label id in the URL matches an item.

#### Scenario: Loaded document
- **WHEN** the wetstechnische informatie of `BWBR0001840` has loaded
- **THEN** a link named `BWBR0001840.wti` to that document in the repository is shown above the main heading

#### Scenario: No matching item
- **WHEN** the document has loaded and has no item with the label id in the URL
- **THEN** the link to the source document is still shown

#### Scenario: Loading or failed
- **WHEN** the document is still loading or could not be loaded
- **THEN** no link to the source document is shown

### Requirement: Loading progress
The system SHALL retrieve the wetstechnische informatie of the regeling in the URL and SHALL show a status message and a progress bar until it has loaded. The bar SHALL be determinate only when the total download size is known.

#### Scenario: Download with known size
- **WHEN** 1.5 MB of a 3.0 MB wetstechnische informatie document has been received
- **THEN** the page shows a status message and a progress bar at 50%

#### Scenario: Download with unknown size
- **WHEN** part of the document has been received and the total size is unknown
- **THEN** the page shows a status message and an indeterminate progress bar

### Requirement: Load failure
When the wetstechnische informatie cannot be loaded, the system SHALL show an error alert in place of the content. Technical details of the failure SHALL be shown only in development builds.

#### Scenario: Regeling not found
- **WHEN** retrieving the wetstechnische informatie fails
- **THEN** an error alert is shown and no table is rendered

### Requirement: Regelingelement selection
The system SHALL select the item in `wijzigingen.regelingelementen` whose `label-id` exactly equals the label id in the URL. When no item matches, the system SHALL show a message that no information was found for this element, and no table.

#### Scenario: Matching item
- **WHEN** the document has items with `label-id` `7` and `8` and the URL has label id `8`
- **THEN** only the changes of the item with `label-id` `8` are shown

#### Scenario: No matching item
- **WHEN** the document has no item with the label id in the URL
- **THEN** a message is shown that no information was found and no table is rendered

#### Scenario: Document without regelingelementen
- **WHEN** the document has no `wijzigingen.regelingelementen`
- **THEN** a message is shown that no information was found and no table is rendered

### Requirement: Table of changes
The system SHALL show a table of the selected item's changes, with one row per `details` of each `datum`, in document order. A `datum` with a `waarde` but no `details` SHALL get a row with only its date. A `datum` with neither SHALL NOT get a row. When there are no rows, the system SHALL show a message that no changes are known instead of the table.

#### Scenario: Several changes
- **WHEN** the selected item has `datum` entries with `waarde` `2023-02-22` and `2018-12-21`, in that order
- **THEN** the table has a row for `22-02-2023` followed by a row for `21-12-2018`

#### Scenario: Same date twice
- **WHEN** the selected item has two `datum` entries with `waarde` `1983-03-02`
- **THEN** the table has two rows for `02-03-1983`

#### Scenario: Several details
- **WHEN** a `datum` has two `details`
- **THEN** the table has two rows for that `datum`

#### Scenario: Pending change without a date
- **WHEN** a `datum` has no `waarde` and has `details` with `betreft` "Aanhangig" and dossier number `35924`
- **THEN** the table has a row with an empty date, "Aanhangig" and a link to that dossier

#### Scenario: No changes at all
- **WHEN** no `datum` of the selected item has a `waarde` or `details`
- **THEN** a message is shown that no changes are known and no table is rendered

### Requirement: Table columns
The table SHALL have the columns "Datum van inwerkingtreding", "Terugwerkende kracht" and "Betreft", then "Ondertekening", "Bekendmaking" and a kenmerk column grouped under "Ontstaansbron", then "Ondertekening", "Bekendmaking" and "Opmerking" grouped under "Inwerkingtreding". The kenmerk column SHALL be headed "Kenmerk" when any row has a kenmerk, and "Kamerstukken" otherwise.

#### Scenario: Staatscourant regeling
- **WHEN** a user opens the page for `BWBR0026965` with label id `10324604`
- **THEN** the table has these columns with "Kenmerk" as the heading of the kenmerk column

#### Scenario: Law
- **WHEN** no change of the selected item has a kenmerk
- **THEN** the kenmerk column is headed "Kamerstukken"

### Requirement: Cell formatting
Dates SHALL be shown as `dd-mm-yyyy`. "Betreft" SHALL start with a capital letter. Terugwerkende kracht with scope `tot-en-met` SHALL be prefixed with "t/m". A publication SHALL be shown as `<soort>. <jaar>, <nummer>`, linked in a new tab when it has a URL identifier. The kenmerk column SHALL show a linked dossier number when there is one, otherwise the kenmerk. Several sources in one cell SHALL be separated by "samen met".

#### Scenario: Retroactive change
- **WHEN** a change has terugwerkende kracht with scope `tot-en-met` and `waarde` `2014-01-01`
- **THEN** the cell reads "t/m 01-01-2014"

#### Scenario: Publication with a URL
- **WHEN** a publication has soort `Stcrt`, year `2014`, number `1435` and URL identifier `stcrt-2014-1435`
- **THEN** the cell shows "Stcrt. 2014, 1435" linked to `https://zoek.officielebekendmakingen.nl/stcrt-2014-1435.html`

#### Scenario: Publication without a URL
- **WHEN** a publication has no URL identifier
- **THEN** the cell shows its name without a link

#### Scenario: Several sources
- **WHEN** a change has two inwerkingtreding sources
- **THEN** their dates and publications are each shown one below the other, separated by "samen met"

### Requirement: Current version marking
The system SHALL mark the rows of the latest date in the table on or before the date of the expression in the URL as the current change, using the page's visual style for a current row. When no date qualifies, no row SHALL be marked. A row without a date SHALL NOT be marked.

#### Scenario: Latest change before the expression
- **WHEN** a user opens the page with expression `2026-01-01_0` and the item has changes on `2027-01-01`, `2014-01-18` and `2013-01-01`
- **THEN** the row for `18-01-2014` is marked as current

#### Scenario: Change on the expression date
- **WHEN** the expression is `2013-01-01_0` and the item has a change on `2013-01-01`
- **THEN** that row is marked as current

#### Scenario: Same date twice
- **WHEN** the current date occurs in two rows
- **THEN** both rows are marked as current

#### Scenario: Expression before every change
- **WHEN** every change is later than the date of the expression
- **THEN** no row is marked

### Requirement: Links to versions
A date in the table SHALL link to the version of the regeling that starts on that date, when one exists: to `/bwb/<bwbId>/<expression>` for a current version and to `/bwbtt/<bwbId>/<expression>` for a future one. Of several versions on one date, the link SHALL go to the last. The current row's date SHALL NOT be a link. The table SHALL NOT wait for this information, and when it cannot be loaded, dates SHALL be shown without links and without an error.

#### Scenario: Earlier version exists
- **WHEN** the date `2013-01-01` is not current and version `2013-01-01_0` exists
- **THEN** the date links to `/bwb/<bwbId>/2013-01-01_0`

#### Scenario: Future version
- **WHEN** a future version `2027-01-01_0` exists
- **THEN** the date `01-01-2027` links to `/bwbtt/<bwbId>/2027-01-01_0`

#### Scenario: No version on that date
- **WHEN** no version starts on the date of a row
- **THEN** the date is shown without a link

#### Scenario: Corrected version
- **WHEN** versions `2014-01-01_0` and `2014-01-01_1` exist
- **THEN** the date `01-01-2014` links to `2014-01-01_1`

#### Scenario: Version list unavailable
- **WHEN** the list of versions cannot be loaded
- **THEN** the table is shown with plain dates and no error

### Requirement: Opmerkingen
Each opmerking of a change SHALL appear in the "Opmerking" column as a link reading `<type>. <number>`, numbered from 1 across the table. Below the table, a list headed "Opmerkingen" SHALL give the text of each opmerking, linking back to its row. Without opmerkingen, the list SHALL NOT be shown.

#### Scenario: Change with an opmerking
- **WHEN** the first opmerking in the table has type `Inwtr`
- **THEN** its row has a link "Inwtr. 1" to item 1 of the list below the table, and that item links back to the row

#### Scenario: No opmerkingen
- **WHEN** no change of the selected item has an opmerking
- **THEN** no "Opmerkingen" list is shown

### Requirement: Expression does not filter
The table SHALL list the changes of the selected item regardless of the expression in the URL, including dates later than that expression.

#### Scenario: Date after the expression
- **WHEN** a user opens the page with expression `2018-12-21_0` and the selected item has a `datum` with `waarde` `2023-02-22`
- **THEN** the table has a row for `22-02-2023`

### Requirement: Changing the label id
When only the label id in the URL changes, the system SHALL show the changes of the newly selected item without retrieving the document again. When the regeling in the URL changes, the system SHALL retrieve that regeling's document and SHALL NOT show the previous regeling's changes.

#### Scenario: Other label id of the same regeling
- **WHEN** the page is showing label id `7` and the URL changes to label id `8` of the same regeling
- **THEN** the changes of label id `8` are shown and no new request is made

#### Scenario: Other regeling
- **WHEN** the URL changes to a different BWB identifier
- **THEN** the page shows the progress bar until that regeling's document has loaded
