import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCvdrCql,
  buildBwbCql,
  getSruSearchUrl,
  hasCvdrSearchCriteria,
  hasSearchCriteria,
  parseCvdrSearchResponse,
  parseSearchResponse,
  searchCvdr,
  searchBwb,
  SruDiagnosticError,
} from './sruRepository';

afterEach(() => {
  vi.unstubAllGlobals();
});

// Trimmed from live responses of zoekservice.overheid.nl (2026-10-13). The
// second record has an extra authority to cover repeated `overheid:authority`.
const successXml = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://docs.oasis-open.org/ns/search-ws/sruResponse">
  <version>2.0</version>
  <numberOfRecords>10</numberOfRecords>
  <records>
    <record>
      <recordSchema>http://standaarden.overheid.nl/sru/</recordSchema>
      <recordPacking>xml</recordPacking>
      <recordData>
        <gzd xmlns="http://standaarden.overheid.nl/sru"
             xmlns:dcterms="http://purl.org/dc/terms/"
             xmlns:overheid="http://standaarden.overheid.nl/owms/terms/"
             xmlns:overheidbwb="http://standaarden.overheid.nl/bwb/terms/">
          <originalData>
            <overheidbwb:meta>
              <owmskern>
                <dcterms:identifier>BWBR0001840</dcterms:identifier>
                <dcterms:title>Grondwet</dcterms:title>
                <dcterms:type>wet</dcterms:type>
                <overheid:authority>Binnenlandse Zaken en Koninkrijksrelaties</overheid:authority>
              </owmskern>
              <bwbipm>
                <overheidbwb:toestand>http://wetten.overheid.nl/id/BWBR0001840/2023-02-22/0</overheidbwb:toestand>
                <overheidbwb:geldigheidsperiode_startdatum>2023-02-22</overheidbwb:geldigheidsperiode_startdatum>
                <overheidbwb:geldigheidsperiode_einddatum>9999-12-31</overheidbwb:geldigheidsperiode_einddatum>
              </bwbipm>
            </overheidbwb:meta>
          </originalData>
          <enrichedData>
            <overheidbwb:locatie_toestand>https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0001840/2023-02-22_0/xml/BWBR0001840_2023-02-22_0.xml</overheidbwb:locatie_toestand>
          </enrichedData>
        </gzd>
      </recordData>
      <recordPosition>1</recordPosition>
    </record>
    <record>
      <recordData>
        <gzd xmlns="http://standaarden.overheid.nl/sru"
             xmlns:dcterms="http://purl.org/dc/terms/"
             xmlns:overheid="http://standaarden.overheid.nl/owms/terms/"
             xmlns:overheidbwb="http://standaarden.overheid.nl/bwb/terms/">
          <originalData>
            <overheidbwb:meta>
              <owmskern>
                <dcterms:identifier>BWBR0004712</dcterms:identifier>
                <dcterms:title>Uitvoeringswet ex artikel VI van de Grondwet</dcterms:title>
                <dcterms:type>wet</dcterms:type>
                <overheid:authority>Binnenlandse Zaken en Koninkrijksrelaties</overheid:authority>
                <overheid:authority>Justitie en Veiligheid</overheid:authority>
              </owmskern>
              <bwbipm>
                <overheidbwb:toestand>not-a-toestand-id</overheidbwb:toestand>
                <overheidbwb:geldigheidsperiode_startdatum>1992-07-01</overheidbwb:geldigheidsperiode_startdatum>
                <overheidbwb:geldigheidsperiode_einddatum>2030-01-01</overheidbwb:geldigheidsperiode_einddatum>
              </bwbipm>
            </overheidbwb:meta>
          </originalData>
          <enrichedData>
            <overheidbwb:locatie_toestand>https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0004712/1992-07-01_0/xml/BWBR0004712_1992-07-01_0.xml</overheidbwb:locatie_toestand>
          </enrichedData>
        </gzd>
      </recordData>
      <recordPosition>2</recordPosition>
    </record>
    <record>
      <recordData>
        <gzd xmlns="http://standaarden.overheid.nl/sru" xmlns:dcterms="http://purl.org/dc/terms/">
          <originalData><dcterms:title>Without identifier</dcterms:title></originalData>
        </gzd>
      </recordData>
    </record>
  </records>
  <nextRecordPosition>3</nextRecordPosition>
</searchRetrieveResponse>`;

const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://docs.oasis-open.org/ns/search-ws/sruResponse">
  <version>2.0</version>
  <numberOfRecords>0</numberOfRecords>
</searchRetrieveResponse>`;

const diagnosticsXml = `<?xml version="1.0" encoding="UTF-8"?>
<diagnostics xmlns="http://docs.oasis-open.org/ns/search-ws/sruResponse">
  <diagnostic xmlns="http://docs.oasis-open.org/ns/search-ws/diagnostic">
    <uri>info:srw/diagnostic/1/16</uri>
    <details>cql.serverChoice</details>
    <message>Unsupported index</message>
  </diagnostic>
</diagnostics>`;

