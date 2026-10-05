import type { Li } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";

function BwbLi({ id, li }: { id: string; li: Li }) {
  if (!li) {
    return <></>;
  }

  const structuurAlgemeen = li?.structuurAlgemeen;
  return (
    <>
      <li className="li">
        <p className="labeled">
          <span className="ol">{li.liNr}</span>
          {structuurAlgemeen?.map(
            (liStructuurAlgemeen: any, liIndex: number) => {
              return (
                <>
                  <BwbStructuurAlgemeen
                    id={`${id}_${liIndex + 1}`}
                    key={`${id}_${liIndex + 1}`}
                    noParagraph={liIndex === 0}
                    structuurAlgemeen={liStructuurAlgemeen}
                  />
                </>
              );
            },
          )}
        </p>
      </li>
    </>
  );
}
export default BwbLi;
