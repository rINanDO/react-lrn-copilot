import {
  isAlItem,
  isLijstItem,
  isPlaatjeItem,
  type StructuurAlgemeenItem,
} from "../../api";
import BwbLijst from "./bwb-lijst";
import BwbPlaatje from "./bwb-plaatje";
import BwbRawText from "./bwb-raw-text";

function BwbStructuurAlgemeen({
  id,
  structuurAlgemeen,
  noParagraph,
}: {
  id: string;
  structuurAlgemeen: StructuurAlgemeenItem;
  noParagraph?: boolean;
}) {
  if (!structuurAlgemeen) {
    return <></>;
  }

  return (
    <>
      {(() => {
        if (isLijstItem(structuurAlgemeen))
          return (
            <BwbLijst
              id={`${id}_lijst`}
              key={`${id}_lijst`}
              lijst={structuurAlgemeen}
            />
          );

        if (isPlaatjeItem(structuurAlgemeen))
          return (
            <BwbPlaatje
              id={`${id}_plaatje`}
              key={`${id}_plaatje`}
              plaatje={structuurAlgemeen}
            />
          );
        if (isAlItem(structuurAlgemeen)) {
          return noParagraph ? (
            <>
              <BwbRawText
                id={`${id}_rawText`}
                key={`${id}_rawText`}
                rawText={structuurAlgemeen.text?.join(" ")}
              />
            </>
          ) : (
            <>
              <p className="al">
                <BwbRawText
                  id={`${id}_rawText`}
                  key={`${id}_rawText`}
                  rawText={structuurAlgemeen.text?.join(" ")}
                />
              </p>
            </>
          );
        }

        return (
          <>
            <BwbRawText
              id={`${id}_rawText`}
              key={`${id}_rawText`}
              rawText={structuurAlgemeen.text?.join(" ")}
            />
          </>
        );
      })()}
    </>
  );
}
export default BwbStructuurAlgemeen;
