import { memo } from "react";
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
  const paragrafen = [...(regelingTekst.paragraaf ?? [])];
  const lastParagraaf = paragrafen.pop();
  return (
    <>
      {paragrafen.map((paragraaf: Paragraaf, index: number) => (
        <BwbParagraaf key={`paragraaf_${index}`} paragraaf={paragraaf} />
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

      {lastParagraaf && <BwbParagraaf paragraaf={lastParagraaf} />}
    </>
  );
}
export default memo(BwbRegelingTekst);
