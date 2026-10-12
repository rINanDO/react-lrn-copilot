import { useParams } from "react-router-dom";
import { getToestandUrl } from "../../api/bwbRepository";
import { useToestand } from "./use-toestand";
import BwbToestandHeader from "./bwb-toestand-header";
import DocumentView from "../document/document-view";

interface ToestandViewProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
}

/** A BWB toestand, the `<toestand>` root of its XML. */
export function ToestandView({
  bwbId,
  expression,
  isToekomstig,
}: ToestandViewProps) {
  const state = useToestand(bwbId, expression, isToekomstig);
  return (
    <DocumentView
      state={state}
      documentUrl={getToestandUrl(bwbId, expression, isToekomstig)}
      fileName={`${bwbId}_${expression}.xml`}
      renderHeader={(wetgeving) => (
        <BwbToestandHeader
          bwbId={bwbId}
          expression={expression}
          isToekomstig={isToekomstig}
          citeertitel={wetgeving?.citeertitel}
        />
      )}
    />
  );
}

/** Route page showing the toestand named by the URL. */
function ToestandPage({
  isToekomstig: isToekomstigOverride,
}: { isToekomstig?: boolean } = {}) {
  const params = useParams();
  const bwbId = params.bwbid ?? "";
  const expression = params.expression ?? "";
  const isToekomstig = isToekomstigOverride ?? params.isToekomstig === "true";

  return (
    <ToestandView
      key={`${bwbId}:${expression}:${isToekomstig}`}
      bwbId={bwbId}
      expression={expression}
      isToekomstig={isToekomstig}
    />
  );
}

export default ToestandPage;
