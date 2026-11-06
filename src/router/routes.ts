export const appRoutes = {
  bwbLanding: "/bwb",
  bwbSearch: "/bwb/zoeken",
  bwbExpressions: "/bwb/:bwbid",
  bwb: "/bwb/:bwbid/:expression",
  wti: "/bwb/:bwbid/:expression/:labelid",
  cvdrSearch: "/cvdr",
  cvdr: "/cvdr/:cvdr/:expression",
  bwbtt: "/bwbtt/:bwbid/:expression",
} as const;
