import { useEffect, useState } from "react";
import type { Wetgeving } from "../../api";
import {
  getToestand,
  type ToestandProgress,
} from "../../api/wettenRepository";

export type ToestandLoadError = {
  message: string;
  /** Extra detail for developers; only shown in development builds. */
  technical?: string;
};

export type ToestandState =
  | { status: "loading"; progress?: ToestandProgress }
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
  const key = `${bwbId}:${expression}:${isToekomstig}`;
  // Tagged with the toestand it belongs to, so a change of inputs reads as
  // loading straight away instead of showing the previous toestand.
  const [state, setState] = useState<{ key: string; value: ToestandState }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: ToestandState) => {
      if (!signal.aborted) setState({ key, value });
    };
    getToestand(bwbId, expression, isToekomstig, {
      onProgress: (progress) => update({ status: "loading", progress }),
      signal,
    })
      .then((toestand) =>
        update({ status: "loaded", wetgeving: toestand?.wetgeving }),
      )
      .catch((err: unknown) =>
        update({ status: "error", error: toLoadError(err) }),
      );
    return () => controller.abort();
  }, [key, bwbId, expression, isToekomstig]);

  return state?.key === key ? state.value : { status: "loading" };
}
