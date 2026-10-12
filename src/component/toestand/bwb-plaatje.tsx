import type { Plaatje } from "../../api";
import { getIllustratieUrl } from "../../api/wettenRepository";
import { useBwbToestand } from "./bwb-toestand-context";

function BwbPlaatje({ id, plaatje }: { id: string; plaatje?: Plaatje }) {
  const toestand = useBwbToestand();
  const illustratie = plaatje?.illustratie;
  if (!toestand || !illustratie?.naam) {
    return <></>;
  }

  return (
    <>
      <div key={`${id}`} className="plaatje">
        <img
          id={illustratie.id ?? undefined}
          src={getIllustratieUrl(toestand.documentUrl, illustratie.naam)}
          width={illustratie.breedte}
          height={illustratie.hoogte}
          alt=""
        />
      </div>
    </>
  );
}
export default BwbPlaatje;
