import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HIGHLIGHT_NAME, useQueryHighlight } from './use-query-highlight';

class FakeHighlight {
  readonly ranges: Range[];
  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }
}

let highlights: Map<string, FakeHighlight>;
const scrollIntoView = vi.fn();

beforeEach(() => {
  highlights = new Map();
  vi.stubGlobal('CSS', { highlights });
  vi.stubGlobal('Highlight', FakeHighlight);
  Element.prototype.scrollIntoView = scrollIntoView;
  scrollIntoView.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = '';
});

const CONTENT =
  '<h1>Grondwet</h1>' +
  '<p id="eerste">De <em>grondwet</em> en de wet.</p>' +
  '<p id="tweede">Nogmaals de Grondwet.</p>';

function Harness({ query, ready = true }: { query?: string | null; ready?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useQueryHighlight(ref, query, ready);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: CONTENT }} />;
}

function registeredRanges(): string[] | undefined {
  return highlights.get(HIGHLIGHT_NAME)?.ranges.map((range) => range.toString());
}

describe('useQueryHighlight', () => {
  it('registers a range for every match', () => {
    render(<Harness query="grondwet" />);
    expect(registeredRanges()).toEqual(['Grondwet', 'grondwet', 'Grondwet']);
  });

  it('registers nothing for a blank or missing query', () => {
    const { rerender } = render(<Harness query="  " />);
    expect(highlights.has(HIGHLIGHT_NAME)).toBe(false);
    rerender(<Harness query={null} />);
    expect(highlights.has(HIGHLIGHT_NAME)).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('registers nothing until the content is ready', () => {
    const { rerender } = render(<Harness query="grondwet" ready={false} />);
    expect(highlights.has(HIGHLIGHT_NAME)).toBe(false);
    rerender(<Harness query="grondwet" ready={true} />);
    expect(registeredRanges()).toHaveLength(3);
  });

  it('replaces the highlight when the query changes', () => {
    const { rerender } = render(<Harness query="grondwet" />);
    rerender(<Harness query="nogmaals" />);
    expect(registeredRanges()).toEqual(['Nogmaals']);
    rerender(<Harness query={null} />);
    expect(highlights.has(HIGHLIGHT_NAME)).toBe(false);
  });

  it('removes the highlight on unmount', () => {
    const { unmount } = render(<Harness query="grondwet" />);
    unmount();
    expect(highlights.has(HIGHLIGHT_NAME)).toBe(false);
  });

  it('scrolls the first match into view once', () => {
    const { container } = render(<Harness query="nogmaals" />);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    expect(scrollIntoView.mock.contexts[0]).toBe(container.querySelector('#tweede'));
  });

  it('does not scroll when the URL fragment targets an element', () => {
    window.location.hash = '#eerste';
    render(<Harness query="nogmaals" />);
    expect(registeredRanges()).toEqual(['Nogmaals']);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls when the URL fragment targets nothing on the page', () => {
    window.location.hash = '#bestaat-niet';
    render(<Harness query="nogmaals" />);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('registers an empty highlight and does not scroll without matches', () => {
    render(<Harness query="belasting" />);
    expect(registeredRanges()).toEqual([]);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing when the browser lacks the Highlight API', () => {
    vi.stubGlobal('CSS', {});
    expect(() => render(<Harness query="grondwet" />)).not.toThrow();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing when CSS is undefined', () => {
    vi.stubGlobal('CSS', undefined);
    expect(() => render(<Harness query="grondwet" />)).not.toThrow();
  });
});
