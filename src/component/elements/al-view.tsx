import type { Al } from "../../api";
import { processAlHtml } from "./al-html-processor";

function AlView({ al }: { al: Al }) {
  if (!al) {
    return <></>;
  }
  const rawHtml = processAlHtml(al.text?.[0] ?? "");
  return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;
}

export default AlView;
