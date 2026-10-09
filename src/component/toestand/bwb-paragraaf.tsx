import type { Artikel, Paragraaf, SubParagraaf } from "../../api";
import BwbKop from "./bwb-kop";
import BwbArtikel from "./bwb-artikel";
import BwbStructuurtekst from "./bwb-structuurtekst";
import BwbSubParagraaf from "./bwb-subparagraaf";

function BwbParagraaf({ paragraaf }: { paragraaf?: Paragraaf }) {
  if (!paragraaf) {
    return <></>;
  }
  const kopId = `${paragraaf.id}_kop`;
  return (
    <div className="paragraaf">
      <div className="article__header--law paragraaf">
        <BwbKop id={kopId} headingLevel={4} kop={paragraaf.kop} />
      </div>
      <BwbStructuurtekst
        structuurtekst={paragraaf.structuurtekst}
      ></BwbStructuurtekst>
      {paragraaf.artikel?.map((artikel: Artikel, index: number) => (
        <BwbArtikel
          key={`${paragraaf.id}_artikel_${index}`}
          artikel={artikel}
        />
      ))}
      {paragraaf.subParagraaf?.map(
        (subparagraaf: SubParagraaf, index: number) => (
          <BwbSubParagraaf
            key={`${paragraaf.id}_subparagraaf_${index}`}
            subparagraaf={subparagraaf}
          />
        ),
      )}
    </div>
  );
}

export default BwbParagraaf;
