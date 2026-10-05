import { createContext, useContext } from "react";

/** Identifies the toestand being rendered, for resources stored next to its XML. */
export type BwbToestandContextValue = {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
};

export const BwbToestandContext = createContext<
  BwbToestandContextValue | undefined
>(undefined);

export function useBwbToestand(): BwbToestandContextValue | undefined {
  return useContext(BwbToestandContext);
}
