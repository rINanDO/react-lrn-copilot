import { useParams } from "react-router-dom";
import { getCvdrUrl } from "../../api/cvdrRepository";
import { useCvdr } from "./use-cvdr";
import DocumentTitle from "../document/document-title";
import DocumentView from "../document/document-view";

interface CvdrViewProps {
  cvdrId: string;
  expression: string;
}

/** A CVDR regeling, the `<cvdr>` root of its XML, rendered with the element components it shares with BWB. */
export function CvdrView({
  cvdrId,
  expression,
}: CvdrViewProps) {
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

/** Route page showing the CVDR regeling named by the URL. */
function CvdrPage() {
  const params = useParams();
  const cvdrId = params.cvdr ?? "";
  const expression = params.expression ?? "";

  return (
    <CvdrView
      key={`${cvdrId}:${expression}`}
      cvdrId={cvdrId}
      expression={expression}
    />
  );
}

export default CvdrPage;
