import { memo } from "react";
import type { Wetgeving } from "../../api";
import VerdragView from "./verdrag-view";
import RegelingTekstView from "./regeling-tekst-view";
import WettekstView from "./wettekst-view";
import BijlageView from "./bijlage-view";

/** The regulation body: treaties, regulation text, law text and annexes, in that order. */
function WetgevingView({
  wetgeving,
}: {
  wetgeving: Wetgeving | undefined;
}) {
  return (
    <div className="wetgeving">
      {wetgeving?.verdrag?.map((verdrag, index) => (
        <VerdragView key={verdrag.id ?? index} verdrag={verdrag} />
      ))}
      <RegelingTekstView
        regelingTekst={wetgeving?.regeling?.regelingTekst}
      />
      <WettekstView wettekst={wetgeving?.wetBesluit?.wettekst} />
      {wetgeving?.regeling?.bijlage?.map((bijlage, index) => (
        <BijlageView key={`bijlage_${index}`} bijlage={bijlage} />
      ))}
    </div>
  );
}

export default memo(WetgevingView);
