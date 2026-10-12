import type { Artikel, Paragraaf, SubParagraaf } from "../../api";
import KopView from "./kop-view";
import ArtikelView from "./artikel-view";
import StructuurtekstView from "./structuurtekst-view";
import SubparagraafView from "./subparagraaf-view";

function ParagraafView({ paragraaf }: { paragraaf?: Paragraaf }) {
  if (!paragraaf) {
    return <></>;
  }
  const kopId = `${paragraaf.id}_kop`;
  return (
    <div className="paragraaf">
      <div className="article__header--law paragraaf">
        <KopView id={kopId} headingLevel={4} kop={paragraaf.kop} />
      </div>
      <StructuurtekstView
        structuurtekst={paragraaf.structuurtekst}
      ></StructuurtekstView>
      {paragraaf.artikel?.map((artikel: Artikel, index: number) => (
        <ArtikelView
          key={`${paragraaf.id}_artikel_${index}`}
          artikel={artikel}
        />
      ))}
      {paragraaf.subParagraaf?.map(
        (subparagraaf: SubParagraaf, index: number) => (
          <SubparagraafView
            key={`${paragraaf.id}_subparagraaf_${index}`}
            subparagraaf={subparagraaf}
          />
        ),
      )}
    </div>
  );
}

export default ParagraafView;
