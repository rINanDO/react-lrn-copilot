export const appRoutes = {
  bwbLanding: "/bwb",
  bwbSearch: "/bwb/zoeken",
  bwbExpressions: "/bwb/:bwbid",
  bwb: "/bwb/:bwbid/:expression",
  cvdrSearch: "/cvdr/zoeken",
  cvdr: "/cvdr/:cvdr/:expression",
  bwbtt: "/bwbtt/:bwbid/:expression",
} as const;
