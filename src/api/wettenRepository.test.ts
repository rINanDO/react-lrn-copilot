import { afterEach, describe, expect, it, vi } from 'vitest';
import { getToestand, parseManifest, type ToestandProgress } from './wettenRepository';

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

    const progress: ToestandProgress[] = [];
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
