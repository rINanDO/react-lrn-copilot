import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { appRoutes } from "./routes";
import ToestandPage from "../component/bwb/toestand-view";
import BwbExpressions from "../component/bwb/bwb-expressions";
import CvdrPage from "../component/cvdr/cvdr-view";
import BwbLandingPage from "../component/page/bwb-landing-page";
import BwbSearchPage from "../component/search/bwb-search-page";
import CvdrSearchPage from "../component/search/cvdr-search-page";

export const routeObjects: RouteObject[] = [
  {
    path: appRoutes.bwbLanding,
    handle: { title: "Wetten" },
    element: <BwbLandingPage />,
  },
  {
    path: appRoutes.bwbSearch,
    handle: { title: "Zoeken – Wetten" },
    element: <BwbSearchPage />,
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
    path: appRoutes.cvdrSearch,
    handle: { title: "Zoeken – CVDR" },
    element: <CvdrSearchPage />,
  },
  {
    path: appRoutes.bwbtt,
    handle: { title: "Wetten" },
    element: <ToestandPage isToekomstig={true} />,
  },
];

export const router = createBrowserRouter(routeObjects);
