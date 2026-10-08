import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SideBar from './side-bar';
import type { Wetgeving, Wettekst } from '../../api';

afterEach(cleanup);

/** Wraps a `Wettekst`-shaped TOC into the `Wetgeving` SideBar actually takes. */
function wetgevingWith(wettekst: Wettekst): Wetgeving {
  return { regeling: { regelingTekst: wettekst } } as unknown as Wetgeving;
}

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
    render(<SideBar wetgeving={wetgevingWith(toc)} />);
    const toggle = screen.getByRole('button', { name: 'Toon onderliggende' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('lijst-H1')).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Verberg onderliggende');
    expect(document.getElementById('lijst-H1')).toBeVisible();
  });

  it('does not render folded items until they are unfolded', () => {
    render(<SideBar wetgeving={wetgevingWith(toc)} />);
    expect(document.getElementById('TOC_A1')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Toon onderliggende' }));
    expect(document.getElementById('TOC_A1')).toBeInTheDocument();
  });

  it('shows no toggle for items without children', () => {
    render(<SideBar wetgeving={wetgevingWith(toc)} />);
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
        wetgeving={wetgevingWith({
          hoofdstuk: [
            {
              id: 'H2',
              kop: { label: ['Hoofdstuk'], nr: [{ text: ['2'] }] },
              paragraaf: [paragraaf('1', ['2.51', '2.52']), paragraaf('2', ['2.54'])],
            },
          ],
        } as unknown as Wettekst)}
      />,
    );
    expect(screen.getByText('(Artikelen 2.51-2.54)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toon onderliggende' }));
    expect(screen.getByText('(Artikelen 2.51-2.52)')).toBeInTheDocument();
    expect(screen.getByText('(Artikel 2.54)')).toBeInTheDocument();
  });
});
