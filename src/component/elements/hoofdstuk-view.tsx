import "./wetten.css";
import ArtikelView from "./artikel-view";
import ParagraafView from "./paragraaf-view";
import type { Hoofdstuk, Paragraaf, Artikel } from "../../api";
import AfdelingView from "./afdeling-view";
import KopView from "./kop-view";
import TiteldeelView from "./titeldeel-view";

function HoofdstukView({
  id,
  hoofdstuk,
}: {
  id: string;
  hoofdstuk?: Hoofdstuk;
}) {
  if (!hoofdstuk) {
    return <></>;
  }

  return (
    <>
      <div className="article__header--law article__header--law--chapter">
        <KopView
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
          <AfdelingView key={key} id={key} afdeling={afdeling}></AfdelingView>
        );
      })}
      {hoofdstuk.artikel?.map((artikel: Artikel, index: number) => {
        const key = `${id}_artikel${index}`;
        return <ArtikelView key={key} id={key} artikel={artikel}></ArtikelView>;
      })}
      {hoofdstuk.paragraaf?.map((paragraaf: Paragraaf, index: number) => {
        const key = `${id}_paragraaf${index}`;
        return (
          <ParagraafView key={key} paragraaf={paragraaf}></ParagraafView>
        );
      })}
      {hoofdstuk.titeldeel?.map((titeldeel, index: number) => {
        const key = `${id}_titeldeel${index}`;
        return (
          <TiteldeelView
            key={key}
            id={key}
            titeldeel={titeldeel}
          ></TiteldeelView>
        );
      })}
    </>
  );
}

export default HoofdstukView;
