import { Fragment } from "react";
import "./wetten.css";
import type { StructuurAlgemeenItem, Table, Tgroup } from "../../api";
import StructuurAlgemeenView from "./structuur-algemeen-view";

function TableView({ table }: { table?: Table }) {
  if (!table) {
    return <></>;
  }

  return (
    <>
      <table summary="tabel" className="table__regulation fullwidth">
        {table?.tgroup.map((tgroup: Tgroup, tgroupIndex: number) => (
          <Fragment key={tgroupIndex}>
            {tgroup.thead?.row?.map((row, rowIndex) => (
              <thead key={rowIndex}>
                <tr className="table-head">
                  {row.entry?.map((entry, cellIndex) => {
                    return (
                      <th
                        className="entry align-left valign-middle"
                        scope="col"
                        key={cellIndex}
                      >
                        <p className="al">
                          {(
                            entry.structuurAlgemeen as
                              | StructuurAlgemeenItem[]
                              | null
                              | undefined
                          )?.map((liStructuurAlgemeen, liIndex: number) => {
                            return (
                              <StructuurAlgemeenView
                                id={`table_header_${liIndex}`}
                                key={`table_header_${liIndex}`}
                                structuurAlgemeen={liStructuurAlgemeen}
                              />
                            );
                          })}
                        </p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            ))}
            <tbody>
              {tgroup.tbody?.row?.map((row, index) => (
                <tr
                  key={index}
                  className={`tr-rowsep ${index % 2 === 0 ? "even" : "odd"}`}
                >
                  {row.entry?.map((entry, cellIndex) => {
                    return (
                      <td
                        className="entry align-left valign-middle"
                        key={cellIndex}
                      >
                        <p className="al">
                          {(
                            entry.structuurAlgemeen as
                              | StructuurAlgemeenItem[]
                              | null
                              | undefined
                          )?.map((liStructuurAlgemeen, liIndex: number) => {
                            return (
                              <StructuurAlgemeenView
                                id={`table_body_${liIndex}`}
                                key={`table_body_${liIndex}`}
                                structuurAlgemeen={liStructuurAlgemeen}
                              />
                            );
                          })}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Fragment>
        ))}
      </table>
    </>
  );
}

export default TableView;
