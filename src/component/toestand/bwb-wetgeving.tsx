import { memo } from "react";
import type { Wetgeving } from "../../api";
import BwbVerdrag from "./bwb-verdrag";
import BwbRegelingTekst from "./bwb-regeling-tekst";
import BwbWettekst from "./bwb-wettekst";
import BwbBijlage from "./bwb-bijlage";

/** The regulation body: treaties, regulation text, law text and annexes, in that order. */
function BwbWetgeving({
  wetgeving,
}: {
  wetgeving: Wetgeving | undefined;
}) {
  return (
    <div className="wetgeving">
      {wetgeving?.verdrag?.map((verdrag, index) => (
        <BwbVerdrag key={verdrag.id ?? index} verdrag={verdrag} />
      ))}
      <BwbRegelingTekst
        regelingTekst={wetgeving?.regeling?.regelingTekst}
      />
      <BwbWettekst wettekst={wetgeving?.wetBesluit?.wettekst} />
      {wetgeving?.regeling?.bijlage?.map((bijlage, index) => (
        <BwbBijlage key={`bijlage_${index}`} bijlage={bijlage} />
      ))}
    </div>
  );
}

export default memo(BwbWetgeving);
