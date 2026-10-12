import { getCvdr } from "../../api/cvdrRepository";
import { useWetgeving, type WetgevingState } from "../document/use-wetgeving";

/** Loads a CVDR regeling, reporting download progress. Aborts the request when the inputs change or on unmount. */
export function useCvdr(cvdrId: string, expression: string): WetgevingState {
  return useWetgeving(`${cvdrId}:${expression}`, (options) =>
    getCvdr(cvdrId, expression, options),
  );
}
