import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./routes";
import ToestandPage from "../component/bwb/toestand-view";
import BwbExpressions from "../component/bwb/bwb-expressions";
import CvdrPage from "../component/cvdr/cvdr-view";

export const router = createBrowserRouter([
  {
    path: appRoutes.bwbExpressions,
    handle: { title: "Wetten" },
    element: <BwbExpressions />,
  },
  {
    path: appRoutes.bwb,
    handle: { title: "Wetten" },
    element: <ToestandPage isToekomstig={false} />,
  },
  {
    path: appRoutes.cvdr,
    handle: { title: "Wetten" },
    element: <CvdrPage />,
  },
  {
    path: appRoutes.bwbtt,
    handle: { title: "Wetten" },
    element: <ToestandPage isToekomstig={true} />,
  },
]);
