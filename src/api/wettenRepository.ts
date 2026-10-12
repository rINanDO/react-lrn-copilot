import type { Intitule, Regeling, Toestand, Wetgeving } from "./types.gen";
import { mapElement } from "./xmlToModel";

export const WETTEN_REPOSITORY_BASE_URL =
  "https://repository.officiele-overheidspublicaties.nl";

export type GetToestandOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
  /** Called while the toestand downloads, and once more before it is parsed. */
  onProgress?: (progress: ToestandProgress) => void;
};

export type ToestandProgress = {
  phase: "downloading" | "parsing";
  /** Bytes received so far. */
  loaded: number;
  /** Total bytes, when the server reports a usable Content-Length. */
  total?: number;
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

/** URL of an illustration (e.g. `247668.png`), stored next to the XML at `documentUrl`. */
export function getIllustratieUrl(documentUrl: string, naam: string): string {
  return new URL(encodeURIComponent(naam), documentUrl).href;
}

/** Parses XML whose text elements (`al`, `titel`, ...) are kept as raw inner XML. */
function parseXmlDocument(xml: string, description: string): Document {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  replaceElementsByText("al", document);
  replaceElementsByText("tussenkop", document);
  replaceElementsByText("titel", document);
  replaceElementsByText("subtitel", document);
  replaceElementsByText("intitule", document);

  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid ${description} XML: ${parseError.textContent}`);
  }
  return document;
}

export function parseToestand(xml: string): Toestand {
  const document = parseXmlDocument(xml, "toestand");
  return mapElement(document.documentElement, "Toestand") as Toestand;
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
  { baseUrl, ...options }: GetToestandOptions = {},
): Promise<Toestand> {
  const xml = await fetchXml(
    getToestandUrl(bwbId, expression, isToekomstig, baseUrl),
    `toestand ${bwbId} ${expression}`,
    options,
  );
  return parseToestand(xml);
}

/** Fetches a CVDR regeling (e.g. `CVDR744131`, `2`) and maps it to a `Wetgeving`. */
export async function getCvdr(
  cvdrId: string,
  expression: string,
  { baseUrl, ...options }: GetToestandOptions = {},
): Promise<Wetgeving> {
  const xml = await fetchXml(
    getCvdrUrl(cvdrId, expression, baseUrl),
    `CVDR ${cvdrId} ${expression}`,
    options,
  );
  return parseCvdr(xml);
}

/** Downloads XML, reporting progress; resolves once it is ready to be parsed. */
async function fetchXml(
  url: string,
  description: string,
  { signal, onProgress }: Omit<GetToestandOptions, "baseUrl">,
): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: "application/xml" },
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Fetching ${description} failed: ${response.status} ${response.statusText}`,
    );
  }
  if (!onProgress) {
    return response.text();
  }
  const { text, loaded, total } = await readWithProgress(response, onProgress);
  onProgress({ phase: "parsing", loaded, total });
  // Parsing blocks the main thread; let the "parsing" state paint first.
  await afterPaint();
  return text;
}

async function readWithProgress(
  response: Response,
  onProgress: (progress: ToestandProgress) => void,
): Promise<{ text: string; loaded: number; total?: number }> {
  // With Content-Encoding, Content-Length counts compressed bytes, while the
  // reader yields decompressed ones.
  const length = Number(response.headers.get("Content-Length"));
  const total =
    length > 0 && !response.headers.get("Content-Encoding") ? length : undefined;
  if (!response.body) {
    const text = await response.text();
    return { text, loaded: text.length, total };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    text += decoder.decode(value, { stream: true });
    onProgress({ phase: "downloading", loaded, total });
  }
  return { text: text + decoder.decode(), loaded, total };
}

/** Resolves once the browser has had a chance to paint. */
function afterPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
    // requestAnimationFrame does not fire in background tabs.
    setTimeout(resolve, 100);
  });
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
  { baseUrl, signal }: GetToestandOptions = {},
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
