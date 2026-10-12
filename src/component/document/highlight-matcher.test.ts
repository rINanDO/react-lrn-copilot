import { describe, expect, it } from 'vitest';
import { findMatches } from './highlight-matcher';

/** The matched substrings, for readable assertions. */
function matched(text: string, query: string): string[] {
  return findMatches(text, query).map(({ start, end }) => text.slice(start, end));
}

describe('findMatches', () => {
  it('ignores case', () => {
    expect(matched('De Grondwet en de GRONDWET', 'grondwet')).toEqual(['Grondwet', 'GRONDWET']);
  });

  it('ignores diacritics in the text', () => {
    const text = 'zoals geëist door de minister';
    expect(findMatches(text, 'geeist')).toEqual([{ start: 6, end: 12 }]);
    expect(matched(text, 'geeist')).toEqual(['geëist']);
  });

  it('ignores diacritics in the query', () => {
    expect(matched('zoals geeist door', 'geëist')).toEqual(['geeist']);
  });

  it('covers a decomposed accented character in full', () => {
    const text = 'geëist';
    expect(matched(text, 'geeist')).toEqual([text]);
    expect(matched('geë', 'gee')).toEqual(['geë']);
  });

  it('matches the ĳ ligature as "ij"', () => {
    expect(matched('de ĳzeren regel', 'ijzeren')).toEqual(['ĳzeren']);
  });

  it('treats non-breaking spaces and line breaks as a single space', () => {
    expect(matched('artikel 3', 'artikel 3')).toEqual(['artikel 3']);
    expect(matched('artikel\n   3', 'artikel 3')).toEqual(['artikel\n   3']);
    expect(matched('artikel 3', 'artikel   3')).toEqual(['artikel 3']);
  });

  it('matches the whole phrase, not separate words', () => {
    expect(
      matched('persoonlijke levenssfeer en persoonlijke gegevens', 'persoonlijke gegevens'),
    ).toEqual(['persoonlijke gegevens']);
  });

  it('does not return overlapping matches', () => {
    expect(findMatches('aaa', 'aa')).toEqual([{ start: 0, end: 2 }]);
    expect(findMatches('aaaa', 'aa')).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(matched('de grondwet', '  grondwet ')).toEqual(['grondwet']);
  });

  it('returns nothing for a blank query', () => {
    expect(findMatches('de grondwet', '')).toEqual([]);
    expect(findMatches('de grondwet', '   ')).toEqual([]);
  });

  it('returns nothing when there is no match', () => {
    expect(findMatches('de grondwet', 'belasting')).toEqual([]);
  });
});
