import type { Lid } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";
import BwbRawText from "./bwb-raw-text";
import type { Table } from "../../api";
import BwbTable from "./bwb-table";

function BwbLid({ id, type, lid }: { id: string; type?: string; lid: Lid }) {
  if (!lid) {
    return <></>;
  }

  return (
    <>
      <ul className={`list--law__unordered ${type ?? ""} whitespace-small`}>
        <li>
          {lid.structuurAlgemeen?.map(
            (structuurAlgemeen: any, index: number) => {
              const isLijst =
                structuurAlgemeen?.li && structuurAlgemeen?.li?.length > 0;

              if (isLijst) {
                return (
                  <>
                    <BwbStructuurAlgemeen
                      id={`${id}_lid${index}`}
                      key={`${id}_lid${index}`}
                      structuurAlgemeen={structuurAlgemeen}
                    />
                  </>
                );
              }
              if (index === 0) {
                return (
                  <p className="lid labeled">
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
                    />
                  </p>
                );
              } else {
                <BwbStructuurAlgemeen
                  id={`${id}_lid${index}`}
                  key={`${id}_lid${index}`}
                  structuurAlgemeen={structuurAlgemeen}
                />;
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
