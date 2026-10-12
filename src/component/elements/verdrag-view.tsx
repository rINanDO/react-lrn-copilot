import { memo } from "react";
import type { Verdrag, Verdragtekst } from "../../api";
import VerdragTekstView from "./verdrag-tekst-view";

function VerdragView({
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
            <VerdragTekstView
              key={key}
              verdragTekst={verdragtekst}
            />
          );
        },
      )}
    </>
  );
}
export default memo(VerdragView);
