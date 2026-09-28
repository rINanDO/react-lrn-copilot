import "./generic.css";
import "./wetten.css";
import type { Afdeling, Artikel, Titeldeel, Paragraaf } from "../../api";
import BwbKop from "./bwb-kop";
import BwbHoofdstuk from "./bwb-hoofdstuk";
import BwbArtikel from "./bwb-artikel";
import BwbParagraaf from "./bwb-paragraaf";
import BwbAfdeling from "./bwb-afdeling";

function BwbTiteldeel({
  id,
  bwbId,
  titeldeel,
}: {
  id: string;
  bwbId?: string;
  titeldeel?: Titeldeel;
}) {
  if (!titeldeel) {
    return <></>;
  }
  return (
    <>
      <div className="article__header--law titeldeel">
        <BwbKop
          id={id}
          key={id}
          headingLevel={4}
          kop={titeldeel.kop}
          includeDot={true}
        />
      </div>
      {titeldeel.hoofdstuk?.map((hoofdstuk) => {
        const hoofdstukId = `${id ?? ""}_Hoofdstuk${hoofdstuk.id ?? ""}`;
        return (
          <div className="hoofdstuk" id={hoofdstukId}>
            <BwbHoofdstuk
              id={hoofdstukId}
              key={hoofdstukId}
              bwbId={bwbId}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}
      {titeldeel.paragraaf?.map((paragraaf: Paragraaf) => {
        const paragraafId = `${id ?? ""}_Paragraaf${paragraaf.id ?? ""}`;
        return (
          <div className="paragraaf" id={paragraafId}>
            <BwbParagraaf key={paragraafId} paragraaf={paragraaf} />
          </div>
        );
      })}
      {titeldeel.artikel?.map((artikel: Artikel) => {
        const artikelId = `${id ?? ""}_Artikel${artikel.id ?? ""}`;
        return (
          <div className="artikel" id={artikelId}>
            <BwbArtikel id={artikelId} key={artikelId} artikel={artikel} />
          </div>
        );
      })}

      {titeldeel.afdeling?.map((afdeling: Afdeling) => {
        const afdelingId = `${id ?? ""}_Afdeling${afdeling.id ?? ""}`;
        return (
          <div className="afdeling" id={afdelingId}>
            <BwbAfdeling id={afdelingId} key={afdelingId} afdeling={afdeling} />
          </div>
        );
      })}
    </>
  );
}

export default BwbTiteldeel;