const cvdrSuccessXml = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://docs.oasis-open.org/ns/search-ws/sruResponse">
  <version>2.0</version>
  <numberOfRecords>2</numberOfRecords>
  <records>
    <record>
      <recordData>
        <gzd xmlns="http://standaarden.overheid.nl/sru"
             xmlns:dcterms="http://purl.org/dc/terms/"
             xmlns:overheid="http://standaarden.overheid.nl/owms/terms/"
             xmlns:overheidcvdr="http://standaarden.overheid.nl/cvdr/terms/">
          <originalData>
            <meta>
              <owmskern>
                <dcterms:identifier>CVDR744131_2</dcterms:identifier>
                <dcterms:title>Handhavingsbeleid Industriële Veiligheid</dcterms:title>
                <dcterms:type>regeling</dcterms:type>
                <overheid:authority>Gemeente Den Haag</overheid:authority>
              </owmskern>
            </meta>
          </originalData>
        </gzd>
      </recordData>
    </record>
    <record>
      <recordData>
        <gzd xmlns="http://standaarden.overheid.nl/sru"
             xmlns:dcterms="http://purl.org/dc/terms/"
             xmlns:overheidcvdr="http://standaarden.overheid.nl/cvdr/terms/">
          <originalData>
            <meta>
              <owmskern>
                <dcterms:title>Via locatie</dcterms:title>
              </owmskern>
            </meta>
          </originalData>
          <enrichedData>
            <overheidcvdr:locatie_toestand>https://repository.officiele-overheidspublicaties.nl/CVDR/CVDR123456/7/xml/CVDR123456_7.xml</overheidcvdr:locatie_toestand>
          </enrichedData>
        </gzd>
      </recordData>
    </record>
  </records>
