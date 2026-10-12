import {
  Heading,
  type HeadingLevel,
} from "@rijkshuisstijl-community/heading-react/no-side-effects";
import type { Kop } from "../../api";
import RawText from "./raw-text";
import SubtitelView from "./subtitel-view";

function KopView({
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
        {dot} <RawText id={id} key={id} rawText={titleText} />
      </Heading>
      {kop.subtitel?.map((subtitel, index) => (
        <SubtitelView key={`${id}_subtitel${index}`} subtitel={subtitel} />
      ))}
    </>
  );
}

export default KopView;
