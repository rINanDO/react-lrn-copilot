import { useEffect, useEffectEvent, useState } from "react";
import {
  hasCvdrSearchCriteria,
  searchCvdr,
  SruDiagnosticError,
  type CvdrSearchCriteria,
  type CvdrSearchResult,
} from "../../api/sruRepository";
import type { WetgevingLoadError } from "../document/use-wetgeving";

export type CvdrSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: WetgevingLoadError }
  | { status: "loaded"; result: CvdrSearchResult };

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

export function useCvdrSearch(
  criteria: CvdrSearchCriteria,
  page: number,
): CvdrSearchState {
  const idle = !hasCvdrSearchCriteria(criteria);
  const key = JSON.stringify([criteria.q ?? "", page]);
  const [state, setState] = useState<{ key: string; value: CvdrSearchState }>();
  const startSearch = useEffectEvent((signal: AbortSignal) =>
    searchCvdr(criteria, { page, signal }),
  );

  useEffect(() => {
    if (idle) return;
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: CvdrSearchState) => {
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
