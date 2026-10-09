import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toLoadError, useToestand } from './use-toestand';
import * as wettenRepository from '../../api/wettenRepository';

vi.mock('../../api/wettenRepository', () => ({
  getToestand: vi.fn(),
}));

type Toestand = Awaited<ReturnType<typeof wettenRepository.getToestand>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useToestand', () => {
  it('reports the download progress while loading', async () => {
    vi.mocked(wettenRepository.getToestand).mockImplementation((_bwbId, _expression, _isToekomstig, options) => {
      options?.onProgress?.({ phase: 'downloading', loaded: 100, total: 200 });
      return new Promise(() => {});
    });
    const { result } = renderHook(() => useToestand('BWBR0001840', '2026-01-01_0', false));
    await waitFor(() => {
      expect(result.current).toEqual({
        status: 'loading',
        progress: { phase: 'downloading', loaded: 100, total: 200 },
      });
    });
  });

  it('returns the wetgeving once loaded', async () => {
    const wetgeving = { citeertitel: { text: ['Wet'] } };
    vi.mocked(wettenRepository.getToestand).mockResolvedValue({ wetgeving } as unknown as Toestand);
    const { result } = renderHook(() => useToestand('BWBR0001840', '2026-01-01_0', true));
    await waitFor(() => expect(result.current).toEqual({ status: 'loaded', wetgeving }));
    expect(wettenRepository.getToestand).toHaveBeenCalledWith('BWBR0001840', '2026-01-01_0', true, {
      onProgress: expect.any(Function),
      signal: expect.any(AbortSignal),
    });
  });

  it('shows the message of a failed request', async () => {
    vi.mocked(wettenRepository.getToestand).mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useToestand('BWBR0001840', '2026-01-01_0', false));
    await waitFor(() => expect(result.current).toEqual({ status: 'error', error: { message: 'Not found' } }));
  });

  it('aborts the request on unmount and ignores its result', async () => {
    let resolve: (toestand: Toestand) => void = () => {};
    let signal: AbortSignal | undefined;
    vi.mocked(wettenRepository.getToestand).mockImplementation((_bwbId, _expression, _isToekomstig, options) => {
      signal = options?.signal;
      return new Promise((r) => (resolve = r));
    });
    const { result, unmount } = renderHook(() => useToestand('BWBR0001840', '2026-01-01_0', false));
    unmount();
    expect(signal?.aborted).toBe(true);
    resolve({ wetgeving: {} } as unknown as Toestand);
    await Promise.resolve();
    expect(result.current).toEqual({ status: 'loading' });
  });
});

describe('useToestand with changing inputs', () => {
  it('reads as loading for a new toestand and aborts the previous request', async () => {
    const wetgeving = { citeertitel: { text: ['Wet'] } };
    const signals: Array<AbortSignal | undefined> = [];
    vi.mocked(wettenRepository.getToestand).mockImplementation((_bwbId, expression, _isToekomstig, options) => {
      signals.push(options?.signal);
      return expression === 'old'
        ? Promise.resolve({ wetgeving } as unknown as Toestand)
        : new Promise(() => {});
    });
    const { result, rerender } = renderHook(({ expression }) => useToestand('BWBR0001840', expression, false), {
      initialProps: { expression: 'old' },
    });
    await waitFor(() => expect(result.current.status).toBe('loaded'));

    rerender({ expression: 'new' });
    expect(result.current).toEqual({ status: 'loading' });
    expect(signals[0]?.aborted).toBe(true);
  });
});

describe('toLoadError', () => {
  it('uses the generic message with technical detail for non-errors', () => {
    expect(toLoadError('boom')).toEqual({
      message: 'Er is een fout opgetreden bij het laden van de preview.',
      technical: 'boom',
    });
  });
});
