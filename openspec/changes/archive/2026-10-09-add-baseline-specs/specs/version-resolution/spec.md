# Spec Delta

## Purpose

Lets a user open a regulation by its BWB identifier alone, taking them to the version in force today, or to a list of versions when none is in force.

## ADDED Requirements

### Requirement: Expression in force
An expression SHALL be considered in force (geldend) on a date when its entry-into-force date is on or before that date and it either has no end date or its end date is on or after that date.

#### Scenario: Open-ended expression
- **WHEN** an expression entered into force on 2023-01-01 and has no end date
- **THEN** it is in force on 2024-05-01

#### Scenario: Ended expression
- **WHEN** an expression has end date 2023-12-31
- **THEN** it is not in force on 2024-01-01

### Requirement: Redirect to the version in force
When a user opens `/bwb/<bwbId>`, the system SHALL load the work's manifest and replace the current history entry with `/bwb/<bwbId>/<expression>` for the expression in force today. When several expressions are in force, the most recent SHALL be chosen.

#### Scenario: One version in force
- **WHEN** a user opens `/bwb/BWBR0001840` and expression `2024-01-01_0` is in force today
- **THEN** the user is redirected to `/bwb/BWBR0001840/2024-01-01_0` without an extra history entry

#### Scenario: Several versions in force
- **WHEN** both `2024-01-01_0` and `2024-01-01_1` are in force today
- **THEN** the user is redirected to `2024-01-01_1`

### Requirement: Version list when none is in force
When no expression is in force today, the system SHALL show the BWB identifier as heading and a table of all expressions, newest first, with version label, entry-into-force date and end date. Each label SHALL link to that expression. When the manifest has no expressions, the system SHALL show "Geen versies gevonden."

#### Scenario: Withdrawn regulation
- **WHEN** all expressions of a work have ended
- **THEN** a table lists every expression, newest first, each linking to `/bwb/<bwbId>/<expression>`

#### Scenario: Empty manifest
- **WHEN** the manifest lists no expressions
- **THEN** the page shows "Geen versies gevonden."

### Requirement: Resolution states
While the manifest loads, the system SHALL show a loading indicator. When loading fails, it SHALL show an error alert with the failure message.

#### Scenario: Manifest cannot be loaded
- **WHEN** the manifest request fails
- **THEN** an error alert is shown instead of a redirect or list
