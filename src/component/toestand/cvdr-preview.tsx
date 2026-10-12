import { useParams } from "react-router-dom";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import { getCvdrUrl } from "../../api/wettenRepository";
import { BwbToestandContext } from "./bwb-toestand-context";
import { useCvdr } from "./use-toestand";
import BwbLoadingProgress from "./bwb-loading-progress";
import BwbLoadError from "./bwb-load-error";
import BwbRawText from "./bwb-raw-text";
import BwbWetgeving from "./bwb-wetgeving";
import Footer from "../page/footer";
import SideBar from "../page/side-bar";

interface CvdrPreviewContentProps {
  cvdrId: string;
  expression: string;
}

/** A CVDR regeling, rendered with the BWB components its body shares. */
export function CvdrPreviewContent({
  cvdrId,
  expression,
}: CvdrPreviewContentProps) {
  const cvdr = useCvdr(cvdrId, expression);

  if (cvdr.status === "loading") {
    return <BwbLoadingProgress progress={cvdr.progress} />;
  }
  if (cvdr.status === "error") {
    return <BwbLoadError error={cvdr.error} />;
  }

  const { wetgeving } = cvdr;
  const documentUrl = getCvdrUrl(cvdrId, expression);
  return (
    <div className="preview">
      <a href={documentUrl}>
        {cvdrId}_{expression}.xml
      </a>
      <div className="container columns columns--sticky-sidebar row">
        <BwbToestandContext.Provider value={{ documentUrl }}>
          <SideBar wetgeving={wetgeving} />
          <div id="content">
            <div id="regeling">
              <Heading level={1}>
                <BwbRawText
                  id="citeerTitel"
                  rawText={wetgeving?.citeertitel?.text?.join(" ")}
                />
              </Heading>
              <BwbWetgeving bwbId={cvdrId} wetgeving={wetgeving} />
            </div>
          </div>
        </BwbToestandContext.Provider>
      </div>
      <Footer />
    </div>
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
