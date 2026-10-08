import { memo } from "react";
import type { Verdrag, Verdragtekst } from "../../api";
import BwbVerdragTekst from "./bwb-verdrag-tekst";

function BwbVerdrag({
  bwbId,
  verdrag,
}: {
  bwbId: string;
  verdrag: Verdrag | undefined;
}) {
  if (!verdrag) {
    return <></>;
  }
  return (
    <>
      {verdrag?.verdragtekst?.map(
        (verdragtekst: Verdragtekst, index: number) => {
          var key = `${verdrag.id}_item${index}`;
          return (
            <BwbVerdragTekst
              key={key}
              bwbId={bwbId}
              verdragTekst={verdragtekst}
            />
          );
        },
      )}
    </>
  );
}
export default memo(BwbVerdrag);
