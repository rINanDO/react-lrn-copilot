import { getToestand } from "../../api/bwbRepository";
import { useWetgeving, type WetgevingState } from "../document/use-wetgeving";

/** Loads a toestand, reporting download progress. Aborts the request when the inputs change or on unmount. */
export function useToestand(
  bwbId: string,
  expression: string,
  isToekomstig: boolean,
): WetgevingState {
  return useWetgeving(`${bwbId}:${expression}:${isToekomstig}`, (options) =>
    getToestand(bwbId, expression, isToekomstig, options).then(
      (toestand) => toestand?.wetgeving,
    ),
  );
}
