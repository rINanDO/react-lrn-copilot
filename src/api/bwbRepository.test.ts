import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getToestand,
  getWetTechnischeInformatie,
  getWetTechnischeInformatieUrl,
  parseManifest,
  parseWetTechnischeInformatie,
} from './bwbRepository';
import type { LoadProgress } from './repository';

afterEach(() => {
  vi.unstubAllGlobals();
});

const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<work label="BWBR0001840" _latestItem="2005-02-08_0/xml/BWBR0001840_2005-02-08_0.xml">
  <metadata><datum_inwerkingtreding>1840-09-12</datum_inwerkingtreding></metadata>
  <expression label="2002-03-21_0">
    <metadata>
      <datum_inwerkingtreding>2002-03-21</datum_inwerkingtreding>
      <einddatum>2005-02-07</einddatum>
    </metadata>
    <manifestation label="xml"><item label="BWBR0001840_2002-03-21_0.xml" _deleted="false" /></manifestation>
  </expression>
  <expression label="2004-01-01_0">
    <metadata><datum_inwerkingtreding>2004-01-01</datum_inwerkingtreding></metadata>
    <manifestation label="xml"><item label="BWBR0001840_2004-01-01_0.xml" _deleted="true" /></manifestation>
  </expression>
  <expression label="2005-02-08_0">
    <metadata><datum_inwerkingtreding>2005-02-08</datum_inwerkingtreding></metadata>
    <manifestation label="xml"><item label="BWBR0001840_2005-02-08_0.xml" _deleted="false" /></manifestation>
  </expression>
</work>`;

describe('parseManifest', () => {
  it('lists the expressions that are not deleted', () => {
    expect(parseManifest(manifestXml)).toEqual({
      bwbId: 'BWBR0001840',
      expressions: [
        { label: '2002-03-21_0', datumInwerkingtreding: '2002-03-21', einddatum: '2005-02-07' },
        { label: '2005-02-08_0', datumInwerkingtreding: '2005-02-08', einddatum: undefined },
      ],
    });
  });

  it('orders the expressions chronologically', () => {
    const xml = `<work label="BWBR0011353">${['2025-01-01_4', '2026-02-21_0', '2025-01-01_10', '2024-06-01_0']
      .map(
        (label) =>
          `<expression label="${label}"><manifestation label="xml"><item label="x.xml" _deleted="false" /></manifestation></expression>`,
      )
      .join('')}</work>`;
    expect(parseManifest(xml).expressions.map((expression) => expression.label)).toEqual([
      '2024-06-01_0',
      '2025-01-01_4',
      '2025-01-01_10',
      '2026-02-21_0',
    ]);
  });
});

describe('getToestand', () => {
  it('reports the download progress before parsing', async () => {
    const chunks = ['<toestand bwb-id="BWBR0041330">', '</toestand>'].map((chunk) =>
      new TextEncoder().encode(chunk),
    );
    const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(chunk));
        controller.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(body, { headers: { 'Content-Length': String(total) } })),
    );

    const progress: LoadProgress[] = [];
    const toestand = await getToestand('BWBR0041330', '2026-07-01_0', false, {
      onProgress: (update) => progress.push(update),
    });

    expect(toestand.bwbId).toBe('BWBR0041330');
    expect(progress).toEqual([
      { phase: 'downloading', loaded: chunks[0].byteLength, total },
      { phase: 'downloading', loaded: total, total },
      { phase: 'parsing', loaded: total, total },
    ]);
  });
});

const wtiXml = `<?xml version="1.0" encoding="utf-8"?>
<wetstechnische-informatie xmlns:dcterms="http://purl.org/dc/terms/" xmlns:overheid="http://standaarden.overheid.nl/owms/terms/" xmlns:owms="http://standaarden.overheid.nl/bwb/owms/" bwb-id="BWBR0001840">
  <algemene-informatie gegenereerd="2026-10-20T04:27:32">
    <afkortingen><afkorting>GW</afkorting><afkorting>Gw</afkorting></afkortingen>
    <citeertitel status="officieel">Grondwet</citeertitel>
    <citeertitels><citeertitel status="officieel" geldig-van="1840-09-12" geldig-tot="9999-12-31">Grondwet</citeertitel></citeertitels>
    <soort-regeling>wet</soort-regeling>
    <opmerkingen><opmerking type="x"><al>Een <nadruk type="vet">opmerking</nadruk></al></opmerking></opmerkingen>
  </algemene-informatie>
  <gerelateerde-regelgeving gegenereerd="2026-10-20T04:27:32">
    <regeling>
      <grondslag-voor>
        <gerelateerde-regeling bwb-id="BWBR0002222" geldig-van="2000-01-01"><extref doc="jci1.3:c:BWBR0002222" bwb-id="BWBR0002222">Een wet</extref></gerelateerde-regeling>
      </grondslag-voor>
      <verwijzing-door>
        <gerelateerd-regelingelement bwb-id="BWBR0003333"><extref label-id="12">Artikel 1</extref></gerelateerd-regelingelement>
      </verwijzing-door>
    </regeling>
  </gerelateerde-regelgeving>
  <wijzigingen gegenereerd="2026-10-20T04:27:32">
    <regelingelementen>
      <regelingelement label-id="7">
        <datum waarde="2002-03-21" versie-id="3" label="Artikel 1">
          <details isvoorafgaand="true">
            <betreft>wijziging</betreft>
            <ontstaansbron><bron type="Stb" istotstandkoming="false"><bekendmaking soort="Stb"><publicatiejaar>2002</publicatiejaar><kenmerk>1</kenmerk></bekendmaking></bron></ontstaansbron>
            <terugwerkende-kracht><terugwerkende-kracht-datum datum-scope="geheel" waarde="2002-01-01"/></terugwerkende-kracht>
          </details>
        </datum>
      </regelingelement>
    </regelingelementen>
  </wijzigingen>
  <owms:meta owms-version="4.0">
    <owms:kern>
      <dcterms:identifier>BWBR0001840</dcterms:identifier>
      <dcterms:title xml:lang="nl">Grondwet</dcterms:title>
      <dcterms:type>wet</dcterms:type>
      <overheid:authority>Koninkrijk</overheid:authority>
    </owms:kern>
  </owms:meta>
