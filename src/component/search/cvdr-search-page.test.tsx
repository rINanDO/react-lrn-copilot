import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CvdrSearchPage from './cvdr-search-page';
import * as sruRepository from '../../api/sruRepository';
import type { CvdrSearchRecord, CvdrSearchResult } from '../../api/sruRepository';

vi.mock('../../api/sruRepository', async (importOriginal) => ({
  ...(await importOriginal<typeof sruRepository>()),
  searchCvdr: vi.fn(),
}));

const handhaving: CvdrSearchRecord = {
  cvdrId: 'CVDR744131',
  expression: '2',
  title: 'Handhavingsbeleid Industriële Veiligheid',
  type: 'regeling',
  authority: 'Gemeente Den Haag',
};

function records(count: number): CvdrSearchRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    ...handhaving,
    cvdrId: `CVDR${String(index).padStart(6, '0')}`,
    title: `Regeling ${index}`,
  }));
}

function Location() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderPage(url: string, result: CvdrSearchResult = { total: 1, records: [handhaving] }) {
  vi.mocked(sruRepository.searchCvdr).mockResolvedValue(result);
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/cvdr/zoeken" element={<CvdrSearchPage />} />
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

describe('CvdrSearchPage', () => {
  it('fills search from the URL and searches with it', async () => {
    renderPage('/cvdr/zoeken?q=handhaving&pagina=2');

    expect(screen.getByRole('textbox', { name: /zoek in lokale regelgeving/i })).toHaveValue('handhaving');
    expect(screen.getByText(/titels van regelingen uit de CVDR-collectie/i)).toBeInTheDocument();
    await screen.findByText('Handhavingsbeleid Industriële Veiligheid');
    expect(sruRepository.searchCvdr).toHaveBeenCalledWith(
      { q: 'handhaving' },
      { page: 2, signal: expect.any(AbortSignal) },
    );
  });

  it('pushes a new search and resets page', async () => {
    renderPage('/cvdr/zoeken?q=handhaving&pagina=3');
    const input = screen.getByRole('textbox', { name: /zoek in lokale regelgeving/i });
    fireEvent.change(input, { target: { value: '  veiligheid ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zoeken' }));

    await waitFor(() => expect(location().searchParams.get('q')).toBe('veiligheid'));
    expect(location().searchParams.has('pagina')).toBe(false);
    expect(screen.getByRole('textbox', { name: /zoek in lokale regelgeving/i })).toHaveValue('veiligheid');
  });

  it('shows result details and links to CVDR with q', async () => {
    renderPage('/cvdr/zoeken?q=handhaving');
    const link = await screen.findByRole('link', { name: 'Handhavingsbeleid Industriële Veiligheid' });
    expect(link).toHaveAttribute('href', '/cvdr/CVDR744131/2?q=handhaving');
    expect(screen.getByText('regeling · Gemeente Den Haag · CVDR744131')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 resultaat');
  });

  it('shows pagination links and range', async () => {
    renderPage('/cvdr/zoeken?q=wet&pagina=2', { total: 120, records: records(50) });

    expect(await screen.findByText('120 resultaten (51–100)')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('list')).toHaveAttribute('start', '51');
    const paging = screen.getByRole('navigation', { name: 'Paginering' });
    expect(within(paging).getByRole('link', { name: 'Vorige pagina' })).toHaveAttribute('href', '/cvdr/zoeken?q=wet');
    expect(within(paging).getByRole('link', { name: 'Volgende pagina' })).toHaveAttribute(
      'href',
      '/cvdr/zoeken?q=wet&pagina=3',
    );
  });

  it.each(['abc', '0', '-1', '1.5'])('treats pagina=%s as page 1', async (pagina) => {
    renderPage(`/cvdr/zoeken?q=wet&pagina=${pagina}`);
    await screen.findByText('Handhavingsbeleid Industriële Veiligheid');
    expect(sruRepository.searchCvdr).toHaveBeenCalledWith(
      { q: 'wet' },
      { page: 1, signal: expect.any(AbortSignal) },
    );
  });

  it('shows beyond-page message with first-page link', async () => {
    renderPage('/cvdr/zoeken?q=wet&pagina=99', { total: 120, records: [] });
    expect(await screen.findByText(/Geen resultaten op deze pagina/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Naar de eerste pagina' })).toHaveAttribute('href', '/cvdr/zoeken?q=wet');
  });

  it('stays idle without criteria', () => {
    renderPage('/cvdr/zoeken');
    expect(screen.getByText(/Typ een zoekterm om te zoeken/)).toBeInTheDocument();
    expect(sruRepository.searchCvdr).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    vi.mocked(sruRepository.searchCvdr).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/cvdr/zoeken?q=wet']}>
        <CvdrSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Zoeken…');
  });

  it('shows no-results message', async () => {
    renderPage('/cvdr/zoeken?q=zzqqxx', { total: 0, records: [] });
    expect(await screen.findByText('Er zijn geen regelingen gevonden.')).toBeInTheDocument();
  });

  it('shows an error alert on failure', async () => {
    vi.mocked(sruRepository.searchCvdr).mockRejectedValue(new Error('Fetching zoekresultaten failed: 503'));
    render(
      <MemoryRouter initialEntries={['/cvdr/zoeken?q=wet']}>
        <CvdrSearchPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('De zoekdienst is op dit moment niet bereikbaar');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
