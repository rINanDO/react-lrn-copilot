import { useEffect, useEffectEvent, useState } from "react";
import {
  hasSearchCriteria,
  searchBwb,
  SruDiagnosticError,
  type BwbSearchCriteria,
  type BwbSearchResult,
} from "../../api/sruRepository";
import type { WetgevingLoadError } from "../document/use-wetgeving";

export type BwbSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: WetgevingLoadError }
  | { status: "loaded"; result: BwbSearchResult };

const SERVICE_ERROR_MESSAGE =
  "De zoekdienst is op dit moment niet bereikbaar. Probeer het later opnieuw.";

function toSearchError(err: unknown): WetgevingLoadError {
  if (err instanceof SruDiagnosticError) {
    return { message: err.message, technical: err.technical };
  }
  return {
    message: SERVICE_ERROR_MESSAGE,
    technical: err instanceof Error ? err.message : String(err),
  };
}

/**
 * Searches the basiswettenbestand whenever the criteria or page change.
 * Without a search text or filter it stays idle and sends no request. Aborts
 * the request when the inputs change or on unmount.
 */
export function useBwbSearch(
  criteria: BwbSearchCriteria,
  page: number,
): BwbSearchState {
  const idle = !hasSearchCriteria(criteria);
  const key = JSON.stringify([
    criteria.q ?? "",
    criteria.soort ?? "",
    criteria.ministerie ?? "",
    criteria.rechtsgebied ?? "",
    page,
  ]);
  // Tagged with the search it belongs to, so a new search reads as loading
  // straight away instead of showing the previous results.
  const [state, setState] = useState<{ key: string; value: BwbSearchState }>();
  const startSearch = useEffectEvent((signal: AbortSignal) =>
    searchBwb(criteria, { page, signal }),
  );

  useEffect(() => {
    if (idle) return;
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: BwbSearchState) => {
      if (!signal.aborted) setState({ key, value });
    };
    startSearch(signal)
      .then((result) => update({ status: "loaded", result }))
      .catch((err: unknown) =>
        update({ status: "error", error: toSearchError(err) }),
      );
    return () => controller.abort();
  }, [key, idle]);

  if (idle) return { status: "idle" };
  return state?.key === key ? state.value : { status: "loading" };
}
