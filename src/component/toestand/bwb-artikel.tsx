import "./wetten.css";
import BwbLid from "./bwb-lid";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbKop from "./bwb-kop";
import type { Artikel } from "../../api";

function BwbArtikel({ id, artikel }: { id?: string; artikel?: Artikel }) {
  const inwerkingtredingDatum =
    artikel?.metaData?.brondata?.[0]?.inwerkingtreding?.inwerkingtredingDatum
      ?.isodatum;
  const publicatieEffect =
    artikel?.metaData?.brondata?.[0]?.inwerkingtreding?.publicatie?.effect;
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
        {(() => {
          switch (publicatieEffect) {
            case "vervallen":
              return <p>[Vervallen per {inwerkingtredingDatum ?? ""}]</p>;
            default:
              return <></>;
          }
        })()}
      </div>
      {(() => {
        if (publicatieEffect === "vervallen") {
          return <></>;
        }
        return (
          <>
            <div className="artikel" id={artikelId}>
              {artikel.structuurAlgemeen?.map(
                (structuurAlgemeen: any, index) => {
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
                },
              )}
              {artikel.lid?.map((lid, index) => {
                const key = `${id}_lid${index}`;
                return <BwbLid key={key} id={key} lid={lid} />;
              })}
            </div>
          </>
        );
      })()}
    </>
  );
}

export default BwbArtikel;
