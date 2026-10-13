import { describe, expect, it } from 'vitest';
import { MINISTERIE_OPTIONS, RECHTSGEBIED_OPTIONS, SOORT_OPTIONS } from './bwb-search-options';

describe('bwb search options', () => {
  it.each([
    ['regelingsoort', SOORT_OPTIONS],
    ['eerstverantwoordelijke', MINISTERIE_OPTIONS],
    ['rechtsgebied', RECHTSGEBIED_OPTIONS],
  ])('lists each %s once, in Dutch order', (_name, options) => {
    const values = options.map((option) => option.value);
    expect(new Set(values).size).toBe(values.length);
    expect([...values].sort((a, b) => a.localeCompare(b, 'nl'))).toEqual(values);
  });

  it('keeps the casing of the regelingsoort', () => {
    expect(SOORT_OPTIONS).toContainEqual({ value: 'AMvB', label: 'AMvB' });
    expect(SOORT_OPTIONS).toContainEqual({ value: 'wet', label: 'wet' });
  });

  it('keeps lowercase values and capitalises the label', () => {
    expect(MINISTERIE_OPTIONS).toContainEqual({ value: 'justitie en veiligheid', label: 'Justitie en veiligheid' });
    expect(RECHTSGEBIED_OPTIONS).toContainEqual({ value: 'strafrecht', label: 'Strafrecht' });
  });
});
