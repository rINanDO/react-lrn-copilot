import type { Li, Lijst } from "../../api";
import BwbLi from "./bwb-li";

function BwbLijst({ id, lijst }: { id: string; lijst: Lijst }) {
  if (!lijst) {
    return <></>;
  }
  return (
    <>
      <ul
        key={`${id}`}
        className="list--law__unordered expliciet whitspace-small"
      >
        {lijst.li.map((listItem: Li, index: number) => {
          debugger;
          return (
            <BwbLi
              id={`${id}_item${index}`}
              key={`${id}_item${index}`}
              li={listItem}
            />
          );
        })}
      </ul>
    </>
  );
}
export default BwbLijst;
