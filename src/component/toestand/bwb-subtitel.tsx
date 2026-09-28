import type { ClassTitel } from "../../api";
import BwbRawText from "./bwb-raw-text";

function BwbSubtitel({ subtitel }: { subtitel?: ClassTitel }) {
  if (!subtitel) {
    return <></>;
  }
  return (
    <>
      * TODO Subtitel
      {subtitel.text?.map((rawText, index) => (
        <BwbRawText id={`index_${index}`} key={index} rawText={rawText} />
      ))}
    </>
  );
}

export default BwbSubtitel;