</wetstechnische-informatie>`;

describe('getWetTechnischeInformatieUrl', () => {
  it('points to the .wti document of the work', () => {
    expect(getWetTechnischeInformatieUrl('BWBR0001840')).toBe(
      'https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0001840/BWBR0001840.wti',
    );
  });
});

describe('parseWetTechnischeInformatie', () => {
  const wti = parseWetTechnischeInformatie(wtiXml);

  it('maps attributes and hyphenated elements onto camelCase fields', () => {
    expect(wti.bwbId).toBe('BWBR0001840');
    expect(wti.algemeneInformatie?.gegenereerd).toBe('2026-10-20T04:27:32');
    expect(wti.algemeneInformatie?.soortRegeling).toBe('wet');
    expect(wti.algemeneInformatie?.citeertitel).toEqual({ status: 'officieel', text: 'Grondwet' });
    expect(wti.algemeneInformatie?.citeertitels?.citeertitel?.[0]).toEqual({
      status: 'officieel',
      geldigVan: '1840-09-12',
      geldigTot: '9999-12-31',
      text: 'Grondwet',
    });
  });

  it('keeps every item of a wrapped list', () => {
    expect(wti.algemeneInformatie?.afkortingen?.afkorting).toEqual(['GW', 'Gw']);
  });

  it('keeps the inner XML of an al', () => {
    const opmerking = wti.algemeneInformatie?.opmerkingen?.opmerking?.[0];
    expect(opmerking?.type).toBe('x');
    expect(opmerking?.al?.[0].text?.[0]).toContain('<nadruk');
  });

  it('maps the related regulations', () => {
    const regeling = wti.gerelateerdeRegelgeving?.regeling;
    const gerelateerd = regeling?.grondslagVoor?.gerelateerdeRegeling?.[0];
    expect(gerelateerd?.bwbId).toBe('BWBR0002222');
    expect(gerelateerd?.extref?.text).toBe('Een wet');
    expect(regeling?.verwijzingDoor?.gerelateerdRegelingelement?.[0].extref?.labelId).toBe('12');
  });

  it('maps the changes, with booleans as booleans', () => {
    const datum = wti.wijzigingen?.regelingelementen?.regelingelement?.[0].datum?.[0];
    expect(datum).toMatchObject({ waarde: '2002-03-21', versieId: '3', label: 'Artikel 1' });
    const details = datum?.details?.[0];
    expect(details?.isvoorafgaand).toBe(true);
    expect(details?.ontstaansbron?.bron?.[0].istotstandkoming).toBe(false);
    expect(details?.ontstaansbron?.bron?.[0].bekendmaking?.kenmerk).toBe('1');
    expect(details?.terugwerkendeKracht?.terugwerkendeKrachtDatum?.[0]).toEqual({
      datumScope: 'geheel',
      waarde: '2002-01-01',
    });
  });

  it('maps the namespaced metadata', () => {
    expect(wti.meta?.owmsVersion).toBe('4.0');
    expect(wti.meta?.kern?.title).toEqual({ lang: 'nl', text: 'Grondwet' });
    expect(wti.meta?.kern?.type?.[0].text).toBe('wet');
    expect(wti.meta?.kern?.authority?.text).toBe('Koninkrijk');
  });
});

describe('getWetTechnischeInformatie', () => {
  it('fetches the .wti document and maps it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(wtiXml));
    vi.stubGlobal('fetch', fetchMock);

    const wti = await getWetTechnischeInformatie('BWBR0001840');

    expect(fetchMock.mock.calls[0][0]).toBe(getWetTechnischeInformatieUrl('BWBR0001840'));
    expect(wti.bwbId).toBe('BWBR0001840');
  });

  it('fails when the document cannot be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404, statusText: 'Not Found' })));

    await expect(getWetTechnischeInformatie('BWBR0000000')).rejects.toThrow(
      'Fetching wetstechnische informatie BWBR0000000 failed: 404 Not Found',
    );
  });
});
