import { useParams } from "react-router-dom";
import { getToestandUrl } from "../../api/bwbRepository";
import { useToestand } from "./use-toestand";
import BwbToestandHeader from "./bwb-toestand-header";
import DocumentView from "../document/document-view";

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
