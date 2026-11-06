import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bwbRepository from '../../api/bwbRepository';
import { toVersiePaden, useWtiVersies } from './use-wti-versies';

vi.mock('../../api/bwbRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof bwbRepository>()),
  getManifest: vi.fn(),
}));

const getManifest = vi.mocked(bwbRepository.getManifest);
const ID = 'BWBR0026965';
const manifest = (...labels: string[]) => ({
  bwbId: ID,
  expressions: labels.map((label) => ({ label })),
});

beforeEach(() => {
  getManifest.mockReset();
});

describe('toVersiePaden', () => {
  it('maps current and future versions to their routes', () => {
    const paden = toVersiePaden(ID, manifest('2014-01-18_0'), manifest('2027-01-01_0'));
    expect(paden.get('2014-01-18')).toBe(`/bwb/${ID}/2014-01-18_0`);
    expect(paden.get('2027-01-01')).toBe(`/bwbtt/${ID}/2027-01-01_0`);
  });

  it('uses the last correction of a date', () => {
    const paden = toVersiePaden(ID, manifest('2014-01-01_0', '2014-01-01_1'));
    expect(paden.get('2014-01-01')).toBe(`/bwb/${ID}/2014-01-01_1`);
  });

  it('prefers a current version to a future one on the same date', () => {
    const paden = toVersiePaden(ID, manifest('2026-01-01_0'), manifest('2026-01-01_0'));
    expect(paden.get('2026-01-01')).toBe(`/bwb/${ID}/2026-01-01_0`);
  });
});

describe('useWtiVersies', () => {
  it('loads both manifests', async () => {
    getManifest.mockImplementation(async (_id, _options, isToekomstig) =>
      manifest(isToekomstig ? '2027-01-01_0' : '2014-01-18_0'),
    );
    const { result } = renderHook(() => useWtiVersies(ID));
    expect(result.current.size).toBe(0);
    await waitFor(() => expect(result.current.size).toBe(2));
    expect(result.current.get('2027-01-01')).toBe(`/bwbtt/${ID}/2027-01-01_0`);
  });

  it('keeps the current versions when the future manifest fails', async () => {
    getManifest.mockImplementation(async (_id, _options, isToekomstig) => {
      if (isToekomstig) throw new Error('Not found');
      return manifest('2014-01-18_0');
    });
    const { result } = renderHook(() => useWtiVersies(ID));
    await waitFor(() => expect(result.current.size).toBe(1));
  });

  it('has no versions when both manifests fail', async () => {
    getManifest.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useWtiVersies(ID));
    await waitFor(() => expect(getManifest).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => setTimeout(resolve));
    expect(result.current.size).toBe(0);
  });

  it('aborts on unmount', () => {
    getManifest.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderHook(() => useWtiVersies(ID));
    const signal = getManifest.mock.calls[0][1]?.signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