</searchRetrieveResponse>`;

const DATE_CLAUSES =
  'overheidbwb.geldigheidsdatum==2026-10-13 and overheidbwb.zichtdatum==2026-10-13';

describe('buildBwbCql', () => {
  it('searches all title words in the current toestanden', () => {
    expect(buildBwbCql({ q: '  bescherming   persoonsgegevens ' }, '2026-10-13')).toBe(
      `overheidbwb.titel all "bescherming persoonsgegevens" and ${DATE_CLAUSES}`,
    );
  });

  it('builds a query from filters only', () => {
    expect(
      buildBwbCql({ ministerie: 'justitie en veiligheid', rechtsgebied: 'strafrecht', q: ' ' }, '2026-10-13'),
    ).toBe(
      `overheid.authority=="justitie en veiligheid" and overheidbwb.rechtsgebied=="strafrecht" and ${DATE_CLAUSES}`,
    );
  });

  it('combines the title with all filters in a fixed order', () => {
    expect(
      buildBwbCql(
        { rechtsgebied: 'strafrecht', ministerie: 'justitie en veiligheid', soort: 'AMvB', q: 'wet' },
        '2026-10-13',
      ),
    ).toBe(
      'overheidbwb.titel all "wet" and dcterms.type=="AMvB" and overheid.authority=="justitie en veiligheid"' +
        ` and overheidbwb.rechtsgebied=="strafrecht" and ${DATE_CLAUSES}`,
    );
  });

  it('escapes quotes and other special characters', () => {
    expect(buildBwbCql({ q: 'wet "x" a\\b c*? ^' }, '2026-10-13')).toBe(
      `overheidbwb.titel all "wet \\"x\\" a\\\\b c\\*\\? \\^" and ${DATE_CLAUSES}`,
    );
  });

  it('replaces control characters, which the service rejects, by spaces', () => {
    expect(buildBwbCql({ q: 'a\bb\u0000c\u007f' }, '2026-10-13')).toBe(
      `overheidbwb.titel all "a b c" and ${DATE_CLAUSES}`,
    );
    expect(hasSearchCriteria({ q: '\u0007' })).toBe(false);
  });
});

describe('hasSearchCriteria', () => {
  it('is false for blank criteria and true for a text or filter', () => {
    expect(hasSearchCriteria({})).toBe(false);
    expect(hasSearchCriteria({ q: '  ' })).toBe(false);
    expect(hasSearchCriteria({ q: 'wet' })).toBe(true);
    expect(hasSearchCriteria({ soort: 'wet' })).toBe(true);
  });
});

describe('CVDR criteria', () => {
  it('builds title-only CQL and detects blank criteria', () => {
    expect(buildCvdrCql({ q: '  handhaving   veiligheid ' })).toBe(
      'dcterms.title all "handhaving veiligheid"',
    );
    expect(hasCvdrSearchCriteria({ q: '   ' })).toBe(false);
    expect(hasCvdrSearchCriteria({ q: 'veiligheid' })).toBe(true);
  });
});

describe('getSruSearchUrl', () => {
  it('builds a searchRetrieve request for the BWB collection', () => {
    const url = new URL(getSruSearchUrl('overheidbwb.titel all "wet"', 101, 50, 'BWB'));
    expect(url.origin + url.pathname).toBe('https://zoekservice.overheid.nl/sru/Search');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      operation: 'searchRetrieve',
      version: '2.0',
      'x-connection': 'BWB',
      query: 'overheidbwb.titel all "wet"',
      startRecord: '101',
      maximumRecords: '50',
    });
  });

  it('builds a searchRetrieve request for the CVDR collection', () => {
    const url = new URL(getSruSearchUrl('dcterms.title all "veiligheid"', 1, 50, 'CVDR'));
    expect(url.searchParams.get('x-connection')).toBe('CVDR');
  });
});

describe('parseSearchResponse', () => {
  it('maps the records', () => {
    expect(parseSearchResponse(successXml)).toEqual({
      total: 10,
      records: [
        {
          bwbId: 'BWBR0001840',
          title: 'Grondwet',
          type: 'wet',
          authorities: ['Binnenlandse Zaken en Koninkrijksrelaties'],
          expression: '2023-02-22_0',
          geldigVanaf: '2023-02-22',
          geldigTot: undefined,
        },
        {
          bwbId: 'BWBR0004712',
          title: 'Uitvoeringswet ex artikel VI van de Grondwet',
          type: 'wet',
          authorities: ['Binnenlandse Zaken en Koninkrijksrelaties', 'Justitie en Veiligheid'],
          expression: '1992-07-01_0',
          geldigVanaf: '1992-07-01',
          geldigTot: '2030-01-01',
        },
      ],
    });
  });

  it('returns no records for an empty result', () => {
    expect(parseSearchResponse(emptyXml)).toEqual({ total: 0, records: [] });
  });

  it('throws an SruDiagnosticError for a diagnostics answer', () => {
    expect(() => parseSearchResponse(diagnosticsXml)).toThrow(SruDiagnosticError);
    try {
      parseSearchResponse(diagnosticsXml);
    } catch (error) {
      expect((error as SruDiagnosticError).technical).toBe(
        'info:srw/diagnostic/1/16 – Unsupported index – cql.serverChoice',
      );
    }
  });
});

describe('searchBwb', () => {
  it('requests XML for the given page and parses the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(emptyXml, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchBwb({ q: 'grondwet' }, { page: 3, date: '2026-10-13' })).resolves.toEqual({
      total: 0,
      records: [],
    });

    const [url, init] = fetchMock.mock.calls[0];
    const params = new URL(url).searchParams;
    expect(params.get('startRecord')).toBe('101');
    expect(params.get('maximumRecords')).toBe('50');
    expect(params.get('query')).toBe(`overheidbwb.titel all "grondwet" and ${DATE_CLAUSES}`);
    expect(init.headers).toEqual({ Accept: 'application/xml' });
  });

  it('rejects on an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503, statusText: 'Unavailable' })));
    await expect(searchBwb({ q: 'grondwet' })).rejects.toThrow('503');
  });
});

describe('parseCvdrSearchResponse', () => {
  it('maps CVDR records from identifier and location fallback', () => {
    expect(parseCvdrSearchResponse(cvdrSuccessXml)).toEqual({
      total: 2,
      records: [
        {
          cvdrId: 'CVDR744131',
          expression: '2',
          title: 'Handhavingsbeleid Industriële Veiligheid',
          type: 'regeling',
          authority: 'Gemeente Den Haag',
        },
        {
          cvdrId: 'CVDR123456',
          expression: '7',
          title: 'Via locatie',
          type: undefined,
          authority: undefined,
        },
      ],
    });
  });

  it('throws an SruDiagnosticError for diagnostics', () => {
    expect(() => parseCvdrSearchResponse(diagnosticsXml)).toThrow(SruDiagnosticError);
  });
});

describe('searchCvdr', () => {
  it('requests the CVDR collection and parses the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(cvdrSuccessXml, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCvdr({ q: 'veiligheid' }, { page: 2 })).resolves.toEqual({
      total: 2,
      records: [
        {
          cvdrId: 'CVDR744131',
          expression: '2',
          title: 'Handhavingsbeleid Industriële Veiligheid',
          type: 'regeling',
          authority: 'Gemeente Den Haag',
        },
        {
          cvdrId: 'CVDR123456',
          expression: '7',
          title: 'Via locatie',
          type: undefined,
          authority: undefined,
        },
      ],
    });

    const [url] = fetchMock.mock.calls[0];
    const params = new URL(url).searchParams;
    expect(params.get('x-connection')).toBe('CVDR');
    expect(params.get('startRecord')).toBe('51');
    expect(params.get('query')).toBe('dcterms.title all "veiligheid"');
  });
});
