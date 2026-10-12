import "./wetten.css";
import ArtikelView from "./artikel-view";
import type { Divisie, StructuurAlgemeenItem, Table } from "../../api";
import StructuurAlgemeenView from "./structuur-algemeen-view";
import TableView from "./table-view";
import KopView from "./kop-view";

function DivisieView({ divisie }: { divisie?: Divisie }) {
  if (!divisie) {
    return <></>;
  }
  const kopKey = `${divisie.id}_artikel_kop`;

  return (
    <>
      <div className="article__header--law divisie">
        <KopView
          id={kopKey}
          key={kopKey}
          kop={divisie.kop}
          headingLevel={4}
          includeDot={true}
        />
      </div>
      {divisie.artikel?.map((artikel) => (
        <ArtikelView
          key={`${divisie.id}_artikel_${artikel.id}`}
          artikel={artikel}
        ></ArtikelView>
      ))}
      {(
        divisie.structuurAlgemeen as StructuurAlgemeenItem[] | null | undefined
      )?.map((structuurAlgemeen, index) => {
        const key = `${divisie.id}_structuuralgemeen_${index}`;
        return (
          <StructuurAlgemeenView
            id={key}
            key={key}
            structuurAlgemeen={structuurAlgemeen}
          />
        );
      })}
      {divisie.table?.map((table: Table, index: number) => (
        <TableView key={`${divisie.id}_table_${index}`} table={table}></TableView>
      ))}
      {divisie.divisie?.map((subDivisie) => (
        <DivisieView
          key={`${divisie.id}_divisie_${subDivisie.id}`}
          divisie={subDivisie}
        ></DivisieView>
      ))}
    </>
  );
}

export default DivisieView;
