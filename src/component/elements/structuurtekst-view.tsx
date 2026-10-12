import "./wetten.css";
import type { StructuurAlgemeenItem, Structuurtekst } from "../../api";
import StructuurAlgemeenView from "./structuur-algemeen-view";

function StructuurtekstView({
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
            <StructuurAlgemeenView
              structuurAlgemeen={structuurAlgemeen}
              id={structuurAlgemeenId}
            ></StructuurAlgemeenView>
          );
        });
      })()}
    </>
  );
}

export default StructuurtekstView;
