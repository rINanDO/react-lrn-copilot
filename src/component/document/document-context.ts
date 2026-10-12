import { createContext, useContext } from "react";

/** Identifies the document being rendered, for resources stored next to its XML. */
export type DocumentContextValue = {
  /** URL of the document's XML. */
  documentUrl: string;
};

export const DocumentContext = createContext<
  DocumentContextValue | undefined
>(undefined);

export function useDocumentContext(): DocumentContextValue | undefined {
  return useContext(DocumentContext);
}
