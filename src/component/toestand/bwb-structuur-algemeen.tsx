import type { Li } from "../../api";
import BwbLijst from "./bwb-lijst";
import BwbRawText from "./bwb-raw-text";

function BwbStructuurAlgemeen({
  id,
  structuurAlgemeen,
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
        else
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
