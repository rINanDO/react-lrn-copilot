import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SideBar from './side-bar';
import type { Wettekst } from '../../api';

afterEach(cleanup);

const toc = {
  hoofdstuk: [
    {
      id: 'H1',
      kop: { label: ['Hoofdstuk'], nr: [{ text: ['1'] }], titel: [{ text: ['Grondrechten'] }] },
      artikel: [{ id: 'A1', kop: { label: ['Artikel'], nr: [{ text: ['1'] }] } }],
    },
  ],
} as unknown as Wettekst;

describe('SideBar', () => {
  it('folds and unfolds the nested items', () => {
    render(<SideBar toc={toc} />);
    const toggle = screen.getByRole('button', { name: 'Toon onderliggende' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('lijst-H1')).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Verberg onderliggende');
    expect(document.getElementById('lijst-H1')).toBeVisible();
  });

  it('shows no toggle for items without children', () => {
    render(<SideBar toc={toc} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toon onderliggende' }));
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('shows the range of articles under a chapter and paragraph', () => {
    const artikel = (nr: string) => ({ id: `A${nr}`, kop: { label: ['Artikel'], nr: [{ text: [nr] }] } });
    const paragraaf = (nr: string, artikelen: string[]) => ({
      id: `P${nr}`,
      kop: { label: ['Paragraaf'], nr: [{ text: [nr] }] },
      artikel: artikelen.map(artikel),
    });
    render(
      <SideBar
        toc={
          {
            hoofdstuk: [
              {
                id: 'H2',
                kop: { label: ['Hoofdstuk'], nr: [{ text: ['2'] }] },
                paragraaf: [paragraaf('1', ['2.51', '2.52']), paragraaf('2', ['2.54'])],
              },
            ],
          } as unknown as Wettekst
        }
      />,
    );
    expect(screen.getByText('(Artikelen 2.51-2.54)')).toBeInTheDocument();
    expect(screen.getByText('(Artikelen 2.51-2.52)')).toBeInTheDocument();
    expect(screen.getByText('(Artikel 2.54)')).toBeInTheDocument();
  });
});
