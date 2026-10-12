import type { ReactNode } from "react";
import type { Wetgeving } from "../../api";
import { DocumentContext } from "./document-context";
import type { WetgevingState } from "./use-wetgeving";
import LoadingProgress from "./loading-progress";
import LoadError from "./load-error";
import WetgevingView from "../elements/wetgeving-view";
import Footer from "../page/footer";
import SideBar from "../page/side-bar";

interface DocumentViewProps {
  state: WetgevingState;
  /** URL of the document's XML, linked above the document. */
  documentUrl: string;
  fileName: string;
  /** The heading above the regeling text. */
  renderHeader: (wetgeving: Wetgeving | undefined) => ReactNode;
}

/** A loaded BWB or CVDR document: download link, table of contents and regeling text. */
function DocumentView({
  state,
  documentUrl,
  fileName,
  renderHeader,
}: DocumentViewProps) {
  if (state.status === "loading") {
    return <LoadingProgress progress={state.progress} />;
  }
  if (state.status === "error") {
    return <LoadError error={state.error} />;
  }

  const { wetgeving } = state;
  return (
    <div className="document">
      <a href={documentUrl}>{fileName}</a>
      <div className="container columns columns--sticky-sidebar row">
        <DocumentContext.Provider value={{ documentUrl }}>
          <SideBar wetgeving={wetgeving} />
          <div id="content">
            <div id="regeling">
              {renderHeader(wetgeving)}
              <WetgevingView wetgeving={wetgeving} />
            </div>
          </div>
        </DocumentContext.Provider>
      </div>
      <Footer />
    </div>
  );
}

export default DocumentView;
