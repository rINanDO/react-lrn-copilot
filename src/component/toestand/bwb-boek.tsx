import "./generic.css";
import "./wetten.css";
import type { Boek } from "../../api";
import BwbTiteldeel from "./bwb-titeldeel";

function BwbBoek({ bwbId, boek }: { bwbId?: string; boek?: Boek }) {
  if (!boek) {
    return <></>;
  }

  const label = boek.kop?.label?.join(" ");
  const nummer = boek.kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titelTekst = boek.kop?.titel
    ?.map((titel) => titel.text?.join(" "))
    .join(" ");

  const basisTitel = `${label} ${nummer}`.trim();
  const title = titelTekst ? `${basisTitel}. ${titelTekst}` : basisTitel;
  return (
    <>
      <div className="boek" id={boek.id ?? ""}>
        <div className="article__header--law boek">
          <h4 id={boek.id ?? ""}>{title}</h4>
        </div>
        {boek.titeldeel?.map((titeldeel, index: number) => {
          const key = `${titeldeel.id}_titeldeel_${index}`;
          return (
            <BwbTiteldeel
              id={key}
              key={key}
              bwbId={bwbId}
              titeldeel={titeldeel}
            ></BwbTiteldeel>
          );
        })}
      </div>
    </>
  );
}

export default BwbBoek;
