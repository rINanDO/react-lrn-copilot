import type { Li, Plaatje } from "../../api";
import BwbLijst from "./bwb-lijst";
import BwbPlaatje from "./bwb-plaatje";
import BwbRawText from "./bwb-raw-text";

function BwbStructuurAlgemeen({
  id,
  structuurAlgemeen,
  className,
}: {
  id: string;
  structuurAlgemeen: any;
  className?: string;
}) {
  if (!structuurAlgemeen) {
    return <></>;
  }

  return (
    <>
      {(() => {
        const lijst = structuurAlgemeen.li as Li[];
        if (lijst)
          return (
            <>
              <BwbLijst
                id={`${id}_lijst`}
                key={`${id}_lijst`}
                lijst={{ li: lijst }}
              />
            </>
          );

        if (structuurAlgemeen.$element === "plaatje")
          return (
            <BwbPlaatje
              id={`${id}_plaatje`}
              key={`${id}_plaatje`}
              plaatje={structuurAlgemeen as Plaatje}
            />
          );

        if (className === "al")
          return (
            <>
              <p className="al">
                {" "}
                <BwbRawText
                  id={`${id}_rawText`}
                  key={`${id}_rawText`}
                  rawText={structuurAlgemeen.text?.join(" ")}
                />
              </p>{" "}
            </>
          );
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
