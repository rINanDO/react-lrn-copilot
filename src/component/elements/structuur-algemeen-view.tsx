import {
  isAlItem,
  isLijstItem,
  isPlaatjeItem,
  type StructuurAlgemeenItem,
} from "../../api";
import LijstView from "./lijst-view";
import PlaatjeView from "./plaatje-view";
import RawText from "./raw-text";

function StructuurAlgemeenView({
  id,
  structuurAlgemeen,
  noParagraph,
}: {
  id: string;
  structuurAlgemeen: StructuurAlgemeenItem;
  noParagraph?: boolean;
}) {
  if (!structuurAlgemeen) {
    return <></>;
  }

  return (
    <>
      {(() => {
        if (isLijstItem(structuurAlgemeen))
          return (
            <LijstView
              id={`${id}_lijst`}
              key={`${id}_lijst`}
              lijst={structuurAlgemeen}
            />
          );

        if (isPlaatjeItem(structuurAlgemeen))
          return (
            <PlaatjeView
              id={`${id}_plaatje`}
              key={`${id}_plaatje`}
              plaatje={structuurAlgemeen}
            />
          );
        if (isAlItem(structuurAlgemeen)) {
          return noParagraph ? (
            <>
              <RawText
                id={`${id}_rawText`}
                key={`${id}_rawText`}
                rawText={structuurAlgemeen.text?.join(" ")}
              />
            </>
          ) : (
            <>
              <p className="al">
                <RawText
                  id={`${id}_rawText`}
                  key={`${id}_rawText`}
                  rawText={structuurAlgemeen.text?.join(" ")}
                />
              </p>
            </>
          );
        }

        return (
          <>
            <RawText
              id={`${id}_rawText`}
              key={`${id}_rawText`}
              rawText={structuurAlgemeen.text?.join(" ")}
            />
          </>
        );
      })()}
    </>
  );
}
export default StructuurAlgemeenView;
