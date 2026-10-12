import { useParams, useSearchParams } from "react-router-dom";
import { getToestandUrl } from "../../api/bwbRepository";
import { useToestand } from "./use-toestand";
import BwbToestandHeader from "./bwb-toestand-header";
import DocumentView from "../document/document-view";

interface ToestandViewProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
  /** Text to highlight, from the `q` query-string parameter. */
  highlightQuery?: string | null;
}

/** A BWB toestand, the `<toestand>` root of its XML. */
export function ToestandView({
  bwbId,
  expression,
  isToekomstig,
  highlightQuery,
}: ToestandViewProps) {
  const state = useToestand(bwbId, expression, isToekomstig);
  return (
    <DocumentView
      state={state}
      documentUrl={getToestandUrl(bwbId, expression, isToekomstig)}
      fileName={`${bwbId}_${expression}.xml`}
      highlightQuery={highlightQuery}
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
  const [searchParams] = useSearchParams();
  const bwbId = params.bwbid ?? "";
  const expression = params.expression ?? "";
  const isToekomstig = isToekomstigOverride ?? params.isToekomstig === "true";

  return (
    <ToestandView
      key={`${bwbId}:${expression}:${isToekomstig}`}
      bwbId={bwbId}
      expression={expression}
      isToekomstig={isToekomstig}
      highlightQuery={searchParams.get("q")}
    />
  );
}

export default ToestandPage;
