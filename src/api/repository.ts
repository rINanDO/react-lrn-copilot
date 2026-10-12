/** Shared by the BWB and CVDR repositories: fetching and parsing their XML. */

export const WETTEN_REPOSITORY_BASE_URL =
  "https://repository.officiele-overheidspublicaties.nl";

export type FetchOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
  /** Called while the document downloads, and once more before it is parsed. */
  onProgress?: (progress: LoadProgress) => void;
};

export type LoadProgress = {
  phase: "downloading" | "parsing";
  /** Bytes received so far. */
  loaded: number;
  /** Total bytes, when the server reports a usable Content-Length. */
  total?: number;
};

/** URL of an illustration (e.g. `247668.png`), stored next to the XML at `documentUrl`. */
export function getIllustratieUrl(documentUrl: string, naam: string): string {
  return new URL(encodeURIComponent(naam), documentUrl).href;
}

/** Parses XML whose text elements (`al`, `titel`, ...) are kept as raw inner XML. */
export function parseXmlDocument(xml: string, description: string): Document {
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

/** Downloads XML, reporting progress; resolves once it is ready to be parsed. */
export async function fetchXml(
  url: string,
  description: string,
  { signal, onProgress }: Omit<FetchOptions, "baseUrl">,
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
  onProgress: (progress: LoadProgress) => void,
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
