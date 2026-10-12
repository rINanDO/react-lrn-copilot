import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./routes";
import BwbPreview from "../component/bwb/bwb-preview";
import BwbExpressions from "../component/bwb/bwb-expressions";
import CvdrPreview from "../component/cvdr/cvdr-preview";

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
    path: appRoutes.cvdr,
    handle: { title: "Wetten" },
    element: <CvdrPreview />,
  },
  {
    path: appRoutes.bwbtt,
    handle: { title: "Wetten" },
    element: <BwbPreview isToekomstig={true} />,
  },
]);
