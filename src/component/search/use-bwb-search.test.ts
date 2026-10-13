import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBwbSearch } from './use-bwb-search';
import * as sruRepository from '../../api/sruRepository';
import type { BwbSearchCriteria, BwbSearchResult } from '../../api/sruRepository';

vi.mock('../../api/sruRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof sruRepository>()),
  searchBwb: vi.fn(),
}));

const result = (title: string): BwbSearchResult => ({
  total: 1,
  records: [{ bwbId: 'BWBR0001840', title, authorities: [], expression: '2023-02-22_0' }],
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBwbSearch', () => {
  it('stays idle without a search text or filter', () => {
    const { result: hook } = renderHook(() => useBwbSearch({ q: '  ' }, 1));
    expect(hook.current).toEqual({ status: 'idle' });
    expect(sruRepository.searchBwb).not.toHaveBeenCalled();
  });

  it('returns the results once loaded', async () => {
    vi.mocked(sruRepository.searchBwb).mockResolvedValue(result('Grondwet'));
    const { result: hook } = renderHook(() => useBwbSearch({ q: 'grondwet', soort: 'wet' }, 2));
    expect(hook.current).toEqual({ status: 'loading' });
    await waitFor(() => expect(hook.current).toEqual({ status: 'loaded', result: result('Grondwet') }));
    expect(sruRepository.searchBwb).toHaveBeenCalledWith(
      { q: 'grondwet', soort: 'wet' },
      { page: 2, signal: expect.any(AbortSignal) },
    );
  });

  it('reports a service error with the technical detail', async () => {
    vi.mocked(sruRepository.searchBwb).mockRejectedValue(new Error('Fetching zoekresultaten failed: 503'));
    const { result: hook } = renderHook(() => useBwbSearch({ q: 'grondwet' }, 1));
    await waitFor(() => expect(hook.current.status).toBe('error'));
    expect(hook.current).toEqual({
      status: 'error',
      error: {
        message: 'De zoekdienst is op dit moment niet bereikbaar. Probeer het later opnieuw.',
        technical: 'Fetching zoekresultaten failed: 503',
      },
    });
  });

  it('reports an SRU diagnostic', async () => {
    vi.mocked(sruRepository.searchBwb).mockRejectedValue(new sruRepository.SruDiagnosticError('Unsupported index'));
    const { result: hook } = renderHook(() => useBwbSearch({ q: 'grondwet' }, 1));
    await waitFor(() =>
      expect(hook.current).toEqual({
        status: 'error',
        error: { message: 'De zoekopdracht kon niet worden uitgevoerd.', technical: 'Unsupported index' },
      }),
    );
  });

  it('shows only the results of the latest search', async () => {
    const resolvers: Record<string, (value: BwbSearchResult) => void> = {};
    const signals: Record<string, AbortSignal | undefined> = {};
    vi.mocked(sruRepository.searchBwb).mockImplementation((criteria, options) => {
      signals[criteria.q ?? ''] = options?.signal;
      return new Promise((resolve) => (resolvers[criteria.q ?? ''] = resolve));
    });
    const { result: hook, rerender } = renderHook(
      ({ criteria }: { criteria: BwbSearchCriteria }) => useBwbSearch(criteria, 1),
      { initialProps: { criteria: { q: 'grondwet' } } },
    );
    rerender({ criteria: { q: 'omgevingswet' } });
    expect(signals.grondwet?.aborted).toBe(true);

    resolvers.grondwet(result('Grondwet'));
    resolvers.omgevingswet(result('Omgevingswet'));
    await waitFor(() => expect(hook.current).toEqual({ status: 'loaded', result: result('Omgevingswet') }));
  });

  it('aborts the request on unmount', () => {
    let signal: AbortSignal | undefined;
    vi.mocked(sruRepository.searchBwb).mockImplementation((_criteria, options) => {
      signal = options?.signal;
      return new Promise(() => {});
    });
    const { unmount } = renderHook(() => useBwbSearch({ q: 'grondwet' }, 1));
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
