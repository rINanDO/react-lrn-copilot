import type { Artikel, Wettekst, Paragraaf } from "../../api";

import BwbTiteldeel from "./bwb-titeldeel";
import BwbHoofdstuk from "./bwb-hoofdstuk";
import BwbParagraaf from "./bwb-paragraaf";
import BwbArtikel from "./bwb-artikel";
import BwbBoek from "./bwb-boek";

function BwbWettekst({
  bwbId,
  wettekst,
}: {
  bwbId: string;
  wettekst: Wettekst | undefined;
}) {
  if (!wettekst) {
    return <></>;
  }
  return (
    <>
      {wettekst?.titeldeel?.map((titeldeel, index) => {
        const key = `titeldeel${index}`;
        return (
          <div className="titeldeel" key={key} id={key}>
            <BwbTiteldeel
              id={key}
              key={key}
              bwbId={bwbId}
              titeldeel={titeldeel}
            />
          </div>
        );
      })}
      {wettekst?.hoofdstuk?.map((hoofdstuk, index) => {
        const key = `hoofdstuk${index}`;
        return (
          <div key={key} id={key}>
            <BwbHoofdstuk
              key={key}
              id={key}
              bwbId={bwbId}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}

      {wettekst?.boek?.map((boek, index) => {
        const key = boek.id ?? `boek_${index}`;
        return (
          <div key={key} className="boek">
            <BwbBoek key={key} bwbId={bwbId} boek={boek} />
          </div>
        );
      })}
      {wettekst?.paragraaf?.map((paragraaf: Paragraaf, index: number) => {
        const key = `paragraaf_${index}`;
        return (
          <div className="paragraaf" key={key}>
            <BwbParagraaf key={key} bwbId={bwbId} paragraaf={paragraaf} />
          </div>
        );
      })}
      {wettekst?.artikel?.map((artikel: Artikel, index: number) => {
        const key = `artikel_${index}`;
        return (
          <div className="artikel" key={key}>
            <BwbArtikel id={key} key={key} artikel={artikel} />
          </div>
        );
      })}
    </>
  );
}
export default BwbWettekst;
