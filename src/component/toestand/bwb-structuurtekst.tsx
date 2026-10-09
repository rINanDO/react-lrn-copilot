import "./wetten.css";
import type { StructuurAlgemeenItem, Structuurtekst } from "../../api";
import BwbStructuurAlgemeen from "./bwb-structuur-algemeen";

function BwbStructuurtekst({
  id,
  structuurtekst,
}: {
  id?: string;
  structuurtekst?: Structuurtekst;
}) {
  if (!structuurtekst) {
    return <></>;
  }

  return (
    <>
      {(() => {
        var structuurAlgemeenList =
          structuurtekst.structuurAlgemeen as StructuurAlgemeenItem[];
        return structuurAlgemeenList?.map((structuurAlgemeen, index) => {
          const structuurAlgemeenId = `${id}_structuurAlgemeen${index}`;
          return (
            <BwbStructuurAlgemeen
              structuurAlgemeen={structuurAlgemeen}
              id={structuurAlgemeenId}
            ></BwbStructuurAlgemeen>
          );
        });
      })()}
    </>
  );
}

export default BwbStructuurtekst;
