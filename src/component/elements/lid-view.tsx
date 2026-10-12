import { Fragment } from "react";
import { isLijstItem, type Lid, type StructuurAlgemeenItem } from "../../api";
import StructuurAlgemeenView from "./structuur-algemeen-view";
import RawText from "./raw-text";
import type { Table } from "../../api";
import TableView from "./table-view";

function LidView({ id, type, lid }: { id: string; type?: string; lid: Lid }) {
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
                    <StructuurAlgemeenView
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
                      <RawText
                        id={`${id}_lidnr${index}`}
                        key={`${id}_lidnr${index}`}
                        rawText={lid.lidnr.text?.join(" ")}
                      />
                    </span>
                    <StructuurAlgemeenView
                      id={`${id}_lid${index}`}
                      key={`${id}_lid${index}`}
                      structuurAlgemeen={structuurAlgemeen}
                      noParagraph={true}
                    />
                  </p>
                );
              } else {
                return (
                  <StructuurAlgemeenView
                    id={`${id}_lid${index}`}
                    key={`${id}_lid${index}`}
                    structuurAlgemeen={structuurAlgemeen}
                  />
                );
              }
            },
          )}
          {lid.table?.map((table: Table, index: number) => (
            <TableView key={`${lid.id}_table_${index}`} table={table}></TableView>
          ))}
        </li>
      </ul>
    </>
  );
}
export default LidView;
