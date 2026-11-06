import { useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import { getWetTechnischeInformatieUrl } from "../../api/bwbRepository";
import LoadError from "../document/load-error";
import LoadingProgress from "../document/loading-progress";
import { useWetTechnischeInformatie } from "./use-wet-technische-informatie";
import { useWtiVersies } from "./use-wti-versies";
import WtiRegelingLabelView from "./wti-regeling-label-view";

interface WtiViewProps {
  bwbId: string;
  expression: string;
  labelId: string;
}

/** The wetstechnische informatie of one regelingelement of a BWB work. */
export function WtiView({ bwbId, expression, labelId }: WtiViewProps) {
  const state = useWetTechnischeInformatie(bwbId);
  const versiePaden = useWtiVersies(bwbId);

  if (state.status === "loading") {
    return <LoadingProgress progress={state.progress} />;
  }
  if (state.status === "error") {
    return <LoadError error={state.error} />;
  }

  const regelingelement =
    state.informatie.wijzigingen?.regelingelementen?.regelingelement?.find(
      (item) => item.labelId === labelId,
    );

  return (
    <div className="wti">
      <a href={getWetTechnischeInformatieUrl(bwbId)}>{`${bwbId}.wti`}</a>
      <Heading level={1}>Wetstechnische informatie</Heading>
      {regelingelement ? (
        <WtiRegelingLabelView
          regelingelement={regelingelement}
          expression={expression}
          versiePaden={versiePaden}
        />
      ) : (
        <Alert severity="info">
          Er is geen wetstechnische informatie gevonden voor dit
          regelingelement.
        </Alert>
      )}
    </div>
  );
}

/** Route page for the regelingelement named by the URL. */
function WtiPage() {
  const params = useParams();
  return (
    <WtiView
      bwbId={params.bwbid ?? ""}
      expression={params.expression ?? ""}
      labelId={params.labelid ?? ""}
    />
  );
}

export default WtiPage;
