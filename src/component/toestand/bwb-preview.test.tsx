import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BwbPreviewContent } from './bwb-preview';
import * as wettenRepository from '../../api/wettenRepository';

vi.mock('../../api/wettenRepository', () => ({
  getToestand: vi.fn(),
}));

const mockToestand = {
  wetgeving: {
    citeertitel: { text: ['Wet op de belastingen'] },
    regeling: {
      regelingTekst: {},
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(wettenRepository.getToestand).mockResolvedValue(
    mockToestand as unknown as Awaited<ReturnType<typeof wettenRepository.getToestand>>,
  );
});

describe('BwbPreviewContent', () => {
  it('calls the API with the correct parameters', async () => {
    render(<BwbPreviewContent bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={false} />);
    await waitFor(() => {
      expect(wettenRepository.getToestand).toHaveBeenCalledWith('BWBR0001840', '2026-01-01_0');
    });
  });

  it('shows an error alert when the API call fails', async () => {
    vi.mocked(wettenRepository.getToestand).mockRejectedValue(new Error('Not found'));
    render(<BwbPreviewContent bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={false} />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('renders the citeertitel once loaded', async () => {
    render(<BwbPreviewContent bwbId="BWBR0001840" expression="2026-01-01_0" isToekomstig={true} />);
    await waitFor(() => {
      expect(screen.getByText('Wet op de belastingen')).toBeInTheDocument();
    });
  });
});
