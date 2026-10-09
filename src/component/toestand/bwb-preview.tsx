import { useParams } from "react-router-dom";
import { getToestandUrl } from "../../api/wettenRepository";
import { BwbToestandContext } from "./bwb-toestand-context";
import { useToestand } from "./use-toestand";
import BwbLoadingProgress from "./bwb-loading-progress";
import BwbLoadError from "./bwb-load-error";
import BwbToestandHeader from "./bwb-toestand-header";
import BwbWetgeving from "./bwb-wetgeving";
import Footer from "../page/footer";
import SideBar from "../page/side-bar";

interface BwbPreviewContentProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
}

export function BwbPreviewContent({
  bwbId,
  expression,
  isToekomstig,
}: BwbPreviewContentProps) {
  const toestand = useToestand(bwbId, expression, isToekomstig);

  if (toestand.status === "loading") {
    return <BwbLoadingProgress progress={toestand.progress} />;
  }
  if (toestand.status === "error") {
    return <BwbLoadError error={toestand.error} />;
  }

  const { wetgeving } = toestand;
  return (
    <div className="preview">
      <a href={getToestandUrl(bwbId, expression, isToekomstig)}>
        {bwbId}_{expression}.xml
      </a>
      <div className="container columns columns--sticky-sidebar row">
        <BwbToestandContext.Provider value={{ bwbId, expression, isToekomstig }}>
          <SideBar wetgeving={wetgeving} />
          <div id="content">
            <div id="regeling">
              <BwbToestandHeader
                bwbId={bwbId}
                expression={expression}
                isToekomstig={isToekomstig}
                citeertitel={wetgeving?.citeertitel}
              />
              <BwbWetgeving bwbId={bwbId} wetgeving={wetgeving} />
            </div>
          </div>
        </BwbToestandContext.Provider>
      </div>
      <Footer />
    </div>
  );
}

function BwbPreview({
  isToekomstig: isToekomstigOverride,
}: { isToekomstig?: boolean } = {}) {
  const params = useParams();
  const bwbId = params.bwbid ?? "";
  const expression = params.expression ?? "";
  const isToekomstig = isToekomstigOverride ?? params.isToekomstig === "true";

  return (
    <BwbPreviewContent
      key={`${bwbId}:${expression}:${isToekomstig}`}
      bwbId={bwbId}
      expression={expression}
      isToekomstig={isToekomstig}
    />
  );
}

export default BwbPreview;
