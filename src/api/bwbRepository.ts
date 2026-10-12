import type { Toestand } from "./types.gen";
import { mapElement } from "./xmlToModel";
import {
  fetchXml,
  parseXmlDocument,
  WETTEN_REPOSITORY_BASE_URL,
  type FetchOptions,
} from "./repository";

export function getToestandUrl(
  bwbId: string,
  expression: string,
  isToekomstig: boolean = false,
  baseUrl = WETTEN_REPOSITORY_BASE_URL,
): string {
  const id = encodeURIComponent(bwbId);
  const expr = encodeURIComponent(expression);
  var path = isToekomstig ? "BWBTT" : "BWB";
  return `${baseUrl}/${path}/${id}/${expr}/xml/${id}_${expr}.xml`;
}

export function parseToestand(xml: string): Toestand {
  const document = parseXmlDocument(xml, "toestand");
  return mapElement(document.documentElement, "Toestand") as Toestand;
}

/** Fetches a BWB toestand (e.g. `BWBR0001840`, `2023-02-22_0`) and maps it to a `Toestand`. */
export async function getToestand(
  bwbId: string,
  expression: string,
  isToekomstig: boolean = false,
  { baseUrl, ...options }: FetchOptions = {},
): Promise<Toestand> {
  const xml = await fetchXml(
    getToestandUrl(bwbId, expression, isToekomstig, baseUrl),
    `toestand ${bwbId} ${expression}`,
    options,
  );
  return parseToestand(xml);
}

export type ManifestExpression = {
  /** Expression label, e.g. `2023-02-22_0`. */
  label: string;
  datumInwerkingtreding?: string;
  einddatum?: string;
};

export type Manifest = {
  bwbId: string;
  expressions: ManifestExpression[];
};

export function getManifestUrl(
  bwbId: string,
  baseUrl = WETTEN_REPOSITORY_BASE_URL,
): string {
  return `${baseUrl}/BWB/${encodeURIComponent(bwbId)}/manifest.xml`;
}

/**
 * Orders expression labels (`2025-01-01_4`) chronologically: by date, then by
 * the numeric sequence, so `_10` comes after `_9`.
 */
function compareExpressionLabels(
  a: ManifestExpression,
  b: ManifestExpression,
): number {
  const [dateA, seqA = "0"] = a.label.split("_");
  const [dateB, seqB = "0"] = b.label.split("_");
  return dateA.localeCompare(dateB) || Number(seqA) - Number(seqB);
}

/**
 * Parses a BWB work manifest into its expressions, oldest first. The manifest
 * itself is not ordered. Expressions whose items are all deleted are skipped.
 */
export function parseManifest(xml: string): Manifest {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid manifest XML: ${parseError.textContent}`);
  }

  const metadataValue = (element: Element, name: string) =>
    element.querySelector(`:scope > metadata > ${name}`)?.textContent ??
    undefined;

  const expressions = Array.from(
    document.documentElement.querySelectorAll(":scope > expression"),
  )
    .filter((expression) =>
      Array.from(expression.querySelectorAll("item")).some(
        (item) => item.getAttribute("_deleted") !== "true",
      ),
    )
    .map((expression) => ({
      label: expression.getAttribute("label") ?? "",
      datumInwerkingtreding: metadataValue(
        expression,
        "datum_inwerkingtreding",
      ),
      einddatum: metadataValue(expression, "einddatum"),
    }))
    .sort(compareExpressionLabels);

  return {
    bwbId: document.documentElement.getAttribute("label") ?? "",
    expressions,
  };
}

/** Fetches the manifest of a BWB work (e.g. `BWBR0001840`), listing its expressions. */
export async function getManifest(
  bwbId: string,
  { baseUrl, signal }: FetchOptions = {},
): Promise<Manifest> {
  const response = await fetch(getManifestUrl(bwbId, baseUrl), {
    headers: { Accept: "application/xml" },
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Fetching manifest ${bwbId} failed: ${response.status} ${response.statusText}`,
    );
  }
  return parseManifest(await response.text());
}
