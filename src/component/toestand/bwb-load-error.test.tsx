import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BwbLoadError from './bwb-load-error';

afterEach(cleanup);

describe('BwbLoadError', () => {
  it('shows the message in an alert', () => {
    render(<BwbLoadError error={{ message: 'Not found' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Not found');
  });

  it('shows the technical detail in development builds', () => {
    render(<BwbLoadError error={{ message: 'Fout', technical: 'boom' }} />);
    // Vitest runs with import.meta.env.DEV set.
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });
});
