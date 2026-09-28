import "./generic.css";
import "./wetten.css";
import BwbArtikel from "./bwb-artikel";
import type { Divisie, Table } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbTable from "./bwb-table";

function BwbDivisie({ divisie }: { divisie?: Divisie }) {
  if (!divisie) {
    return <></>;
  }

  const label = divisie?.kop?.label?.join(" ");
  const nummer = divisie?.kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titelTekst = divisie?.kop?.titel
    ?.map((titel) => titel.text?.join(" "))
    .join(" ");

  const basisTitel = `${label} ${nummer}`.trim();
  const title = titelTekst ? `${basisTitel}. ${titelTekst}` : basisTitel;
  return (
    <>
      <div className="article__header--law divisie">
        <h4 id={divisie.id ?? ""}>{title}</h4>
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
    </>
  );
}

export default BwbDivisie;
