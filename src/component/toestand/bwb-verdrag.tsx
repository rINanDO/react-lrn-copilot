import { memo } from "react";
import type { Verdrag, Verdragtekst } from "../../api";
import BwbVerdragTekst from "./bwb-verdrag-tekst";

function BwbVerdrag({
  verdrag,
}: {
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
              verdragTekst={verdragtekst}
            />
          );
        },
      )}
    </>
  );
}
export default memo(BwbVerdrag);
