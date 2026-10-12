import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./routes";
import ToestandPage from "../component/bwb/toestand-view";
import BwbExpressions from "../component/bwb/bwb-expressions";
import CvdrPage from "../component/cvdr/cvdr-view";
import BwbLandingPage from "../component/page/bwb-landing-page";

export const router = createBrowserRouter([
  {
    path: appRoutes.bwbLanding,
    handle: { title: "Wetten" },
    element: <BwbLandingPage />,
  },
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
