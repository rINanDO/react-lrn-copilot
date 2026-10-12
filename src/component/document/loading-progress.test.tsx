import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LoadingProgress from './loading-progress';

afterEach(cleanup);

describe('LoadingProgress', () => {
  it('shows the received and total size when the total is known', () => {
    render(<LoadingProgress progress={{ phase: 'downloading', loaded: 3_500_000, total: 14_000_000 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Regeling laden… 3,5 van 14,0 MB');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('shows only the received size and an indeterminate bar when the total is unknown', () => {
    render(<LoadingProgress progress={{ phase: 'downloading', loaded: 1_500_000 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Regeling laden… 1,5 MB');
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('shows the parsing phase', () => {
    render(<LoadingProgress progress={{ phase: 'parsing', loaded: 1_500_000 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Regeling verwerken…');
  });
});
