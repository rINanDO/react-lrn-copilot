import type { Li } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";

function BwbLi({ id, li }: { id: string; li: Li }) {
  if (!li) {
    return <></>;
  }

  const structuurAlgemeen = li?.structuurAlgemeen?.slice(1);
  const firstStructuurAlgemeen = li?.structuurAlgemeen?.[0];
  return (
    <>
      <li className="li">
        <p className="labeled">
          <span className="ol">{li.liNr}</span>
          <BwbStructuurAlgemeen
            id={`${id}_0`}
            key={`${id}_0`}
            className="labeled"
            structuurAlgemeen={firstStructuurAlgemeen}
          />
        </p>
        {structuurAlgemeen?.map((liStructuurAlgemeen: any, liIndex: number) => {
          const className = liStructuurAlgemeen?.li ? "labeled" : "al";
          return (
            <>
              <BwbStructuurAlgemeen
                id={`${id}_${liIndex + 1}`}
                key={`${id}_${liIndex + 1}`}
                className={className}
                structuurAlgemeen={liStructuurAlgemeen}
              />
            </>
          );
        })}
      </li>
    </>
  );
}
export default BwbLi;
