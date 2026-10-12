/** Text that is not shown, or is a control rather than document text. */
const EXCLUDED_SELECTOR =
  '.visually-hidden, [hidden], [aria-hidden="true"], button, script, style';

/** Elements that start a new block of text: a match never crosses them. */
export const BLOCK_TAGS: ReadonlySet<string> = new Set([
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "BR",
  "CAPTION",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIGURE",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

/** The text of one block, concatenated from its text nodes. */
export type TextBlock = {
  text: string;
  /** Each text node with the index in `text` where its content starts. */
  nodes: { node: Text; start: number }[];
};

/** A position in the DOM, as passed to `Range.setStart` / `setEnd`. */
export type TextPosition = { node: Text; offset: number };

/**
 * Splits the shown text under `root` into blocks, so inline markup (emphasis,
 * links) stays within one block while paragraphs, list items, table cells and
 * headings each get their own.
 */
export function collectTextBlocks(root: Element): TextBlock[] {
  const blocks: TextBlock[] = [];
  let current: TextBlock = { text: "", nodes: [] };

  const endBlock = () => {
    if (current.text) blocks.push(current);
    current = { text: "", nodes: [] };
  };

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node as Text).data;
      if (text) {
        current.nodes.push({ node: node as Text, start: current.text.length });
        current.text += text;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.matches(EXCLUDED_SELECTOR)) return;
    const isBlock = BLOCK_TAGS.has(element.tagName);
    if (isBlock) endBlock();
    for (let child = element.firstChild; child; child = child.nextSibling) {
      visit(child);
    }
    if (isBlock) endBlock();
  };

  visit(root);
  endBlock();
  return blocks;
}

/**
 * Resolves an index into `block.text` to a text node and offset. A start
 * position resolves to the node the character at `index` is in; an end
 * position to the node the character before `index` is in.
 */
export function resolvePosition(
  block: TextBlock,
  index: number,
  edge: "start" | "end",
): TextPosition {
  const { nodes } = block;
  for (let i = 0; i < nodes.length; i++) {
    const { node, start } = nodes[i];
    const end = start + node.data.length;
    const inside =
      edge === "start" ? index >= start && index < end : index > start && index <= end;
    if (inside) return { node, offset: index - start };
  }
  const last = nodes[nodes.length - 1];
  return { node: last.node, offset: last.node.data.length };
}

/** A DOM range over `[start, end)` of `block.text`. */
export function blockRange(block: TextBlock, start: number, end: number): Range {
  const from = resolvePosition(block, start, "start");
  const to = resolvePosition(block, end, "end");
  const range = document.createRange();
  range.setStart(from.node, from.offset);
  range.setEnd(to.node, to.offset);
  return range;
}
