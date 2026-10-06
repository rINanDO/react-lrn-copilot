import "./wetten.css";
import BwbArtikel from "./bwb-artikel";
import BwbParagraaf from "./bwb-paragraaf";
import type { Hoofdstuk, Paragraaf, Artikel } from "../../api";
import BwbAfdeling from "./bwb-afdeling";
import BwbKop from "./bwb-kop";
import BwbTiteldeel from "./bwb-titeldeel";

function BwbHoofdstuk({
  id,
  bwbId,
  hoofdstuk,
}: {
  id: string;
  bwbId?: string;
  hoofdstuk?: Hoofdstuk;
}) {
  if (!hoofdstuk) {
    return <></>;
  }

  return (
    <>
      <div className="article__header--law article__header--law--chapter">
        <BwbKop
          key={id}
          id={id}
          kop={hoofdstuk.kop}
          headingLevel={3}
          includeDot={true}
        />
      </div>
      {hoofdstuk.afdeling?.map((afdeling, index: number) => {
        const key = `${id}_afdeling${index}`;
        return (
          <BwbAfdeling key={key} id={key} afdeling={afdeling}></BwbAfdeling>
        );
      })}
      {hoofdstuk.artikel?.map((artikel: Artikel, index: number) => {
        const key = `${id}_artikel${index}`;
        return <BwbArtikel key={key} id={key} artikel={artikel}></BwbArtikel>;
      })}
      {hoofdstuk.paragraaf?.map((paragraaf: Paragraaf, index: number) => {
        const key = `${id}_paragraaf${index}`;
        return (
          <BwbParagraaf key={key} paragraaf={paragraaf}></BwbParagraaf>
        );
      })}
      {hoofdstuk.titeldeel?.map((titeldeel, index: number) => {
        const key = `${id}_titeldeel${index}`;
        return (
          <BwbTiteldeel
            key={key}
            id={key}
            bwbId={bwbId}
            titeldeel={titeldeel}
          ></BwbTiteldeel>
        );
      })}
    </>
  );
}

export default BwbHoofdstuk;
