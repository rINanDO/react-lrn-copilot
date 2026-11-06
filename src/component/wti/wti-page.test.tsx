import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as bwbRepository from '../../api/bwbRepository';
import type { wetstechnischeinformatie } from '../../api/types.gen';
import { appRoutes } from '../../router/routes';
import WtiPage from './wti-page';

vi.mock('../../api/bwbRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof bwbRepository>()),
  getWetTechnischeInformatie: vi.fn(),
  getManifest: vi.fn(),
}));

const getWti = vi.mocked(bwbRepository.getWetTechnischeInformatie);
const getManifest = vi.mocked(bwbRepository.getManifest);

const informatie: wetstechnischeinformatie = {
  wijzigingen: {
    regelingelementen: {
      regelingelement: [
        { labelId: '7', datum: [{ waarde: '2023-02-22' }, { waarde: '2018-12-21' }] },
        { labelId: '8', datum: [{ waarde: '1983-03-02' }] },
      ],
    },
  },
};

const NOT_FOUND = 'Er is geen wetstechnische informatie gevonden voor dit regelingelement.';

function renderAt(url: string) {
  const router = createMemoryRouter([{ path: appRoutes.wti, element: <WtiPage /> }], {
    initialEntries: [url],
  });
  render(<RouterProvider router={router} />);
  return router;
}

function dates(): string[] {
  return screen
    .getAllByRole('row')
    .slice(2)
    .map((row) => row.querySelector('td')?.textContent ?? '');
}

beforeEach(() => {
  getWti.mockReset();
  getWti.mockResolvedValue(informatie);
  getManifest.mockReset();
  getManifest.mockRejectedValue(new Error('Not found'));
});

afterEach(cleanup);

describe('WtiPage', () => {
  it('shows a determinate progress bar when the size is known', async () => {
    getWti.mockImplementation((_bwbId, options) => {
      options?.onProgress?.({ phase: 'downloading', loaded: 1_500_000, total: 3_000_000 });
      return new Promise(() => {});
    });
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an indeterminate progress bar when the size is unknown', async () => {
    getWti.mockImplementation((_bwbId, options) => {
      options?.onProgress?.({ phase: 'downloading', loaded: 1_500_000 });
      return new Promise(() => {});
    });
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(await screen.findByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('shows an error alert and no table when loading fails', async () => {
    getWti.mockRejectedValue(new Error('Not found'));
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(await screen.findByRole('alert')).toHaveTextContent('Not found');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('fetches the work in the URL and shows only the matching item', async () => {
    renderAt('/bwb/BWBR0001840/2023-02-22_0/8');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Wetstechnische informatie' }),
    ).toBeInTheDocument();
    expect(getWti.mock.calls[0][0]).toBe('BWBR0001840');
    expect(dates()).toEqual(['02-03-1983']);
  });

  it('links to the wti document above the heading', async () => {
    renderAt('/bwb/BWBR0001840/2023-02-22_0/99');
    const link = await screen.findByRole('link', { name: 'BWBR0001840.wti' });
    expect(link).toHaveAttribute(
      'href',
      'https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0001840/BWBR0001840.wti',
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(link.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows no link to the wti document while loading or after a failure', async () => {
    getWti.mockRejectedValue(new Error('Not found'));
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await screen.findByRole('alert');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows a message and no table when no item matches', async () => {
    renderAt('/bwb/BWBR0001840/2023-02-22_0/99');
    expect(await screen.findByText(NOT_FOUND)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows a message and no table without regelingelementen', async () => {
    getWti.mockResolvedValue({ wijzigingen: {} });
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(await screen.findByText(NOT_FOUND)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('marks the change in force at the expression and links the other versions', async () => {
    getManifest.mockImplementation(async (bwbId, _options, isToekomstig) => ({
      bwbId,
      expressions: isToekomstig ? [] : [{ label: '2018-12-21_0' }, { label: '2023-02-22_0' }],
    }));
    renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    expect(await screen.findByRole('link', { name: '21-12-2018' })).toHaveAttribute(
      'href',
      '/bwb/BWBR0001840/2018-12-21_0',
    );
    expect(screen.getByRole('row', { current: true })).toHaveTextContent('22-02-2023');
    expect(screen.queryByRole('link', { name: '22-02-2023' })).not.toBeInTheDocument();
  });

  it('shows plain dates when the manifests cannot be loaded', async () => {
    renderAt('/bwb/BWBR0001840/2018-12-21_0/7');
    await screen.findByRole('table');
    await waitFor(() => expect(getManifest).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('link', { name: '22-02-2023' })).not.toBeInTheDocument();
    expect(dates()).toEqual(['22-02-2023', '21-12-2018']);
  });

  it('shows dates later than the expression', async () => {
    renderAt('/bwb/BWBR0001840/2018-12-21_0/7');
    await screen.findByRole('table');
    expect(dates()).toEqual(['22-02-2023', '21-12-2018']);
  });

  it('shows the new item without a new request when only the label id changes', async () => {
    const router = renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    await screen.findByRole('table');

    await act(() => router.navigate('/bwb/BWBR0001840/2023-02-22_0/8'));

    expect(dates()).toEqual(['02-03-1983']);
    expect(getWti).toHaveBeenCalledTimes(1);
  });

  it('loads the other work and hides the previous dates when the regeling changes', async () => {
    const router = renderAt('/bwb/BWBR0001840/2023-02-22_0/7');
    await screen.findByRole('table');
    getWti.mockImplementation(() => new Promise(() => {}));

    await act(() => router.navigate('/bwb/BWBR0002222/2023-02-22_0/7'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(getWti.mock.calls[1][0]).toBe('BWBR0002222');
  });
});
