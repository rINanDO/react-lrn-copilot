import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bwbRepository from '../../api/bwbRepository';
import type { FetchOptions } from '../../api/repository';
import type { wetstechnischeinformatie } from '../../api/types.gen';
import { useWetTechnischeInformatie } from './use-wet-technische-informatie';

vi.mock('../../api/bwbRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof bwbRepository>()),
  getWetTechnischeInformatie: vi.fn(),
}));

const getWti = vi.mocked(bwbRepository.getWetTechnischeInformatie);
const informatie: wetstechnischeinformatie = { bwbId: 'BWBR0001840' };

beforeEach(() => {
  getWti.mockReset();
});

describe('useWetTechnischeInformatie', () => {
  it('reports progress while loading', async () => {
    let options: FetchOptions | undefined;
    getWti.mockImplementation((_bwbId, fetchOptions) => {
      options = fetchOptions;
      return new Promise(() => {});
    });
    const progress = { phase: 'downloading', loaded: 10, total: 20 } as const;

    const { result } = renderHook(() => useWetTechnischeInformatie('BWBR0001840'));
    expect(result.current).toEqual({ status: 'loading' });

    act(() => options?.onProgress?.(progress));
    expect(result.current).toEqual({ status: 'loading', progress });
  });

  it('returns the loaded document', async () => {
    getWti.mockResolvedValue(informatie);
    const { result } = renderHook(() => useWetTechnischeInformatie('BWBR0001840'));
    await waitFor(() => expect(result.current).toEqual({ status: 'loaded', informatie }));
  });

  it('turns an Error into its message', async () => {
    getWti.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useWetTechnischeInformatie('BWBR0001840'));
    await waitFor(() =>
      expect(result.current).toEqual({ status: 'error', error: { message: 'Not found' } }),
    );
  });

  it('aborts the request on unmount', () => {
    getWti.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderHook(() => useWetTechnischeInformatie('BWBR0001840'));
    const signal = getWti.mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('makes one request while the bwbId is unchanged', async () => {
    getWti.mockResolvedValue(informatie);
    const { result, rerender } = renderHook(() => useWetTechnischeInformatie('BWBR0001840'));
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    rerender();
    expect(getWti).toHaveBeenCalledTimes(1);
  });

  it('reads as loading straight away for a new bwbId and ignores the old request', async () => {
    let resolveFirst: (value: wetstechnischeinformatie) => void = () => {};
    getWti.mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)));
    getWti.mockImplementationOnce(() => new Promise(() => {}));

    const { result, rerender } = renderHook(({ bwbId }) => useWetTechnischeInformatie(bwbId), {
      initialProps: { bwbId: 'BWBR0001840' },
    });
    rerender({ bwbId: 'BWBR0002222' });
    expect(result.current).toEqual({ status: 'loading' });
    expect(getWti.mock.calls[0][1]?.signal?.aborted).toBe(true);

    await act(async () => resolveFirst(informatie));
    expect(result.current).toEqual({ status: 'loading' });
  });
});
