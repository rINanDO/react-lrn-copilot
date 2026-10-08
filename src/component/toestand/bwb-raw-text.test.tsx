import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BwbRawText from './bwb-raw-text';

afterEach(cleanup);

describe('BwbRawText', () => {
  it('renders plain text as is', () => {
    const { container } = render(<BwbRawText id="t" rawText="Algemene bepalingen" />);
    expect(container.innerHTML).toBe('Algemene bepalingen');
  });

  it('decodes entities', () => {
    const { container } = render(<BwbRawText id="t" rawText={'Lucht &amp; water'} />);
    expect(container.textContent).toBe('Lucht & water');
  });

  it('renders markup', () => {
    const { container } = render(<BwbRawText id="t" rawText={'een <nadruk type="vet">vette</nadruk> tekst'} />);
    expect(container.innerHTML).toBe('een <strong>vette</strong> tekst');
  });
});
