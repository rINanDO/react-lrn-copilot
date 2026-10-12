/** A match as `[start, end)` indices into the searched text. */
export type TextMatch = { start: number; end: number };

/** Text folded for matching, with the source span of each folded character. */
type FoldedText = {
  text: string;
  sourceStart: number[];
  sourceEnd: number[];
};

/**
 * Folds one character for matching: lower case, compatibility decomposition
 * (so "ĳ" becomes "ij") with the diacritics removed, and any whitespace as a
 * plain space. May return zero, one or several characters.
 */
function foldChar(ch: string): string {
  return ch
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/\s/gu, " ");
}

/** Folds `text` character by character, collapsing runs of spaces into one. */
function fold(text: string): FoldedText {
  const folded: FoldedText = { text: "", sourceStart: [], sourceEnd: [] };
  let index = 0;
  for (const ch of text) {
    const end = index + ch.length;
    let kept = false;
    for (const out of foldChar(ch)) {
      if (out === " " && folded.text.endsWith(" ")) continue;
      folded.text += out;
      folded.sourceStart.push(index);
      folded.sourceEnd.push(end);
      kept = true;
    }
    // A character that folds away (a combining mark, a repeated space)
    // belongs to the one before it, so a match ending there covers it.
    if (!kept && folded.sourceEnd.length > 0) {
      folded.sourceEnd[folded.sourceEnd.length - 1] = end;
    }
    index = end;
  }
  return folded;
}

/**
 * Finds the occurrences of `query` in `text` as a phrase, ignoring case,
 * diacritics and differences in whitespace. Matches do not overlap.
 */
export function findMatches(text: string, query: string): TextMatch[] {
  const needle = fold(query).text.trim();
  if (!needle) return [];

  const haystack = fold(text);
  const matches: TextMatch[] = [];
  let from = 0;
  for (;;) {
    const found = haystack.text.indexOf(needle, from);
    if (found < 0) break;
    const last = found + needle.length - 1;
    matches.push({
      start: haystack.sourceStart[found],
      end: haystack.sourceEnd[last],
    });
    from = found + needle.length;
  }
  return matches;
}
