import "./generic.css";
import "./wetten.css";
import type { Bijlage, Divisie, Table } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbTable from "./bwb-table";
import BwbDivisie from "./bwb-divisie";
import { processKopTitle } from "./kop-processor";

function BwbBijlage({ bijlage }: { bwbId?: string; bijlage?: Bijlage }) {
  if (!bijlage) {
    return <></>;
  }
  const isVervallen =
    bijlage.status === 1 &&
    bijlage.metaData?.brondata?.[0]?.inwerkingtreding?.publicatie?.effect === 2;
  const vervallenPer = isVervallen
    ? bijlage.metaData?.brondata?.[0]?.inwerkingtreding?.inwerkingtredingDatum?.text?.join(
        " ",
      )
    : undefined;

  const key = `bijlage_${bijlage?.id}`;
  const title = processKopTitle(bijlage.kop);
  return (
    <>
      <div className="bijlage" id={`bijlage_${bijlage.id}`} key={key}>
        <div className="article__header--law bijlage">
          <h4 id={bijlage.id ?? ""}>{title}</h4>
          {isVervallen ? <p>[Vervallen per {vervallenPer}]</p> : <></>}
        </div>
        {!isVervallen && (
          <>
            {bijlage.structuurAlgemeen?.map((structuurAlgemeen, index) => {
              const key = `bijlage${index}`;
              return (
                <BwbStructuurAlgemeen
                  id={`${key}`}
                  key={`${key}`}
                  structuurAlgemeen={structuurAlgemeen}
                />
              );
            })}

            {bijlage.table?.map((table: Table, index: number) => (
              <BwbTable key={`${key}_table_${index}`} table={table}></BwbTable>
            ))}

            {bijlage.divisie?.map((divisie: Divisie, index: number) => (
              <BwbDivisie
                key={`${key}_divisie_${index}`}
                divisie={divisie}
              ></BwbDivisie>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default BwbBijlage;
