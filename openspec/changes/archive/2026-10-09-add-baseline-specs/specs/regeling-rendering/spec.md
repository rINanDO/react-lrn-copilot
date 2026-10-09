# Spec Delta

## Purpose

Renders the text of a BWB toestand as readable HTML: its structural divisions and headings, alineas, lists, tables and illustrations, repealed parts, and inline markup such as emphasis and references.

## ADDED Requirements

### Requirement: Top-level parts
The system SHALL render, in this order, the toestand's treaties (verdragen), regulation text (regelingtekst), law text (wettekst) and annexes (bijlagen), skipping parts that are absent. A treaty text SHALL be rendered as its heading followed by its law text.

#### Scenario: Law with annexes
- **WHEN** a toestand has a law text and two annexes
- **THEN** the law text is rendered first, followed by both annexes in document order

### Requirement: Structural hierarchy
The system SHALL render the structural divisions of a text (boek, titeldeel, hoofdstuk, afdeling, paragraaf, subparagraaf, artikel, lid, divisie) nested as in the source, each with its heading and contents.

#### Scenario: Chapter with articles
- **WHEN** a chapter contains three articles
- **THEN** the chapter heading is rendered followed by the three articles with their headings and contents

### Requirement: Headings
A division heading SHALL show its label, number and title, separated as "<label> <number>. <title>" when both number and title are present (for chapters, articles and annexes), followed by any subtitles. Inline markup in titles SHALL be rendered.

#### Scenario: Article heading
- **WHEN** an article has label "Artikel", number "3" and title "Begripsbepalingen"
- **THEN** its heading reads "Artikel 3. Begripsbepalingen"

### Requirement: Paragraph-level content
The system SHALL render alineas as paragraphs, lists as list items each prefixed with its item label, and members (leden) prefixed with their member number. Content inside articles, members, list items, annexes and table cells SHALL support alineas, nested lists and illustrations.

#### Scenario: Member with list
- **WHEN** member "1" contains an alinea followed by a list with items "a." and "b."
- **THEN** the member renders "1" before its first alinea, followed by the list items labelled "a." and "b."

### Requirement: Tables
The system SHALL render tables with header rows as column-header cells and body rows as data cells, each cell rendering its content.

#### Scenario: Table with header
- **WHEN** a table has one header row and three body rows
- **THEN** a table is rendered with three column headers and three data rows

### Requirement: Illustrations
The system SHALL render an illustration as an image loaded from the toestand's repository folder, with the width and height given in the source.

#### Scenario: Illustration in an annex
- **WHEN** an annex contains illustration `247668.png` with width and height
- **THEN** an image with that source file and those dimensions is rendered in place

### Requirement: Repealed articles and annexes
When the source data marks an article or annex as repealed (vervallen), the system SHALL render its heading followed by "[Vervallen per <date>]" and SHALL NOT render its contents.

#### Scenario: Repealed article
- **WHEN** an article is marked as repealed per 2020-01-01
- **THEN** its heading is shown with "[Vervallen per 2020-01-01]" and none of its members or alineas are shown

### Requirement: Inline emphasis
The system SHALL render emphasis markup as bold (`vet`), italic (`cur`) or underlined (`ondlijn`) text, and SHALL decode character entities in text.

#### Scenario: Italic emphasis
- **WHEN** an alinea contains `<nadruk type="cur">artikel 2</nadruk>`
- **THEN** "artikel 2" is rendered in italics

#### Scenario: Entities
- **WHEN** a text contains `&amp;`
- **THEN** it is rendered as "&"

### Requirement: References
External references SHALL render as links opening in a new tab with `rel="nofollow"`: references in the Celex series SHALL link to the document on EUR-Lex, other references to `https://wetten.overheid.nl/<doc>`. Internal references SHALL render as in-page links to `#<target>`.

#### Scenario: Celex reference
- **WHEN** an alinea contains an external reference with series `Celex` and document `32016R0679`
- **THEN** it renders as a link to that CELEX document on EUR-Lex, opening in a new tab

#### Scenario: Other external reference
- **WHEN** an external reference has document `BWBR0005416` and no Celex series
- **THEN** it renders as a link to `https://wetten.overheid.nl/BWBR0005416`

#### Scenario: Internal reference
- **WHEN** an internal reference targets `Artikel3`
- **THEN** it renders as a link to `#Artikel3`

### Requirement: Editorial notes
Editorial notes (redactie) SHALL render as "[Red: <text>]".

#### Scenario: Editorial note
- **WHEN** an alinea contains a redactie element with text "vervallen"
- **THEN** it renders "[Red: vervallen]"
