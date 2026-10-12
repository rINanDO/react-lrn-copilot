import { memo } from "react";
import "./wetten.css";
import type {
  Bijlage,
  Divisie,
  StructuurAlgemeenItem,
  Table,
} from "../../api";
import StructuurAlgemeenView from "./structuur-algemeen-view";
import TableView from "./table-view";
import DivisieView from "./divisie-view";
import { processKopTitle } from "./kop-processor";

function BijlageView({ bijlage }: { bijlage?: Bijlage }) {
  if (!bijlage) {
    return <></>;
  }
  const isVervallen =
    bijlage.status === 1 &&
    bijlage.metaData?.brondata?.[0]?.inwerkingtreding?.publicatie?.effect ===
      "vervallen";
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
            {(
              bijlage.structuurAlgemeen as
                | StructuurAlgemeenItem[]
                | null
                | undefined
            )?.map((structuurAlgemeen, index) => {
              const key = `bijlage${index}`;
              return (
                <StructuurAlgemeenView
                  id={`${key}`}
                  key={`${key}`}
                  structuurAlgemeen={structuurAlgemeen}
                />
              );
            })}

            {bijlage.table?.map((table: Table, index: number) => (
              <TableView key={`${key}_table_${index}`} table={table}></TableView>
            ))}

            {bijlage.divisie?.map((divisie: Divisie, index: number) => (
              <DivisieView
                key={`${key}_divisie_${index}`}
                divisie={divisie}
              ></DivisieView>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default memo(BijlageView);
