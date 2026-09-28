import type { Verdragtekst } from "../../api";
import BwbKop from "./bwb-kop";
import BwbWettekst from "./bwb-wettekst";

function BwbVerdragTekst({
  bwbId,
  verdragTekst,
}: {
  bwbId: string;
  verdragTekst: Verdragtekst | undefined;
}) {
  if (!verdragTekst) {
    return <></>;
  }
  var id = verdragTekst.id ?? "verdrag_kop";
  return (
    <>
      <BwbKop key={id} id={id} kop={verdragTekst.kop} headingLevel={1} />
      <BwbWettekst bwbId={bwbId} wettekst={verdragTekst.wettekst} />
    </>
  );
}
export default BwbVerdragTekst;
