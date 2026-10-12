import { useEffect, useState } from "react";
import type { Wetgeving } from "../../api";
import { getToestand } from "../../api/bwbRepository";
import { getCvdr } from "../../api/cvdrRepository";
import type { FetchOptions, LoadProgress } from "../../api/repository";

export type ToestandLoadError = {
  message: string;
  /** Extra detail for developers; only shown in development builds. */
  technical?: string;
};

export type ToestandState =
  | { status: "loading"; progress?: LoadProgress }
  | { status: "error"; error: ToestandLoadError }
  | { status: "loaded"; wetgeving: Wetgeving | undefined };

const GENERIC_ERROR_MESSAGE =
  "Er is een fout opgetreden bij het laden van de preview.";

export function toLoadError(err: unknown): ToestandLoadError {
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: GENERIC_ERROR_MESSAGE, technical: String(err) };
}

/** Loads a toestand, reporting download progress. Aborts the request when the inputs change or on unmount. */
export function useToestand(
  bwbId: string,
  expression: string,
  isToekomstig: boolean,
): ToestandState {
  return useWetgeving(`${bwbId}:${expression}:${isToekomstig}`, (options) =>
    getToestand(bwbId, expression, isToekomstig, options).then(
      (toestand) => toestand?.wetgeving,
    ),
  );
}

/** Loads a CVDR regeling, like `useToestand`. */
export function useCvdr(cvdrId: string, expression: string): ToestandState {
  return useWetgeving(`CVDR:${cvdrId}:${expression}`, (options) =>
    getCvdr(cvdrId, expression, options),
  );
}

/**
 * Runs `load` whenever `key` changes, reporting download progress. Aborts the
 * request when the key changes or on unmount. `key` must identify everything
 * `load` depends on.
 */
function useWetgeving(
  key: string,
  load: (
    options: Required<Pick<FetchOptions, "onProgress" | "signal">>,
  ) => Promise<Wetgeving | undefined>,
): ToestandState {
  // Tagged with the document it belongs to, so a change of inputs reads as
  // loading straight away instead of showing the previous document.
  const [state, setState] = useState<{ key: string; value: ToestandState }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: ToestandState) => {
      if (!signal.aborted) setState({ key, value });
    };
    load({
      onProgress: (progress) => update({ status: "loading", progress }),
      signal,
    })
      .then((wetgeving) => update({ status: "loaded", wetgeving }))
      .catch((err: unknown) =>
        update({ status: "error", error: toLoadError(err) }),
      );
    return () => controller.abort();
    // `key` identifies the inputs `load` closes over.
  }, [key]);

  return state?.key === key ? state.value : { status: "loading" };
}
