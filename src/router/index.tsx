import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./routes";
import BwbPreview from "../component/toestand/bwb-preview";
import BwbExpressions from "../component/toestand/bwb-expressions";

export const router = createBrowserRouter([
  {
    path: appRoutes.bwbExpressions,
    handle: { title: "Wetten" },
    element: <BwbExpressions />,
  },
  {
    path: appRoutes.bwb,
    handle: { title: "Wetten" },
    element: <BwbPreview isToekomstig={false} />,
  },
  {
    path: appRoutes.bwbtt,
    handle: { title: "Wetten" },
    element: <BwbPreview isToekomstig={true} />,
  },
]);
