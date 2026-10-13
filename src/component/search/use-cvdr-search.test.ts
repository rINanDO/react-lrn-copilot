import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCvdrSearch } from './use-cvdr-search';
import * as sruRepository from '../../api/sruRepository';
import type { CvdrSearchCriteria, CvdrSearchResult } from '../../api/sruRepository';

vi.mock('../../api/sruRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof sruRepository>()),
  searchCvdr: vi.fn(),
}));

const result = (title: string): CvdrSearchResult => ({
  total: 1,
  records: [{ cvdrId: 'CVDR744131', expression: '2', title }],
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCvdrSearch', () => {
  it('stays idle without a search text', () => {
    const { result: hook } = renderHook(() => useCvdrSearch({ q: '  ' }, 1));
    expect(hook.current).toEqual({ status: 'idle' });
    expect(sruRepository.searchCvdr).not.toHaveBeenCalled();
  });

  it('returns results once loaded', async () => {
    vi.mocked(sruRepository.searchCvdr).mockResolvedValue(result('Handhavingsbeleid'));
    const { result: hook } = renderHook(() => useCvdrSearch({ q: 'handhaving' }, 2));
    expect(hook.current).toEqual({ status: 'loading' });
    await waitFor(() =>
      expect(hook.current).toEqual({ status: 'loaded', result: result('Handhavingsbeleid') }),
    );
    expect(sruRepository.searchCvdr).toHaveBeenCalledWith(
      { q: 'handhaving' },
      { page: 2, signal: expect.any(AbortSignal) },
    );
  });

  it('reports service errors with technical detail', async () => {
    vi.mocked(sruRepository.searchCvdr).mockRejectedValue(new Error('Fetching zoekresultaten failed: 503'));
    const { result: hook } = renderHook(() => useCvdrSearch({ q: 'handhaving' }, 1));
    await waitFor(() => expect(hook.current.status).toBe('error'));
    expect(hook.current).toEqual({
      status: 'error',
      error: {
        message: 'De zoekdienst is op dit moment niet bereikbaar. Probeer het later opnieuw.',
        technical: 'Fetching zoekresultaten failed: 503',
      },
    });
  });

  it('shows only the latest search results', async () => {
    const resolvers: Record<string, (value: CvdrSearchResult) => void> = {};
    const signals: Record<string, AbortSignal | undefined> = {};
    vi.mocked(sruRepository.searchCvdr).mockImplementation((criteria, options) => {
      signals[criteria.q ?? ''] = options?.signal;
      return new Promise((resolve) => (resolvers[criteria.q ?? ''] = resolve));
    });

    const { result: hook, rerender } = renderHook(
      ({ criteria }: { criteria: CvdrSearchCriteria }) => useCvdrSearch(criteria, 1),
      { initialProps: { criteria: { q: 'handhaving' } } },
    );

    rerender({ criteria: { q: 'veiligheid' } });
    expect(signals.handhaving?.aborted).toBe(true);

    resolvers.handhaving(result('Handhavingsbeleid'));
    resolvers.veiligheid(result('Veiligheidsverordening'));
    await waitFor(() =>
      expect(hook.current).toEqual({ status: 'loaded', result: result('Veiligheidsverordening') }),
    );
  });

  it('aborts the request on unmount', () => {
    let signal: AbortSignal | undefined;
    vi.mocked(sruRepository.searchCvdr).mockImplementation((_criteria, options) => {
      signal = options?.signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useCvdrSearch({ q: 'handhaving' }, 1));
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
