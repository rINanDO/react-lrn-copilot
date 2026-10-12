import type { Intitule, Regeling, Wetgeving } from "./types.gen";
import { mapElement } from "./xmlToModel";
import {
  fetchXml,
  parseXmlDocument,
  WETTEN_REPOSITORY_BASE_URL,
  type FetchOptions,
} from "./repository";

/** URL of a CVDR regeling (e.g. `CVDR744131`, expression `2`). */
export function getCvdrUrl(
  cvdrId: string,
  expression: string,
  baseUrl = WETTEN_REPOSITORY_BASE_URL,
): string {
  const id = encodeURIComponent(cvdrId);
  const expr = encodeURIComponent(expression);
  return `${baseUrl}/CVDR/${id}/${expr}/xml/${id}_${expr}.xml`;
}

/**
 * Parses a CVDR regeling into a `Wetgeving`. Its body uses the BWB elements
 * (`regeling`, `hoofdstuk`, `artikel`, ...); the title comes from the metadata.
 */
export function parseCvdr(xml: string): Wetgeving {
  const document = parseXmlDocument(xml, "CVDR");
  const root = document.documentElement;
  const child = (parent: Element | null | undefined, name: string) =>
    Array.from(parent?.children ?? []).find((element) => element.localName === name);
  const owmskern = child(child(root, "meta"), "owmskern");
  const body = child(root, "body");
  const intitule = child(body, "intitule");
  const regeling = child(body, "regeling");
  const title = child(owmskern, "title")?.textContent ?? "";

  return {
    id: child(owmskern, "identifier")?.textContent ?? "",
    citeertitel: { text: [title] },
    intitule: (intitule ? mapElement(intitule, "Intitule") : {}) as Intitule,
    regeling: regeling ? (mapElement(regeling, "Regeling") as Regeling) : undefined,
  } as Wetgeving;
}

/** Fetches a CVDR regeling (e.g. `CVDR744131`, `2`) and maps it to a `Wetgeving`. */
export async function getCvdr(
  cvdrId: string,
  expression: string,
  { baseUrl, ...options }: FetchOptions = {},
): Promise<Wetgeving> {
  const xml = await fetchXml(
    getCvdrUrl(cvdrId, expression, baseUrl),
    `CVDR ${cvdrId} ${expression}`,
    options,
  );
  return parseCvdr(xml);
}
