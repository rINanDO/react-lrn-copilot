import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { wijzigingenRegelingelementDatum } from '../../api/types.gen';
import WtiRegelingLabelView from './wti-regeling-label-view';

afterEach(cleanup);

function renderDatums(datum: wijzigingenRegelingelementDatum[]) {
  render(<WtiRegelingLabelView regelingelement={{ datum }} />);
}

/** The cell texts of each body row. */
function rows(): string[][] {
  return screen
    .getAllByRole('row')
    .slice(2)
    .map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent ?? ''));
}

const STCRT = {
  soort: 'Stcrt',
  publicatiejaar: '2014',
  publicatienummer: '1435',
  urlidentifier: 'stcrt-2014-1435',
  kenmerk: 'J-115787',
};

describe('WtiRegelingLabelView', () => {
  it('renders the grouped headers', () => {
    renderDatums([{ waarde: '2023-02-22' }]);
    expect(screen.getByRole('columnheader', { name: 'Ontstaansbron' })).toHaveAttribute('colspan', '3');
    expect(screen.getByRole('columnheader', { name: 'Inwerkingtreding' })).toHaveAttribute('colspan', '3');
    expect(screen.getAllByRole('columnheader').slice(2).map((th) => th.textContent)).toEqual([
      'Datum van inwerkingtreding',
      'Terugwerkende kracht',
      'Betreft',
      'Ondertekening',
      'Bekendmaking',
      'Kamerstukken',
      'Ondertekening',
      'Bekendmaking',
      'Opmerking',
    ]);
  });

  it('renders every property of a change', () => {
    renderDatums([
      {
        waarde: '2014-01-18',
        details: [
          {
            betreft: 'wijziging',
            terugwerkendeKracht: {
              terugwerkendeKrachtDatum: [{ datumScope: 'tot-en-met', waarde: '2014-01-01' }],
            },
            ontstaansbron: { bron: [{ ondertekening: '2014-01-06', bekendmaking: STCRT }] },
            inwerkingtreding: { bron: [{ ondertekening: '2014-01-07', bekendmaking: STCRT }] },
          },
        ],
      },
    ]);
    expect(rows()).toEqual([
      [
        '18-01-2014',
        't/m 01-01-2014',
        'Wijziging',
        '06-01-2014',
        'Stcrt. 2014, 1435',
        'J-115787',
        '07-01-2014',
        'Stcrt. 2014, 1435',
        '',
      ],
    ]);
    expect(screen.getByRole('columnheader', { name: 'Kenmerk' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Stcrt. 2014, 1435' })[0]).toHaveAttribute(
      'href',
      'https://zoek.officielebekendmakingen.nl/stcrt-2014-1435.html',
    );
  });

  it('joins several bronnen with "samen met"', () => {
    renderDatums([
      {
        waarde: '2032-01-01',
        details: [
          {
            inwerkingtreding: {
              bron: [
                { ondertekening: '2014-05-27', bekendmaking: STCRT },
                { ondertekening: '2016-12-09', bekendmaking: { ...STCRT, publicatiejaar: '2016' } },
              ],
            },
          },
        ],
      },
    ]);
    const [row] = rows();
    expect(row[6]).toBe('27-05-2014samen met09-12-2016');
    expect(row[7]).toBe('Stcrt. 2014, 1435samen metStcrt. 2016, 1435');
  });

  it('shows a pending change without a date, linking its dossier', () => {
    renderDatums([
      {
        details: [{ betreft: 'Aanhangig', ontstaansbron: { bron: [{ dossiernummer: '35924' }] } }],
      },
    ]);
    expect(rows()).toEqual([['', '', 'Aanhangig', '', '', '35924', '', '', '']]);
    expect(screen.getByRole('link', { name: '35924' })).toHaveAttribute(
      'href',
      'https://zoek.officielebekendmakingen.nl/dossier/35924',
    );
    expect(screen.getByRole('columnheader', { name: 'Kamerstukken' })).toBeInTheDocument();
  });

  it('does not link a publication without a url', () => {
    renderDatums([
      {
        waarde: '1848-10-14',
        details: [
          {
            ontstaansbron: {
              bron: [{ bekendmaking: { soort: 'Stb', publicatiejaar: '1848', publicatienummer: '60' } }],
            },
          },
        ],
      },
    ]);
    expect(rows()[0][4]).toBe('Stb. 1848, 60');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('numbers the opmerkingen and lists them below the table', () => {
    renderDatums([
      {
        waarde: '2032-01-01',
        details: [
          { opmerkingen: { opmerking: [{ type: 'Inwtr', al: [{ text: ['Eerste <nadruk>noot</nadruk>'] }] }] } },
        ],
      },
      {
        waarde: '2027-01-01',
        details: [{ opmerkingen: { opmerking: [{ type: 'Alg', al: [{ text: ['Tweede noot'] }] }] } }],
      },
    ]);
    expect(screen.getByRole('link', { name: 'Inwtr. 1' })).toHaveAttribute('href', '#voetnoot_1');
    expect(screen.getByRole('link', { name: 'Alg. 2' })).toHaveAttribute('href', '#voetnoot_2');
    const notes = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(notes.map((note) => note.id)).toEqual(['voetnoot_1', 'voetnoot_2']);
    expect(notes[0]).toHaveTextContent('Eerste noot');
    expect(notes[1]).toHaveTextContent('Tweede noot');
  });

  describe('versions', () => {
    const datum = [
      { waarde: '2032-01-01' },
      { waarde: '2027-01-01' },
      { waarde: '2014-01-18' },
      { waarde: '2013-01-01' },
      { waarde: '1987-06-18' },
    ];
    const versiePaden = new Map([
      ['2027-01-01', '/bwbtt/X/2027-01-01_0'],
      ['2014-01-18', '/bwb/X/2014-01-18_0'],
      ['2013-01-01', '/bwb/X/2013-01-01_0'],
    ]);

    function renderAt(expression: string, items: wijzigingenRegelingelementDatum[] = datum) {
      render(
        <MemoryRouter>
          <WtiRegelingLabelView
            regelingelement={{ datum: items }}
            expression={expression}
            versiePaden={versiePaden}
          />
        </MemoryRouter>,
      );
    }

    function currentDates() {
      return screen
        .getAllByRole('row')
        .filter((row) => row.getAttribute('aria-current') === 'true')
        .map((row) => row.querySelector('td')?.textContent);
    }

    it('marks the latest change on or before the expression', () => {
      renderAt('2026-01-01_0');
      expect(currentDates()).toEqual(['18-01-2014']);
      expect(screen.getByRole('row', { current: true })).toHaveClass('current');
    });

    it('marks a change on the date of the expression', () => {
      renderAt('2013-01-01_0');
      expect(currentDates()).toEqual(['01-01-2013']);
    });

    it('finds the current change when dates are out of order', () => {
      renderAt('2026-01-01_0', [{ waarde: '2013-01-01' }, { waarde: '2014-01-18' }]);
      expect(currentDates()).toEqual(['18-01-2014']);
    });

    it('marks both rows of a date that occurs twice', () => {
      renderAt('2026-01-01_0', [{ waarde: '2014-01-18' }, { waarde: '2014-01-18' }]);
      expect(currentDates()).toEqual(['18-01-2014', '18-01-2014']);
    });

    it('marks nothing when the expression predates every change', () => {
      renderAt('1900-01-01_0');
      expect(currentDates()).toEqual([]);
    });

    it('does not mark a row without a date', () => {
      renderAt('2026-01-01_0', [{ details: [{ betreft: 'Aanhangig' }] }]);
      expect(currentDates()).toEqual([]);
    });

    it('links dates that start a version, except the current one', () => {
      renderAt('2026-01-01_0');
      expect(screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
        ['01-01-2027', '/bwbtt/X/2027-01-01_0'],
        ['01-01-2013', '/bwb/X/2013-01-01_0'],
      ]);
    });
  });

  it('shows no list without opmerkingen', () => {
    renderDatums([{ waarde: '2023-02-22' }]);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('gives a date that occurs twice two rows, and several details a row each', () => {
    renderDatums([
      { waarde: '1983-03-02', details: [{ betreft: 'wijziging' }] },
      { waarde: '1983-03-02', details: [{ betreft: 'nieuw' }, { betreft: 'vervallen' }] },
    ]);
    expect(rows().map((row) => [row[0], row[2]])).toEqual([
      ['02-03-1983', 'Wijziging'],
      ['02-03-1983', 'Nieuw'],
      ['02-03-1983', 'Vervallen'],
    ]);
  });

  it.each([
    ['a datum has neither a waarde nor details', { datum: [{ versieId: '1' }] }],
    ['there is no datum', {}],
  ])('shows a message and no table when %s', (_case, regelingelement) => {
    render(<WtiRegelingLabelView regelingelement={regelingelement} />);
    expect(screen.getByText('Er zijn geen wijzigingen bekend voor dit regelingelement.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
