import { describe, expect, it } from 'vitest';
import { getCvdrUrl, parseCvdr } from './cvdrRepository';
import { getIllustratieUrl } from './repository';

const cvdrXml = `<?xml version="1.0" encoding="utf-8"?>
<cvdr xmlns="http://standaarden.overheid.nl/cvdr/terms/" xmlns:dcterms="http://purl.org/dc/terms/">
  <meta>
    <owmskern>
      <dcterms:identifier>CVDR744131_2</dcterms:identifier>
      <dcterms:title>Handhavingsbeleid Industriële Veiligheid</dcterms:title>
    </owmskern>
  </meta>
  <body>
    <intitule>Handhavingsbeleid</intitule>
    <regeling>
      <regeling-tekst>
        <hoofdstuk>
          <kop><label>Hoofdstuk</label><nr>1</nr><titel>Inleiding</titel></kop>
          <artikel><kop><nr>1.1</nr></kop><al>Tekst met <vet>nadruk</vet></al></artikel>
        </hoofdstuk>
      </regeling-tekst>
      <bijlage><kop><titel>Bijlage 1</titel></kop></bijlage>
    </regeling>
  </body>
</cvdr>`;

describe('parseCvdr', () => {
  it('maps the body onto a wetgeving, titled from the metadata', () => {
    const wetgeving = parseCvdr(cvdrXml);

    expect(wetgeving.id).toBe('CVDR744131_2');
    expect(wetgeving.citeertitel.text).toEqual(['Handhavingsbeleid Industriële Veiligheid']);
    expect(wetgeving.intitule.text).toEqual(['Handhavingsbeleid']);
    const hoofdstuk = wetgeving.regeling?.regelingTekst.hoofdstuk?.[0];
    expect(hoofdstuk?.kop?.titel?.[0].text).toEqual(['Inleiding']);
    expect(hoofdstuk?.artikel?.[0].structuurAlgemeen).toHaveLength(1);
    expect(wetgeving.regeling?.bijlage).toHaveLength(1);
  });
});

describe('CVDR URLs', () => {
  it('points at the CVDR XML and the illustrations next to it', () => {
    const documentUrl = getCvdrUrl('CVDR744131', '2');
    expect(documentUrl).toBe(
      'https://repository.officiele-overheidspublicaties.nl/CVDR/CVDR744131/2/xml/CVDR744131_2.xml',
    );
    expect(getIllustratieUrl(documentUrl, 'schema 1.png')).toBe(
      'https://repository.officiele-overheidspublicaties.nl/CVDR/CVDR744131/2/xml/schema%201.png',
    );
  });
});
