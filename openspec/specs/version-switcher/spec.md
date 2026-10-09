# version-switcher Specification

## Purpose

Lets a user viewing a toestand browse, search and switch to another version (expression) of the same regulation without leaving the page.

## Requirements

### Requirement: On-demand version loading
The version dialog SHALL load the work's manifest only when the dialog is opened, and SHALL show a loading indicator while it loads and an error alert when loading fails.

#### Scenario: Dialog not opened
- **WHEN** a toestand is shown and the user has not opened the version dialog
- **THEN** the manifest is not requested

#### Scenario: Dialog opened
- **WHEN** the user opens the version dialog
- **THEN** the manifest is requested and a loading indicator is shown until it arrives

### Requirement: Version listing
The dialog SHALL be titled "Versies van <bwbId>" and list the expressions newest first, each with its label and "In werking: <date>", followed by "tot en met <end date>" when the expression has an end date. The shown expression SHALL be highlighted and marked "Huidig"; every expression in force today SHALL be marked "Geldend".

#### Scenario: Current and in-force markers
- **WHEN** the dialog lists the shown expression and it is also in force today
- **THEN** that entry is highlighted, marked as the current page, and shows both "Huidig" and "Geldend"

### Requirement: Paging
The dialog SHALL show 10 expressions per page with pagination when there is more than one page. On opening, it SHALL start on the page that holds the shown expression.

#### Scenario: Current expression on a later page
- **WHEN** the shown expression is the 15th newest of 30
- **THEN** the dialog opens on page 2

### Requirement: Search
The dialog SHALL offer a search field that filters expressions case-insensitively on label, entry-into-force date and end date, and SHALL show "<matches> van <total> versies". Changing the search SHALL return to the first page. When nothing matches, it SHALL show "Geen versies gevonden." Search and page SHALL reset each time the dialog opens.

#### Scenario: Search by date fragment
- **WHEN** the user types `2023-07`
- **THEN** only expressions whose label or dates contain `2023-07` are listed, starting on page 1

#### Scenario: No match
- **WHEN** the search matches no expression
- **THEN** the dialog shows "Geen versies gevonden."

### Requirement: Selecting a version
Selecting an expression SHALL navigate to `/bwb/<bwbId>/<expression>` and close the dialog. The dialog SHALL also close via its close button or by dismissing it.

#### Scenario: Switch version
- **WHEN** the user selects expression `2022-01-01_0`
- **THEN** the dialog closes and the page navigates to `/bwb/<bwbId>/2022-01-01_0`
