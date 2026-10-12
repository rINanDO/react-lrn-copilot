import { memo } from "react";
import type { Artikel, Wettekst, Paragraaf } from "../../api";

import TiteldeelView from "./titeldeel-view";
import HoofdstukView from "./hoofdstuk-view";
import ParagraafView from "./paragraaf-view";
import ArtikelView from "./artikel-view";
import BoekView from "./boek-view";

function WettekstView({
  wettekst,
}: {
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
            <TiteldeelView
              id={key}
              key={key}
              titeldeel={titeldeel}
            />
          </div>
        );
      })}
      {wettekst?.hoofdstuk?.map((hoofdstuk, index) => {
        const key = `hoofdstuk${index}`;
        return (
          <div key={key} id={key}>
            <HoofdstukView
              key={key}
              id={key}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}

      {wettekst?.boek?.map((boek, index) => {
        const key = boek.id ?? `boek_${index}`;
        return (
          <div key={key} className="boek">
            <BoekView key={key} boek={boek} />
          </div>
        );
      })}
      {wettekst?.paragraaf?.map((paragraaf: Paragraaf, index: number) => {
        const key = `paragraaf_${index}`;
        return (
          <div className="paragraaf" key={key}>
            <ParagraafView key={key} paragraaf={paragraaf} />
          </div>
        );
      })}
      {wettekst?.artikel?.map((artikel: Artikel, index: number) => {
        const key = `artikel_${index}`;
        return (
          <div className="artikel" key={key}>
            <ArtikelView id={key} key={key} artikel={artikel} />
          </div>
        );
      })}
    </>
  );
}
export default memo(WettekstView);
