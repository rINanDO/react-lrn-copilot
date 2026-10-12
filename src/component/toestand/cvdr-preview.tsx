import { useParams } from "react-router-dom";
import { getCvdrUrl } from "../../api/cvdrRepository";
import { useCvdr } from "./use-cvdr";
import DocumentTitle from "../document/document-title";
import DocumentView from "../document/document-view";

interface CvdrPreviewContentProps {
  cvdrId: string;
  expression: string;
}

/** A CVDR regeling, rendered with the element components it shares with BWB. */
export function CvdrPreviewContent({
  cvdrId,
  expression,
}: CvdrPreviewContentProps) {
  const state = useCvdr(cvdrId, expression);
  return (
    <DocumentView
      state={state}
      documentUrl={getCvdrUrl(cvdrId, expression)}
      fileName={`${cvdrId}_${expression}.xml`}
      renderHeader={(wetgeving) => (
        <DocumentTitle citeertitel={wetgeving?.citeertitel} />
      )}
    />
  );
}

function CvdrPreview() {
  const params = useParams();
  const cvdrId = params.cvdr ?? "";
  const expression = params.expression ?? "";

  return (
    <CvdrPreviewContent
      key={`${cvdrId}:${expression}`}
      cvdrId={cvdrId}
      expression={expression}
    />
  );
}

export default CvdrPreview;
