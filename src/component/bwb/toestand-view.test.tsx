import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToestandView } from './toestand-view';
import * as bwbRepository from '../../api/bwbRepository';
import { HIGHLIGHT_NAME } from '../document/use-query-highlight';

vi.mock('../../api/bwbRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof bwbRepository>()),
  getToestand: vi.fn(),
}));

const mockToestand = {
  wetgeving: {
    citeertitel: { text: ['Wet op de belastingen'] },
    regeling: {
      regelingTekst: {},
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bwbRepository.getToestand).mockResolvedValue(
    mockToestand as unknown as Awaited<ReturnType<typeof bwbRepository.getToestand>>,
  );
});

describe('ToestandView', () => {
  it('calls the API with the correct parameters', async () => {
    render(<ToestandView bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={false} />);
    await waitFor(() => {
      expect(bwbRepository.getToestand).toHaveBeenCalledWith('BWBR0001840', '2026-01-01_0', false, {
        onProgress: expect.any(Function),
        signal: expect.any(AbortSignal),
      });
    });
  });

  it('shows an error alert when the API call fails', async () => {
    vi.mocked(bwbRepository.getToestand).mockRejectedValue(new Error('Not found'));
    render(<ToestandView bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={false} />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows the download progress while loading', async () => {
    vi.mocked(bwbRepository.getToestand).mockImplementation((_bwbId, _expression, _isToekomstig, options) => {
      options?.onProgress?.({ phase: 'downloading', loaded: 6_200_000, total: 14_100_000 });
      return new Promise(() => {});
    });
    render(<ToestandView bwbId="BWBR0041330" expression="2026-07-01_0" isToekomstig={false} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Regeling laden… 6,2 van 14,1 MB');
  });

  it('renders the citeertitel once loaded', async () => {
    render(<ToestandView bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={true} />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Wet op de belastingen' }),
      ).toBeInTheDocument();
    });
  });
});

describe('ToestandView highlighting', () => {
  let highlights: Map<string, { ranges: Range[] }>;

  beforeEach(() => {
    highlights = new Map();
    vi.stubGlobal('CSS', { highlights });
    vi.stubGlobal(
      'Highlight',
      class {
        ranges: Range[];
        constructor(...ranges: Range[]) {
          this.ranges = ranges;
        }
      },
    );
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function highlighted(): string[] | undefined {
    return highlights.get(HIGHLIGHT_NAME)?.ranges.map((range) => range.toString());
  }

  it('highlights the query in the citeertitel but not in the sidebar', async () => {
    render(
      <ToestandView
        bwbId="BWBR0001840"
        expression="2026-01-01_0"
        isToekomstig={true}
        highlightQuery="belastingen"
      />,
    );
    // The sidebar repeats the citeertitel; only the heading above the text counts.
    await waitFor(() => expect(highlighted()).toEqual(['belastingen']));
    const range = highlights.get(HIGHLIGHT_NAME)!.ranges[0];
    expect(range.startContainer.parentElement?.closest('#regeling')).not.toBeNull();
  });

  it('does not highlight text that only appears in the sidebar', async () => {
    render(
      <ToestandView
        bwbId="BWBR0001840"
        expression="2026-01-01_0"
        isToekomstig={true}
        highlightQuery="Inhoudsopgave"
      />,
    );
    await waitFor(() => expect(highlighted()).toEqual([]));
  });
});
