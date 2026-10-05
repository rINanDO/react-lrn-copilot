import type { Lijst, Plaatje } from "../../api";
import BwbLijst from "./bwb-lijst";
import BwbPlaatje from "./bwb-plaatje";
import BwbRawText from "./bwb-raw-text";

function BwbStructuurAlgemeen({
  id,
  structuurAlgemeen,
  noParagraph,
}: {
  id: string;
  structuurAlgemeen: any;
  noParagraph?: boolean;
}) {
  if (!structuurAlgemeen) {
    return <></>;
  }

  return (
    <>
      {(() => {
        if (structuurAlgemeen.$element === "lijst")
          return (
            <BwbLijst
              id={`${id}_lijst`}
              key={`${id}_lijst`}
              lijst={structuurAlgemeen as Lijst}
            />
          );

        if (structuurAlgemeen.$element === "plaatje")
          return (
            <BwbPlaatje
              id={`${id}_plaatje`}
              key={`${id}_plaatje`}
              plaatje={structuurAlgemeen as Plaatje}
            />
          );
        if (structuurAlgemeen.$element === "al") {
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
