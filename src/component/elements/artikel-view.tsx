import "./wetten.css";
import LidView from "./lid-view";
import StructuurAlgemeenView from "./structuur-algemeen-view";
import KopView from "./kop-view";
import {
  isLijstItem,
  type Artikel,
  type StructuurAlgemeenItem,
} from "../../api";

function ArtikelView({ id, artikel }: { id?: string; artikel?: Artikel }) {
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
    <div className="bwb-artikel">
      <div className="article__header--law artikel">
        <KopView
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
              {(
                artikel.structuurAlgemeen as
                  | StructuurAlgemeenItem[]
                  | null
                  | undefined
              )?.map((structuurAlgemeen, index) => {
                const structuurAlgemeenKey = `${id}_structuurAlgemeen${index}`;
                const isLijst = isLijstItem(structuurAlgemeen);

                return isLijst ? (
                  <>
                    <StructuurAlgemeenView
                      id={structuurAlgemeenKey}
                      key={structuurAlgemeenKey}
                      structuurAlgemeen={structuurAlgemeen}
                    />
                  </>
                ) : (
                  <>
                    <p className="al">
                      <StructuurAlgemeenView
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
                return <LidView key={key} id={key} lid={lid} />;
              })}
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default ArtikelView;
