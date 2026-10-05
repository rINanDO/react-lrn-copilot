import { describe, expect, it } from 'vitest';
import { parseManifest } from './wettenRepository';

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
});
