import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BwbSearchPage from './bwb-search-page';
import * as sruRepository from '../../api/sruRepository';
import type { BwbSearchRecord, BwbSearchResult } from '../../api/sruRepository';

vi.mock('../../api/sruRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof sruRepository>()),
  searchBwb: vi.fn(),
}));

const grondwet: BwbSearchRecord = {
  bwbId: 'BWBR0001840',
  title: 'Grondwet',
  type: 'wet',
  authorities: ['Binnenlandse Zaken en Koninkrijksrelaties'],
  expression: '2023-02-22_0',
  geldigVanaf: '2023-02-22',
};

function records(count: number): BwbSearchRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    ...grondwet,
    bwbId: `BWBR${String(index).padStart(7, '0')}`,
    title: `Regeling ${index}`,
  }));
}

function Location() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderPage(url: string, result: BwbSearchResult = { total: 1, records: [grondwet] }) {
  vi.mocked(sruRepository.searchBwb).mockResolvedValue(result);
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/bwb/zoeken" element={<BwbSearchPage />} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );
}

const location = () => new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost');

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BwbSearchPage', () => {
  it('fills in the search from the URL and searches with it', async () => {
    renderPage('/bwb/zoeken?q=grondwet&soort=wet&ministerie=justitie%20en%20veiligheid&rechtsgebied=strafrecht&pagina=2');

    expect(screen.getByRole('textbox', { name: /zoek in wetten/i })).toHaveValue('grondwet');
    expect(screen.getByRole('combobox', { name: 'Regelingsoort' })).toHaveValue('wet');
    expect(screen.getByRole('combobox', { name: 'Eerstverantwoordelijke' })).toHaveValue('justitie en veiligheid');
    expect(screen.getByRole('combobox', { name: 'Rechtsgebied' })).toHaveValue('strafrecht');
    expect(screen.getByText(/titels van regelingen die vandaag geldig zijn/)).toBeInTheDocument();
    await screen.findByText('Grondwet');
    expect(sruRepository.searchBwb).toHaveBeenCalledWith(
      { q: 'grondwet', soort: 'wet', ministerie: 'justitie en veiligheid', rechtsgebied: 'strafrecht' },
      { page: 2, signal: expect.any(AbortSignal) },
    );
  });

  it('pushes a new search, keeping the filters and starting at page 1', async () => {
    renderPage('/bwb/zoeken?q=grondwet&soort=wet&pagina=3');
    const input = screen.getByRole('textbox', { name: /zoek in wetten/i });
    fireEvent.change(input, { target: { value: '  omgevingswet ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zoeken' }));

    await waitFor(() => expect(location().searchParams.get('q')).toBe('omgevingswet'));
    expect(location().searchParams.get('soort')).toBe('wet');
    expect(location().searchParams.has('pagina')).toBe(false);
    expect(screen.getByRole('textbox', { name: /zoek in wetten/i })).toHaveValue('omgevingswet');
  });

  it('drops the page when a filter changes and removes a filter set to all', async () => {
    renderPage('/bwb/zoeken?q=wet&soort=wet&pagina=2');

    fireEvent.change(screen.getByRole('combobox', { name: 'Rechtsgebied' }), { target: { value: 'strafrecht' } });
    await waitFor(() => expect(location().searchParams.get('rechtsgebied')).toBe('strafrecht'));
    expect(location().searchParams.has('pagina')).toBe(false);

    fireEvent.change(screen.getByRole('combobox', { name: 'Regelingsoort' }), { target: { value: '' } });
    await waitFor(() => expect(location().searchParams.has('soort')).toBe(false));
    expect(location().searchParams.get('q')).toBe('wet');
  });

  it('keeps a filter value that is not in the list', () => {
    renderPage('/bwb/zoeken?soort=onbekend');
    expect(screen.getByRole('combobox', { name: 'Regelingsoort' })).toHaveValue('onbekend');
  });

  it('shows the details of a result and links to the toestand with q', async () => {
    renderPage('/bwb/zoeken?q=grondwet');
    const link = await screen.findByRole('link', { name: 'Grondwet' });
    expect(link).toHaveAttribute('href', '/bwb/BWBR0001840/2023-02-22_0?q=grondwet');
    expect(
      screen.getByText('wet · Binnenlandse Zaken en Koninkrijksrelaties · BWBR0001840 · geldig vanaf 22-2-2023'),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 resultaat');
  });

  it('links without q for a search with filters only', async () => {
    renderPage('/bwb/zoeken?soort=wet');
    expect(await screen.findByRole('link', { name: 'Grondwet' })).toHaveAttribute(
      'href',
      '/bwb/BWBR0001840/2023-02-22_0',
    );
  });

  it('shows the range and links to the previous and next page', async () => {
    renderPage('/bwb/zoeken?q=wet&pagina=2', { total: 120, records: records(50) });

    expect(await screen.findByText('120 resultaten (51–100)')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('list')).toHaveAttribute('start', '51');
    const paging = screen.getByRole('navigation', { name: 'Paginering' });
    expect(within(paging).getByRole('link', { name: 'Vorige pagina' })).toHaveAttribute('href', '/bwb/zoeken?q=wet');
    expect(within(paging).getByRole('link', { name: 'Volgende pagina' })).toHaveAttribute(
      'href',
      '/bwb/zoeken?q=wet&pagina=3',
    );
  });

  it('shows no next link on the last page', async () => {
    renderPage('/bwb/zoeken?q=wet&pagina=3', { total: 120, records: records(20) });
    expect(await screen.findByText('120 resultaten (101–120)')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Volgende pagina' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vorige pagina' })).toBeInTheDocument();
  });

  it.each(['abc', '0', '-1', '1.5'])('treats pagina=%s as page 1', async (pagina) => {
    renderPage(`/bwb/zoeken?q=wet&pagina=${pagina}`);
    await screen.findByText('Grondwet');
    expect(sruRepository.searchBwb).toHaveBeenCalledWith({ q: 'wet', soort: '', ministerie: '', rechtsgebied: '' }, {
      page: 1,
      signal: expect.any(AbortSignal),
    });
  });

  it('links to the first page when the page lies beyond the results', async () => {
    renderPage('/bwb/zoeken?q=wet&pagina=99', { total: 120, records: [] });
    expect(await screen.findByText(/Geen resultaten op deze pagina/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Naar de eerste pagina' })).toHaveAttribute('href', '/bwb/zoeken?q=wet');
  });

  it('invites a search without sending a request when there are no criteria', () => {
    renderPage('/bwb/zoeken');
    expect(screen.getByText(/Typ een zoekterm of kies een filter/)).toBeInTheDocument();
    expect(sruRepository.searchBwb).not.toHaveBeenCalled();
  });

  it('shows the loading state', () => {
    vi.mocked(sruRepository.searchBwb).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/bwb/zoeken?q=wet']}>
        <BwbSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Zoeken…');
  });

  it('says so when nothing is found', async () => {
    renderPage('/bwb/zoeken?q=zzqqxx', { total: 0, records: [] });
    expect(await screen.findByText('Er zijn geen regelingen gevonden.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /zoek in wetten/i })).toBeInTheDocument();
  });

  it('shows an error alert when the search fails', async () => {
    vi.mocked(sruRepository.searchBwb).mockRejectedValue(new Error('Fetching zoekresultaten failed: 503'));
    render(
      <MemoryRouter initialEntries={['/bwb/zoeken?q=wet']}>
        <BwbSearchPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('De zoekdienst is op dit moment niet bereikbaar');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
