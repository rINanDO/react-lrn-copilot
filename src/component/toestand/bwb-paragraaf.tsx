import type { Artikel, Hoofdstuk, Paragraaf, SubParagraaf } from "../../api";
import BwbArtikel from "./bwb-artikel";
import BwbSubParagraaf from "./bwb-subparagraaf";

function BwbParagraaf({
  bwbId,
  hoofdstuk,
  paragraaf,
}: {
  bwbId?: string;
  hoofdstuk?: Hoofdstuk;
  paragraaf?: Paragraaf;
}) {
  if (!paragraaf) {
    return <></>;
  }

  // const sectionId = paragraaf?.toText(paragraafItem?.["@bwb-ng-variabel-deel"])
  //     .replace(/\//g, "_")
  //     .substring(1);
  const nr = paragraaf.kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titel = paragraaf.kop?.titel
    ?.map((titel) => titel.text?.join(" "))
    .join(" ");
  const label = paragraaf.kop?.label?.join(" ");
  const volledigeTitel = `${label} ${nr} ${titel}`.trim();

  return (
    <>
      <div className="paragraaf">
        <div className="article__header--law paragraaf">
          <h4>{volledigeTitel}</h4>
        </div>
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
              bwbId={bwbId}
              hoofdstuk={hoofdstuk}
              subparagraaf={subparagraaf}
            />
          ),
        )}
      </div>
    </>
  );
}

export default BwbParagraaf;
