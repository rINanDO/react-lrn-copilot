# Spec Delta

## Purpose

Gives an overview of a regulation's structure in a sidebar next to the text, as a foldable tree of chapters, paragraphs and articles.

## ADDED Requirements

### Requirement: Table of contents structure
The sidebar SHALL show the citeertitel and an "Inhoudsopgave" heading, followed by a tree built from the chapters (hoofdstukken) of the regulation text, or of the law text when there is no regulation text. Each chapter SHALL list its articles and its paragraphs; each paragraph SHALL list its articles. Each entry SHALL show the heading's label, number and title.

#### Scenario: Chapter with paragraphs
- **WHEN** a chapter contains two paragraphs with articles
- **THEN** the chapter entry contains an entry per paragraph, and each paragraph entry contains an entry per article

### Requirement: Article ranges
Chapter and paragraph entries SHALL show the range of articles beneath them: "(Artikel <nr>)" when there is one distinct article number, otherwise "(Artikelen <first>-<last>)". A chapter's range SHALL include the articles directly under it and those in its paragraphs.

#### Scenario: Several articles
- **WHEN** a paragraph contains articles 2.51 to 2.54
- **THEN** its entry shows "(Artikelen 2.51-2.54)"

#### Scenario: Single article
- **WHEN** a chapter contains only article 1
- **THEN** its entry shows "(Artikel 1)"

### Requirement: Folding
Entries with nested entries SHALL be folded by default and offer a toggle button labelled "Toon onderliggende" when folded and "Verberg onderliggende" when unfolded, exposing its state via `aria-expanded`. Entries without nested entries SHALL NOT offer a toggle. Using the toggle SHALL NOT follow the entry's link.

#### Scenario: Unfold and fold
- **WHEN** the user activates the toggle of a folded chapter
- **THEN** its nested entries become visible and the toggle reads "Verberg onderliggende" with `aria-expanded="true"`

#### Scenario: Leaf entry
- **WHEN** an article entry has no nested entries
- **THEN** no toggle is shown for it

### Requirement: Folded entries are not rendered
Nested entries of a folded item SHALL NOT be rendered until the item is unfolded, so large regulations with thousands of entries stay responsive.

#### Scenario: Initially folded
- **WHEN** the table of contents is first shown
- **THEN** the article entries inside folded chapters are not present in the page
