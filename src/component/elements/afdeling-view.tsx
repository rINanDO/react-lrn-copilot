import "./wetten.css";
import type { Afdeling } from "../../api";
import ArtikelView from "./artikel-view";
import KopView from "./kop-view";
import HoofdstukView from "./hoofdstuk-view";
import ParagraafView from "./paragraaf-view";

function AfdelingView({ id, afdeling }: { id?: string; afdeling?: Afdeling }) {
  if (!afdeling) {
    return <></>;
  }
  return (
    <>
      <div className="afdeling" id={id}>
        <div className="article__header--law afdeling">
          <KopView
            id={`${id}_afdeling_kop`}
            key={`${id}_afdeling_kop`}
            kop={afdeling.kop}
            headingLevel={4}
          />
        </div>
        {afdeling.artikel?.map((artikel) => (
          <ArtikelView
            id={`${id}_artikel${artikel.id}`}
            key={`${id}_artikel${artikel.id}`}
            artikel={artikel}
          ></ArtikelView>
        ))}
        {afdeling.paragraaf?.map((paragraaf) => (
          <ParagraafView
            key={`${id}_paragraaf${paragraaf.id}`}
            paragraaf={paragraaf}
          ></ParagraafView>
        ))}
        {afdeling.hoofdstuk?.map((hoofdstuk) => (
          <HoofdstukView
            id={`${id}_hoofdstuk${hoofdstuk.id}`}
            key={`${id}_hoofdstuk${hoofdstuk.id}`}
            hoofdstuk={hoofdstuk}
          ></HoofdstukView>
        ))}
      </div>
    </>
  );
}

export default AfdelingView;
