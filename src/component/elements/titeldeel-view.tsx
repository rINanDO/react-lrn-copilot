import "./wetten.css";
import type { Afdeling, Artikel, Titeldeel, Paragraaf } from "../../api";
import KopView from "./kop-view";
import HoofdstukView from "./hoofdstuk-view";
import ArtikelView from "./artikel-view";
import ParagraafView from "./paragraaf-view";
import AfdelingView from "./afdeling-view";

function TiteldeelView({
  id,
  titeldeel,
}: {
  id: string;
  titeldeel?: Titeldeel;
}) {
  if (!titeldeel) {
    return <></>;
  }
  return (
    <>
      <div className="article__header--law titeldeel">
        <KopView
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
          <div className="hoofdstuk" id={hoofdstukId} key={hoofdstukId}>
            <HoofdstukView
              id={hoofdstukId}
              key={hoofdstukId}
              hoofdstuk={hoofdstuk}
            />
          </div>
        );
      })}
      {titeldeel.paragraaf?.map((paragraaf: Paragraaf) => {
        const paragraafId = `${id ?? ""}_Paragraaf${paragraaf.id ?? ""}`;
        return (
          <div className="paragraaf" id={paragraafId} key={paragraafId}>
            <ParagraafView key={paragraafId} paragraaf={paragraaf} />
          </div>
        );
      })}
      {titeldeel.artikel?.map((artikel: Artikel) => {
        const artikelId = `${id ?? ""}_Artikel${artikel.id ?? ""}`;
        return (
          <div className="artikel" id={artikelId} key={artikelId}>
            <ArtikelView id={artikelId} key={artikelId} artikel={artikel} />
          </div>
        );
      })}

      {titeldeel.afdeling?.map((afdeling: Afdeling) => {
        const afdelingId = `${id ?? ""}_Afdeling${afdeling.id ?? ""}`;
        return (
          <div className="afdeling" id={afdelingId} key={afdelingId}>
            <AfdelingView id={afdelingId} key={afdelingId} afdeling={afdeling} />
          </div>
        );
      })}
    </>
  );
}

export default TiteldeelView;
