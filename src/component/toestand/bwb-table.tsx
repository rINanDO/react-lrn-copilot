import { Fragment } from "react";
import "./wetten.css";
import type { Table, Tgroup } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";

function BwbTable({ table }: { bwbId?: string; table?: Table }) {
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
                          {entry.structuurAlgemeen?.map(
                            (liStructuurAlgemeen: any, liIndex: number) => {
                              return (
                                <BwbStructuurAlgemeen
                                  id={`table_header_${liIndex}`}
                                  key={`table_header_${liIndex}`}
                                  structuurAlgemeen={liStructuurAlgemeen}
                                />
                              );
                            },
                          )}
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
                          {entry.structuurAlgemeen?.map(
                            (liStructuurAlgemeen: any, liIndex: number) => {
                              return (
                                <BwbStructuurAlgemeen
                                  id={`table_body_${liIndex}`}
                                  key={`table_body_${liIndex}`}
                                  structuurAlgemeen={liStructuurAlgemeen}
                                />
                              );
                            },
                          )}
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

export default BwbTable;
