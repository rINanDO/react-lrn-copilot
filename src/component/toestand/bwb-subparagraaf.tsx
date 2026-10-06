import type { Artikel, SubParagraaf } from "../../api";
import BwbArtikel from "./bwb-artikel";

function BwbSubParagraaf({
  subparagraaf,
}: {
  subparagraaf?: SubParagraaf;
}) {
  if (!subparagraaf) {
    return <></>;
  }

  // const sectionId = subparagraaf?.toText(subparagraafItem?.["@bwb-ng-variabel-deel"])
  //     .replace(/\//g, "_")
  //     .substring(1);
  const nr = subparagraaf.kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titel = subparagraaf.kop?.titel
    ?.map((titel) => titel.text?.join(" "))
    .join(" ");
  const label = subparagraaf.kop?.label?.join(" ");
  const volledigeTitel = `${label} ${nr} ${titel}`.trim();

  return (
    <>
      <div
        className="paragraaf"
        id={subparagraaf?.id ?? ""}
        key={subparagraaf?.id}
      >
        <div className="article__header--law paragraaf">
          <h4>{volledigeTitel}</h4>
        </div>
        {subparagraaf.artikel?.map((artikel: Artikel, index: number) => (
          <BwbArtikel
            key={`${subparagraaf.id}_artikel_${index}`}
            artikel={artikel}
          />
        ))}
        {subparagraaf.subParagraaf?.map(
          (subparagraaf: SubParagraaf, index: number) => (
            <BwbSubParagraaf
              key={`${subparagraaf.id}_subparagraaf_${index}`}
              subparagraaf={subparagraaf}
            />
          ),
        )}
      </div>
    </>
  );
}

export default BwbSubParagraaf;
