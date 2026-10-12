import type { Li, Lijst } from "../../api";
import LiView from "./li-view";

function LijstView({ id, lijst }: { id: string; lijst: Lijst }) {
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
          return (
            <LiView
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
export default LijstView;
