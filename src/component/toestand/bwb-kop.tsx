import {
  Heading,
  type HeadingLevel,
} from "@rijkshuisstijl-community/heading-react/no-side-effects";
import type { Kop } from "../../api";
import BwbRawText from "./bwb-raw-text";
import BwbSubtitel from "./bwb-subtitel";

function BwbKop({
  id,
  kop,
  headingLevel,
  includeDot,
}: {
  id: string;
  kop?: Kop;
  headingLevel: HeadingLevel;
  includeDot?: boolean;
}) {
  if (!kop) {
    return <></>;
  }
  const labelText = kop.label?.join(" ");
  const numberText = kop.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titleText = kop.titel?.map((titel) => titel.text?.join(" ")).join(" ");
  const dot = includeDot && numberText && titleText ? "." : "";

  return (
    <>
      <Heading level={headingLevel}>
        {labelText} {numberText}
        {dot} <BwbRawText id={id} key={id} rawText={titleText} />
      </Heading>
      {kop.subtitel?.map((subtitel, index) => (
        <BwbSubtitel key={`${id}_subtitel${index}`} subtitel={subtitel} />
      ))}
    </>
  );
}

export default BwbKop;
