import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BwbExpressionsModal from './bwb-expressions-modal';
import * as wettenRepository from '../../api/wettenRepository';

vi.mock('../../api/wettenRepository', () => ({
  getManifest: vi.fn(),
}));

// 25 expressions, 2001-01-01_0 .. 2025-01-01_0.
const expressions = Array.from({ length: 25 }, (_, i) => {
  const year = 2001 + i;
  return { label: `${year}-01-01_0`, datumInwerkingtreding: `${year}-01-01` };
});

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(wettenRepository.getManifest).mockResolvedValue({
    bwbId: 'BWBR0001840',
    expressions,
  });
});

function renderModal(expression: string) {
  render(
    <MemoryRouter>
      <BwbExpressionsModal bwbId="BWBR0001840" expression={expression} open onClose={() => {}} />
    </MemoryRouter>,
  );
}

describe('BwbExpressionsModal', () => {
  it('opens on the page holding the current expression and highlights it', async () => {
    // Newest first, so 2003 is the 23rd item: page 3.
    renderModal('2003-01-01_0');
    const current = await screen.findByRole('link', { current: 'page' });
    expect(current).toHaveTextContent('2003-01-01_0');
    expect(screen.queryByText('2025-01-01_0')).toBeNull();
  });

  it('filters by search and returns to the first page', async () => {
    renderModal('2003-01-01_0');
    await screen.findByText('2003-01-01_0');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Zoek versie of datum' }), { target: { value: '201' } });
    expect(screen.getByText('10 van 25 versies')).toBeInTheDocument();
    expect(screen.getByText('2019-01-01_0')).toBeInTheDocument();
    expect(screen.queryByText('2003-01-01_0')).toBeNull();
  });
});
