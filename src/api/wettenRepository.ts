import type { Toestand } from "./types.gen";
import { mapElement } from "./xmlToModel";

export const WETTEN_REPOSITORY_BASE_URL =
  "https://repository.officiele-overheidspublicaties.nl";

export type GetToestandOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
};

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

/** URL of an illustration (e.g. `247668.png`), stored next to the toestand XML. */
export function getIllustratieUrl(
  bwbId: string,
  expression: string,
  naam: string,
  isToekomstig: boolean = false,
  baseUrl = WETTEN_REPOSITORY_BASE_URL,
): string {
  const path = isToekomstig ? "BWBTT" : "BWB";
  return `${baseUrl}/${path}/${encodeURIComponent(bwbId)}/${encodeURIComponent(expression)}/xml/${encodeURIComponent(naam)}`;
}

export function parseToestand(xml: string): Toestand {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  replaceElementsByText("al", document);
  replaceElementsByText("tussenkop", document);
  replaceElementsByText("titel", document);
  replaceElementsByText("subtitel", document);
  replaceElementsByText("intitule", document);

  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid toestand XML: ${parseError.textContent}`);
  }
  return mapElement(document.documentElement, "Toestand") as Toestand;
}

/** Replaces the content of every `elementTag` element by a single text node holding its inner XML. */
export function replaceElementsByText(
  elementTag: string,
  document: Document,
): void {
  const serializer = new XMLSerializer();
  // Copy to an array first: getElementsByTagName returns a live collection.
  for (const element of Array.from(document.getElementsByTagName(elementTag))) {
    const innerXml = Array.from(element.childNodes)
      .map((node) => serializer.serializeToString(node))
      .join("");
    element.replaceChildren(document.createTextNode(innerXml));
  }
}

/** Fetches a BWB toestand (e.g. `BWBR0001840`, `2023-02-22_0`) and maps it to a `Toestand`. */
export async function getToestand(
  bwbId: string,
  expression: string,
  isToekomstig: boolean = false,
  { baseUrl, signal }: GetToestandOptions = {},
): Promise<Toestand> {
  const response = await fetch(
    getToestandUrl(bwbId, expression, isToekomstig, baseUrl),
    {
      headers: { Accept: "application/xml" },
      signal,
    },
  );
  if (!response.ok) {
    throw new Error(
      `Fetching toestand ${bwbId} ${expression} failed: ${response.status} ${response.statusText}`,
    );
  }
  return parseToestand(await response.text());
}
