import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LoadError from './load-error';

afterEach(cleanup);

describe('LoadError', () => {
  it('shows the message in an alert', () => {
    render(<LoadError error={{ message: 'Not found' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Not found');
  });

  it('shows the technical detail in development builds', () => {
    render(<LoadError error={{ message: 'Fout', technical: 'boom' }} />);
    // Vitest runs with import.meta.env.DEV set.
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });
});
