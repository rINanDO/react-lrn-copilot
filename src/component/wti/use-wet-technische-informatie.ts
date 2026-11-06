import { useEffect, useState } from "react";
import { getWetTechnischeInformatie } from "../../api/bwbRepository";
import type { LoadProgress } from "../../api/repository";
import type { wetstechnischeinformatie } from "../../api/types.gen";
import { toLoadError, type WetgevingLoadError } from "../document/use-wetgeving";

export type WetTechnischeInformatieState =
  | { status: "loading"; progress?: LoadProgress }
  | { status: "error"; error: WetgevingLoadError }
  | { status: "loaded"; informatie: wetstechnischeinformatie };

/**
 * Loads the wetstechnische informatie of a BWB work, reporting download
 * progress. Aborts the request when `bwbId` changes or on unmount.
 */
export function useWetTechnischeInformatie(
  bwbId: string,
): WetTechnischeInformatieState {
  // Tagged with the work it belongs to, so a change of `bwbId` reads as
  // loading straight away instead of showing the previous work.
  const [state, setState] = useState<{
    bwbId: string;
    value: WetTechnischeInformatieState;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (value: WetTechnischeInformatieState) => {
      if (!signal.aborted) setState({ bwbId, value });
    };
    getWetTechnischeInformatie(bwbId, {
      onProgress: (progress) => update({ status: "loading", progress }),
      signal,
    })
      .then((informatie) => update({ status: "loaded", informatie }))
      .catch((err: unknown) =>
        update({ status: "error", error: toLoadError(err) }),
      );
    return () => controller.abort();
  }, [bwbId]);

  return state?.bwbId === bwbId ? state.value : { status: "loading" };
}
