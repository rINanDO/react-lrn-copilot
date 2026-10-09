import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BwbToestandHeader from './bwb-toestand-header';
import type { Citeertitel } from '../../api';
import * as wettenRepository from '../../api/wettenRepository';

vi.mock('../../api/wettenRepository', () => ({
  getManifest: vi.fn(),
}));

const citeertitel = { text: ['Wet op de belastingen'] } as unknown as Citeertitel;

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(wettenRepository.getManifest).mockResolvedValue({ bwbId: 'BWBR0001840', expressions: [] });
});

function renderHeader(isToekomstig: boolean) {
  render(
    <MemoryRouter>
      <BwbToestandHeader
        bwbId="BWBR0001840"
        expression="2026-01-01_0"
        isToekomstig={isToekomstig}
        citeertitel={citeertitel}
      />
    </MemoryRouter>,
  );
}

describe('BwbToestandHeader', () => {
  it('shows the citeertitel as main heading', () => {
    renderHeader(false);
    expect(screen.getByRole('heading', { level: 1, name: 'Wet op de belastingen' })).toBeInTheDocument();
  });

  it('opens the version dialog for a current toestand', async () => {
    renderHeader(false);
    expect(wettenRepository.getManifest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Andere versies' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Versies van BWBR0001840');
  });

  it('offers no other versions for a future toestand', () => {
    renderHeader(true);
    expect(screen.queryByRole('button', { name: 'Andere versies' })).not.toBeInTheDocument();
  });
});
