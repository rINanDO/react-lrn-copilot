import { createContext, useContext } from "react";

/** Identifies the document being rendered, for resources stored next to its XML. */
export type BwbToestandContextValue = {
  /** URL of the document's XML. */
  documentUrl: string;
};

export const BwbToestandContext = createContext<
  BwbToestandContextValue | undefined
>(undefined);

export function useBwbToestand(): BwbToestandContextValue | undefined {
  return useContext(BwbToestandContext);
}
