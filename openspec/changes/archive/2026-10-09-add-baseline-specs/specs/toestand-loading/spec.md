# Spec Delta

## Purpose

Retrieves BWB publications from the official publications repository: a toestand (one expression of a regulation) as a typed document model, the manifest listing a work's expressions, and the illustrations stored alongside a toestand.

## ADDED Requirements

### Requirement: Toestand location
The system SHALL fetch a toestand from `https://repository.officiele-overheidspublicaties.nl/<collection>/<bwbId>/<expression>/xml/<bwbId>_<expression>.xml`, where `<collection>` is `BWB` for a current toestand and `BWBTT` for a future (toekomstig) toestand. The BWB identifier and expression SHALL be URL-encoded.

#### Scenario: Current toestand
- **WHEN** toestand `BWBR0001840` expression `2023-02-22_0` is requested as a current toestand
- **THEN** the system requests `.../BWB/BWBR0001840/2023-02-22_0/xml/BWBR0001840_2023-02-22_0.xml`

#### Scenario: Future toestand
- **WHEN** the same toestand is requested as a future toestand
- **THEN** the system requests `.../BWBTT/BWBR0001840/2023-02-22_0/xml/BWBR0001840_2023-02-22_0.xml`

### Requirement: Illustration location
The system SHALL resolve an illustration by its file name in the same folder as the toestand XML, using the same collection, BWB identifier and expression as the toestand that references it.

#### Scenario: Illustration next to the toestand
- **WHEN** a toestand `BWBR0001840` expression `2023-02-22_0` references illustration `247668.png`
- **THEN** the illustration is loaded from `.../BWB/BWBR0001840/2023-02-22_0/xml/247668.png`

### Requirement: Download progress
While a toestand downloads, the system SHALL report the number of bytes received so far, and the total size when the server reports a usable length. A length SHALL be treated as unusable when it is missing, zero, or the response is content-encoded. Once the download completes, the system SHALL report a parsing phase before it parses the document.

#### Scenario: Known size
- **WHEN** the server reports a Content-Length and no Content-Encoding
- **THEN** each progress report includes the bytes received and that total

#### Scenario: Compressed response
- **WHEN** the response carries a Content-Encoding
- **THEN** progress reports include the bytes received but no total

#### Scenario: Parsing phase
- **WHEN** the last chunk of the toestand has been received
- **THEN** a parsing progress report is emitted before the parsed toestand is returned

### Requirement: Toestand model
The system SHALL map the toestand XML to a typed document model following the BWB schema. The content of alinea, tussenkop, titel, subtitel and intitule elements SHALL be preserved as their raw inner markup, so inline markup can be rendered later.

#### Scenario: Inline markup preserved
- **WHEN** an alinea contains `Zie <nadruk type="cur">artikel 2</nadruk>`
- **THEN** the alinea's text in the model is that inner markup, including the `nadruk` element

### Requirement: Toestand failures
The system SHALL fail a toestand request with an error when the repository responds with an unsuccessful HTTP status or when the response is not well-formed XML.

#### Scenario: HTTP error
- **WHEN** the repository responds with status 404
- **THEN** the request fails with an error that names the BWB identifier, expression and status

#### Scenario: Malformed XML
- **WHEN** the response body is not well-formed XML
- **THEN** the request fails with an "Invalid toestand XML" error

### Requirement: Manifest expressions
The system SHALL read a work's expressions from `<base>/BWB/<bwbId>/manifest.xml`, with each expression's label, entry-into-force date and end date. Expressions whose items are all marked deleted SHALL be skipped. Expressions SHALL be ordered chronologically by date, then by numeric sequence number.

#### Scenario: Deleted expressions skipped
- **WHEN** the manifest contains an expression whose every item has `_deleted="true"`
- **THEN** that expression is not listed

#### Scenario: Numeric sequence ordering
- **WHEN** the manifest lists `2023-01-01_10`, `2023-01-01_9` and `2022-06-01_0` in any order
- **THEN** they are ordered `2022-06-01_0`, `2023-01-01_9`, `2023-01-01_10`

#### Scenario: Manifest failure
- **WHEN** the manifest request returns an unsuccessful status or malformed XML
- **THEN** the request fails with an error
