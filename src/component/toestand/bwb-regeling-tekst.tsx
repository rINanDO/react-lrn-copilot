import type { Artikel, Paragraaf, RegelingTekst } from "../../api";
import BwbArtikel from "./bwb-artikel";
import BwbHoofdstuk from "./bwb-hoofdstuk";
import BwbParagraaf from "./bwb-paragraaf";

function BwbRegelingTekst({
  bwbId,
  regelingTekst,
}: {
  bwbId: string;
  regelingTekst: RegelingTekst | undefined;
}) {
  if (!regelingTekst) {
    return <></>;
  }
  const paragraaf = [...(regelingTekst.paragraaf ?? [])];
  const lastParagraaf = paragraaf.pop();
  return (
    <>
      {regelingTekst?.paragraaf?.map((paragraaf: Paragraaf, index: number) => (
        <BwbParagraaf
          key={`paragraaf_${index}`}
          bwbId={bwbId}
          paragraaf={paragraaf}
        />
      ))}
      {regelingTekst?.hoofdstuk?.map((hoofdstuk, index) => {
        const key = hoofdstuk.id ?? `hoofdstuk_${index}`;
        return (
          <div className="hoofdstuk" key={key}>
            <BwbHoofdstuk
              id={key}
              key={key}
              bwbId={bwbId}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}
      {regelingTekst?.artikel?.map((artikel: Artikel, index: number) => (
        <BwbArtikel key={`artikel_${index}`} artikel={artikel} />
      ))}

      {lastParagraaf && (
        <BwbParagraaf bwbId={bwbId} paragraaf={lastParagraaf} />
      )}
    </>
  );
}
export default BwbRegelingTekst;
