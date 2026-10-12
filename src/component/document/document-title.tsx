import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import type { Citeertitel } from "../../api";
import RawText from "../elements/raw-text";

/** The document's citeertitel as its main heading. */
function DocumentTitle({ citeertitel }: { citeertitel?: Citeertitel }) {
  return (
    <Heading level={1}>
      <RawText id="citeerTitel" rawText={citeertitel?.text?.join(" ")} />
    </Heading>
  );
}

export default DocumentTitle;
