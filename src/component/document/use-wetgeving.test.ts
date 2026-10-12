import { describe, expect, it } from 'vitest';
import { toLoadError } from './use-wetgeving';

describe('toLoadError', () => {
  it('uses the generic message with technical detail for non-errors', () => {
    expect(toLoadError('boom')).toEqual({
      message: 'Er is een fout opgetreden bij het laden van de regeling.',
      technical: 'boom',
    });
  });
});
