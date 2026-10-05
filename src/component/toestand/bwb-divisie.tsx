import "./generic.css";
import "./wetten.css";
import BwbArtikel from "./bwb-artikel";
import type { Divisie, Table } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbTable from "./bwb-table";
import BwbKop from "./bwb-kop";

function BwbDivisie({ divisie }: { divisie?: Divisie }) {
  if (!divisie) {
    return <></>;
  }
  const kopKey = `${divisie.id}_artikel_kop`;

  return (
    <>
      <div className="article__header--law divisie">
        <BwbKop
          id={kopKey}
          key={kopKey}
          kop={divisie.kop}
          headingLevel={4}
          includeDot={true}
        />
      </div>
      {divisie.artikel?.map((artikel) => (
        <BwbArtikel
          key={`${divisie.id}_artikel_${artikel.id}`}
          artikel={artikel}
        ></BwbArtikel>
      ))}
      {divisie.structuurAlgemeen?.map((structuurAlgemeen, index) => {
        const key = `${divisie.id}_structuuralgemeen_${index}`;
        return (
          <BwbStructuurAlgemeen
            id={key}
            key={key}
            structuurAlgemeen={structuurAlgemeen}
          />
        );
      })}
      {divisie.table?.map((table: Table, index: number) => (
        <BwbTable key={`${divisie.id}_table_${index}`} table={table}></BwbTable>
      ))}
      {divisie.divisie?.map((subDivisie) => (
        <BwbDivisie
          key={`${divisie.id}_divisie_${subDivisie.id}`}
          divisie={subDivisie}
        ></BwbDivisie>
      ))}
    </>
  );
}

export default BwbDivisie;
