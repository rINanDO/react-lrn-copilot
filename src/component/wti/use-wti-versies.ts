import { useEffect, useState } from "react";
import { generatePath } from "react-router-dom";
import { getManifest, type Manifest } from "../../api/bwbRepository";
import { appRoutes } from "../../router/routes";

/** Maps a date (`yyyy-mm-dd`) to the route of the version that starts on it. */
export type VersiePaden = ReadonlyMap<string, string>;

const GEEN_VERSIES: VersiePaden = new Map();

/**
 * The routes of the versions of a BWB work, by date. Expressions are ordered
 * oldest first, so of several on one date the last correction wins. A current
 * version wins from a future one.
 */
export function toVersiePaden(
  bwbId: string,
  huidig?: Manifest,
  toekomstig?: Manifest,
): VersiePaden {
  const paden = new Map<string, string>();
  const voegToe = (manifest: Manifest | undefined, route: string) => {
    for (const { label } of manifest?.expressions ?? []) {
      paden.set(
        label.split("_")[0],
        generatePath(route, { bwbid: bwbId, expression: label }),
      );
    }
  };
  voegToe(toekomstig, appRoutes.bwbtt);
  voegToe(huidig, appRoutes.bwb);
  return paden;
}

/**
 * Loads which versions of a BWB work exist. A manifest that cannot be loaded
 * counts as having no versions: most works have no manifest of future
 * versions, and the page is usable without these links.
 */
export function useWtiVersies(bwbId: string): VersiePaden {
  const [state, setState] = useState<{ bwbId: string; paden: VersiePaden }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.allSettled([
      getManifest(bwbId, { signal }),
      getManifest(bwbId, { signal }, true),
    ]).then(([huidig, toekomstig]) => {
      if (signal.aborted) return;
      setState({
        bwbId,
        paden: toVersiePaden(
          bwbId,
          huidig.status === "fulfilled" ? huidig.value : undefined,
          toekomstig.status === "fulfilled" ? toekomstig.value : undefined,
        ),
      });
    });
    return () => controller.abort();
  }, [bwbId]);

  return state?.bwbId === bwbId ? state.paden : GEEN_VERSIES;
}
