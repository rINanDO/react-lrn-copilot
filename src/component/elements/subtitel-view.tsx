import type { ClassTitel } from "../../api";
import RawText from "./raw-text";

function SubtitelView({ subtitel }: { subtitel?: ClassTitel }) {
  if (!subtitel) {
    return <></>;
  }
  return (
    <>
      * TODO Subtitel
      {subtitel.text?.map((rawText, index) => (
        <RawText id={`index_${index}`} key={index} rawText={rawText} />
      ))}
    </>
  );
}

export default SubtitelView;
