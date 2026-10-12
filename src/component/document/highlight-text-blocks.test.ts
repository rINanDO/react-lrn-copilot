import { describe, expect, it } from 'vitest';
import { blockRange, collectTextBlocks, resolvePosition } from './highlight-text-blocks';

function container(html: string): HTMLDivElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

describe('collectTextBlocks', () => {
  it('keeps inline markup within one block', () => {
    const root = container('<p>bedoeld in <em>artikel</em> <a href="#a3">3</a>, eerste lid</p>');
    const blocks = collectTextBlocks(root);
    expect(blocks.map((b) => b.text)).toEqual(['bedoeld in artikel 3, eerste lid']);
    expect(blocks[0].nodes).toHaveLength(5);
  });

  it('splits paragraphs and table cells into separate blocks', () => {
    const root = container(
      '<p>de minister</p><p>van Justitie</p><table><tr><td>cel een</td><td>cel twee</td></tr></table>',
    );
    expect(collectTextBlocks(root).map((b) => b.text)).toEqual([
      'de minister',
      'van Justitie',
      'cel een',
      'cel twee',
    ]);
  });

  it('splits text before and after a nested block', () => {
    const root = container('<li><span>a.</span><div>eerste punt</div>slot</li>');
    expect(collectTextBlocks(root).map((b) => b.text)).toEqual(['a.', 'eerste punt', 'slot']);
  });

  it('excludes hidden text and buttons', () => {
    const root = container(
      '<h1>Titel <button>Andere versies</button></h1>' +
        '<p><a><span class="visually-hidden">Externe link: </span>richtlijn</a>' +
        '<span hidden>verborgen</span><span aria-hidden="true">icoon</span></p>',
    );
    expect(collectTextBlocks(root).map((b) => b.text)).toEqual(['Titel ', 'richtlijn']);
  });
});

describe('resolvePosition', () => {
  const root = container('<p>ab<em>cd</em>ef</p>');
  const [block] = collectTextBlocks(root);
  const [ab, cd, ef] = block.nodes.map((n) => n.node);

  it('resolves a start at a node boundary to the following node', () => {
    expect(resolvePosition(block, 2, 'start')).toEqual({ node: cd, offset: 0 });
    expect(resolvePosition(block, 0, 'start')).toEqual({ node: ab, offset: 0 });
  });

  it('resolves an end at a node boundary to the preceding node', () => {
    expect(resolvePosition(block, 2, 'end')).toEqual({ node: ab, offset: 2 });
    expect(resolvePosition(block, 6, 'end')).toEqual({ node: ef, offset: 2 });
  });

  it('builds a range across nodes', () => {
    const range = blockRange(block, 1, 5);
    expect(range.toString()).toBe('bcde');
    expect(range.startContainer).toBe(ab);
    expect(range.endContainer).toBe(ef);
  });
});
