import { useEffect, useEffectEvent, useState } from "react";
import type { Wetgeving } from "../../api";
import type { FetchOptions, LoadProgress } from "../../api/repository";

export type WetgevingLoadError = {
  message: string;
  /** Extra detail for developers; only shown in development builds. */
  technical?: string;
};

export type WetgevingState =
  | { status: "loading"; progress?: LoadProgress }
  | { status: "error"; error: WetgevingLoadError }
  | { status: "loaded"; wetgeving: Wetgeving | undefined };

const GENERIC_ERROR_MESSAGE =
  "Er is een fout opgetreden bij het laden van de regeling.";

export function toLoadError(err: unknown): WetgevingLoadError {
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: GENERIC_ERROR_MESSAGE, technical: String(err) };
}

/**
 * Loads the wetgeving of a BWB or CVDR document: runs `load` whenever `key`
 * changes, reporting download progress. Aborts the request when the key
 * changes or on unmount. `key` must identify everything `load` depends on.
 */
export function useWetgeving(
  key: string,
  load: (
    options: Required<Pick<FetchOptions, "onProgress" | "signal">>,
  ) => Promise<Wetgeving | undefined>,
): WetgevingState {
  // Tagged with the document it belongs to, so a change of inputs reads as
  // loading straight away instead of showing the previous document.
  const [state, setState] = useState<{ key: string; value: WetgevingState }>();
  const startLoad = useEffectEvent(load);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: WetgevingState) => {
      if (!signal.aborted) setState({ key, value });
    };
    startLoad({
      onProgress: (progress) => update({ status: "loading", progress }),
      signal,
    })
      .then((wetgeving) => update({ status: "loaded", wetgeving }))
      .catch((err: unknown) =>
        update({ status: "error", error: toLoadError(err) }),
      );
    return () => controller.abort();
  }, [key]);

  return state?.key === key ? state.value : { status: "loading" };
}
