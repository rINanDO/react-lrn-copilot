import "./generic.css";
import "./wetten.css";
import BwbLid from "./bwb-lid";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbKop from "./bwb-kop";
import type { Artikel } from "../../api";

function BwbArtikel({ id, artikel }: { id?: string; artikel?: Artikel }) {
  const artikelId = `${artikel?.variabelDeel}`;
  if (!artikel) {
    return <></>;
  }
  const kopKey = `${id}_artikel_kop`;
  return (
    <>
      <div className="article__header--law artikel">
        <BwbKop
          id={kopKey}
          key={kopKey}
          kop={artikel.kop}
          headingLevel={4}
          includeDot={true}
        />
      </div>
      <div className="artikel" id={artikelId}>
        {artikel.structuurAlgemeen?.map((structuurAlgemeen: any, index) => {
          const structuurAlgemeenKey = `${id}_structuurAlgemeen${index}`;
          const isLijst =
            structuurAlgemeen?.li && structuurAlgemeen?.li.length > 0;

          return isLijst ? (
            <>
              <BwbStructuurAlgemeen
                id={structuurAlgemeenKey}
                key={structuurAlgemeenKey}
                structuurAlgemeen={structuurAlgemeen}
              />
            </>
          ) : (
            <>
              <p className="al">
                <BwbStructuurAlgemeen
                  id={structuurAlgemeenKey}
                  key={structuurAlgemeenKey}
                  structuurAlgemeen={structuurAlgemeen}
                />
              </p>
            </>
          );
        })}
        {artikel.lid?.map((lid, index) => {
          const key = `${id}_lid${index}`;
          return <BwbLid key={key} id={key} lid={lid} />;
        })}
      </div>
    </>
  );
}

export default BwbArtikel;
