import type { Verdragtekst } from "../../api";
import KopView from "./kop-view";
import WettekstView from "./wettekst-view";

function VerdragTekstView({
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
      <KopView key={id} id={id} kop={verdragTekst.kop} headingLevel={1} />
      <WettekstView wettekst={verdragTekst.wettekst} />
    </>
  );
}
export default VerdragTekstView;
