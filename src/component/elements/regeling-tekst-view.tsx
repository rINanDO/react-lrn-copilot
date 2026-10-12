import { memo } from "react";
import type { Artikel, Paragraaf, RegelingTekst } from "../../api";
import ArtikelView from "./artikel-view";
import HoofdstukView from "./hoofdstuk-view";
import ParagraafView from "./paragraaf-view";

function RegelingTekstView({
  regelingTekst,
}: {
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
        <ParagraafView key={`paragraaf_${index}`} paragraaf={paragraaf} />
      ))}
      {regelingTekst?.hoofdstuk?.map((hoofdstuk, index) => {
        const key = hoofdstuk.id ?? `hoofdstuk_${index}`;
        return (
          <div className="hoofdstuk" key={key}>
            <HoofdstukView
              id={key}
              key={key}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}
      {regelingTekst?.artikel?.map((artikel: Artikel, index: number) => (
        <ArtikelView key={`artikel_${index}`} artikel={artikel} />
      ))}

      {lastParagraaf && <ParagraafView paragraaf={lastParagraaf} />}
    </>
  );
}
export default memo(RegelingTekstView);
