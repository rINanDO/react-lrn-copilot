# text-highlighting Specification

## Purpose

Lets a link to a document page name a piece of text through the `q` query-string parameter, so that every place it occurs in the rendered regeling is highlighted and the reader is taken to the first one.

## Requirements

### Requirement: Query parameter
The document pages for a BWB toestand (`/bwb/...`, `/bwbtt/...`) and a CVDR regeling (`/cvdr/...`) SHALL accept an optional `q` query-string parameter. Its decoded value, with leading and trailing whitespace removed, is the text to highlight. When `q` is absent or blank, the system SHALL NOT highlight anything and the page SHALL behave as it does without the parameter.

#### Scenario: Text to highlight given
- **WHEN** a user opens `/bwb/BWBR0001840/2023-02-22_0?q=grondrechten`
- **THEN** the occurrences of "grondrechten" in the regeling text are highlighted once the toestand has loaded

#### Scenario: URL-encoded phrase
- **WHEN** a user opens a document page with `?q=persoonlijke%20gegevens`
- **THEN** the phrase "persoonlijke gegevens" is highlighted

#### Scenario: Blank parameter
- **WHEN** a user opens a document page with `?q=` or `?q=%20%20`
- **THEN** nothing is highlighted and the page does not scroll

### Requirement: Phrase matching
The system SHALL highlight every occurrence of the whole query text as a single phrase. Matching SHALL ignore letter case and diacritics, and SHALL treat any run of whitespace in the query or in the text as one space. Occurrences SHALL NOT overlap; matching resumes after the end of the previous match.

#### Scenario: Case-insensitive
- **WHEN** `q` is "grondwet" and the text contains "Grondwet" and "GRONDWET"
- **THEN** both occurrences are highlighted

#### Scenario: Diacritics ignored
- **WHEN** `q` is "geeist" and the text contains "geëist"
- **THEN** "geëist" is highlighted, including its accented character

#### Scenario: Diacritics in the query
- **WHEN** `q` is "geëist" and the text contains "geeist"
- **THEN** "geeist" is highlighted

#### Scenario: Phrase, not separate words
- **WHEN** `q` is "persoonlijke gegevens" and the text contains "persoonlijke levenssfeer" and "persoonlijke gegevens"
- **THEN** only "persoonlijke gegevens" is highlighted

#### Scenario: Whitespace differences
- **WHEN** `q` is "artikel 3" and the text contains "artikel" followed by a line break and "3"
- **THEN** that occurrence is highlighted

#### Scenario: No overlapping matches
- **WHEN** `q` is "aa" and the text contains "aaa"
- **THEN** only the first two characters are highlighted

### Requirement: Matches across inline markup
An occurrence SHALL be highlighted even when it spans inline markup within one block of text, such as emphasis, references or editorial notes. An occurrence SHALL NOT span separate blocks such as two alineas, list items, table cells or a heading and the text below it.

#### Scenario: Phrase partly emphasised
- **WHEN** `q` is "in artikel 2" and an alinea contains "in <nadruk type=\"cur\">artikel 2</nadruk>"
- **THEN** the whole of "in artikel 2" is highlighted, including the italic part

#### Scenario: Phrase partly a link
- **WHEN** `q` is "bedoeld in artikel 3" and an alinea contains "bedoeld in " followed by an internal reference "artikel 3"
- **THEN** the whole phrase is highlighted and the link still works

#### Scenario: Separate alineas
- **WHEN** one alinea ends with "de minister" and the next alinea starts with "van Justitie"
- **THEN** `q` "minister van Justitie" does not match across them

### Requirement: Highlight scope
The system SHALL search only the visible regeling content: the document title and the regeling text. It SHALL NOT highlight text in the table of contents, the XML download link, the footer, or text that is not displayed, such as labels hidden for screen readers.

#### Scenario: Term in table of contents
- **WHEN** `q` matches an article title that appears both in the table of contents and in the regeling text
- **THEN** only the occurrence in the regeling text is highlighted

#### Scenario: Screen-reader label
- **WHEN** `q` is "Externe link" and the only occurrences are in labels hidden for screen readers
- **THEN** nothing is highlighted

### Requirement: Highlight preserves content
Highlighting SHALL NOT change the document's text, its structure, its links or what assistive technology reads. Matches SHALL be shown with a visible background colour that is distinct from the page's link and emphasis styling and keeps the text readable.

#### Scenario: Copying highlighted text
- **WHEN** the user selects and copies text that contains a highlighted occurrence
- **THEN** the copied text is the same as without highlighting

#### Scenario: Highlighted link
- **WHEN** a highlighted occurrence lies inside a reference link
- **THEN** activating the link navigates as it would without highlighting

### Requirement: Scroll to first match
After the document has rendered and at least one occurrence is highlighted, the system SHALL scroll the first occurrence in document order into view. When the URL also has a fragment that identifies an element on the page, the system SHALL NOT scroll to the match, so the fragment target stays in view.

#### Scenario: First match below the fold
- **WHEN** a user opens a document page with `q` whose first occurrence is in article 40
- **THEN** after loading, the page is scrolled so that occurrence is visible

#### Scenario: Fragment present
- **WHEN** a user opens `/bwb/BWBR0001840/2023-02-22_0?q=grondrechten#Artikel3` and the page has an element with id `Artikel3`
- **THEN** occurrences are highlighted but the page does not scroll to the first occurrence

#### Scenario: No matches
- **WHEN** `q` matches nothing in the regeling content
- **THEN** nothing is highlighted, the page does not scroll and no error is shown

### Requirement: Highlight follows the URL
The highlight SHALL reflect the current URL. When the `q` value or the document changes without a full page load, the system SHALL remove the previous highlights and apply those for the new value and document.

#### Scenario: Switching to another version
- **WHEN** a highlighted toestand is open and the user switches to another version via a link that keeps `q`
- **THEN** the new version's occurrences are highlighted once it has loaded and no highlights from the previous version remain

#### Scenario: Parameter removed
- **WHEN** the URL changes so `q` is no longer present
- **THEN** all highlights are removed

### Requirement: Unsupported browsers
In a browser that cannot show highlights without changing the document, the system SHALL show the document normally, without highlights and without errors.

#### Scenario: Highlighting not supported
- **WHEN** the page is opened with `q` in a browser without the needed highlighting support
- **THEN** the document is shown without highlights and no error is shown
