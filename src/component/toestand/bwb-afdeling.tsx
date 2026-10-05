import "./wetten.css";
import type { Afdeling } from "../../api";
import BwbArtikel from "./bwb-artikel";
import BwbKop from "./bwb-kop";
import BwbHoofdstuk from "./bwb-hoofdstuk";
import BwbParagraaf from "./bwb-paragraaf";

function BwbAfdeling({ id, afdeling }: { id?: string; afdeling?: Afdeling }) {
  if (!afdeling) {
    return <></>;
  }
  return (
    <>
      <div className="afdeling" id={id}>
        <div className="article__header--law afdeling">
          <BwbKop
            id={`${id}_afdeling_kop`}
            key={`${id}_afdeling_kop`}
            kop={afdeling.kop}
            headingLevel={4}
          />
        </div>
        {afdeling.artikel?.map((artikel) => (
          <BwbArtikel
            id={`${id}_artikel${artikel.id}`}
            key={`${id}_artikel${artikel.id}`}
            artikel={artikel}
          ></BwbArtikel>
        ))}
        {afdeling.paragraaf?.map((paragraaf) => (
          <BwbParagraaf
            key={`${id}_paragraaf${paragraaf.id}`}
            paragraaf={paragraaf}
          ></BwbParagraaf>
        ))}
        {afdeling.hoofdstuk?.map((hoofdstuk) => (
          <BwbHoofdstuk
            id={`${id}_hoofdstuk${hoofdstuk.id}`}
            key={`${id}_hoofdstuk${hoofdstuk.id}`}
            hoofdstuk={hoofdstuk}
          ></BwbHoofdstuk>
        ))}
      </div>
    </>
  );
}

export default BwbAfdeling;
