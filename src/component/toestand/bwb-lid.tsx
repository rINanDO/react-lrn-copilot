import { Fragment } from "react";
import { isLijstItem, type Lid, type StructuurAlgemeenItem } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbRawText from "./bwb-raw-text";
import type { Table } from "../../api";
import BwbTable from "./bwb-table";

function BwbLid({ id, type, lid }: { id: string; type?: string; lid: Lid }) {
  if (!lid) {
    return <></>;
  }

  const structuurAlgemeenList = lid.structuurAlgemeen as
    | StructuurAlgemeenItem[]
    | null
    | undefined;

  return (
    <>
      <ul className={`list--law__unordered ${type ?? ""} whitespace-small`}>
        <li>
          {structuurAlgemeenList?.map(
            (structuurAlgemeen, index: number) => {
              const isLijst = isLijstItem(structuurAlgemeen);

              if (isLijst) {
                return (
                  <Fragment key={`${id}_lid${index}`}>
                    <BwbStructuurAlgemeen
                      id={`${id}_lid${index}`}
                      key={`${id}_lid${index}`}
                      structuurAlgemeen={structuurAlgemeen}
                    />
                  </Fragment>
                );
              }
              if (index === 0) {
                return (
                  <p className="lid labeled" key={`${id}_lid${index}`}>
                    <span className="lidnr">
                      <BwbRawText
                        id={`${id}_lidnr${index}`}
                        key={`${id}_lidnr${index}`}
                        rawText={lid.lidnr.text?.join(" ")}
                      />
                    </span>
                    <BwbStructuurAlgemeen
                      id={`${id}_lid${index}`}
                      key={`${id}_lid${index}`}
                      structuurAlgemeen={structuurAlgemeen}
                      noParagraph={true}
                    />
                  </p>
                );
              } else {
                return (
                  <BwbStructuurAlgemeen
                    id={`${id}_lid${index}`}
                    key={`${id}_lid${index}`}
                    structuurAlgemeen={structuurAlgemeen}
                  />
                );
              }
            },
          )}
          {lid.table?.map((table: Table, index: number) => (
            <BwbTable key={`${lid.id}_table_${index}`} table={table}></BwbTable>
          ))}
        </li>
      </ul>
    </>
  );
}
export default BwbLid;
