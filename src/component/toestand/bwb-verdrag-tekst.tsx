import type { Verdragtekst } from "../../api";
import BwbKop from "./bwb-kop";
import BwbWettekst from "./bwb-wettekst";

function BwbVerdragTekst({
  verdragTekst,
}: {
  verdragTekst: Verdragtekst | undefined;
}) {
  if (!verdragTekst) {
    return <></>;
  }
  var id = verdragTekst.id ?? "verdrag_kop";
  return (
    <>
      <BwbKop key={id} id={id} kop={verdragTekst.kop} headingLevel={1} />
      <BwbWettekst wettekst={verdragTekst.wettekst} />
    </>
  );
}
export default BwbVerdragTekst;
