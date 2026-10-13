export const BWB_SRU_BASE_URL = "https://zoekservice.overheid.nl/sru/Search";

const BWB_ID_PATTERN = /\bBWBR\d{7}\b/i;

export type BwbSearchRecord = {
  bwbId: string;
  title: string;
  authority?: string;
  modified?: string;
  summary?: string;
};

export type BwbSearchResponse = {
  numberOfRecords: number;
  records: BwbSearchRecord[];
};

export type SearchBwbOptions = {
  baseUrl?: string;
  startRecord?: number;
  maximumRecords?: number;
  signal?: AbortSignal;
};

function getFirstTextByLocalName(
  root: ParentNode,
  localNames: string[],
): string | undefined {
  const expected = new Set(localNames.map((value) => value.toLowerCase()));
  const elements = root.querySelectorAll("*");
  for (const element of elements) {
    if (!expected.has(element.localName.toLowerCase())) continue;
    const value = element.textContent?.trim();
    if (value) return value;
  }
  return undefined;
}

function extractBwbId(text: string | undefined): string | undefined {
  const match = text?.match(BWB_ID_PATTERN);
  return match?.[0].toUpperCase();
}

function buildSruQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Zoekterm mag niet leeg zijn.");
  }

  const looksLikeCql = /[:=<>]/.test(trimmed);
  if (looksLikeCql) {
    return trimmed;
  }

  return `"${trimmed.replaceAll('"', '\\"')}"`;
}

export function parseSruSearchResponse(xml: string): BwbSearchResponse {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Ongeldige SRU XML: ${parseError.textContent}`);
  }

  const diagnosticMessage = getFirstTextByLocalName(document, [
    "diagnostic",
    "message",
    "details",
  ]);
  if (diagnosticMessage) {
    throw new Error(`SRU zoekfout: ${diagnosticMessage}`);
  }

  const numberOfRecordsText = getFirstTextByLocalName(document, ["numberOfRecords"]);
  const numberOfRecords = Number(numberOfRecordsText ?? "0");

  const records = Array.from(document.querySelectorAll("record"))
    .map((record): BwbSearchRecord | null => {
      const recordData = record.querySelector("recordData") ?? record;
      const identifier =
        getFirstTextByLocalName(recordData, ["identifier", "bwb-id", "bwbid"]) ??
        recordData.textContent ??
        "";
      const bwbId = extractBwbId(identifier);
      if (!bwbId) return null;

      const title =
        getFirstTextByLocalName(recordData, [
          "title",
          "officieleTitel",
          "citeertitel",
          "regelingOpschrift",
          "onderwerp",
        ]) ?? bwbId;

      return {
        bwbId,
        title,
        authority: getFirstTextByLocalName(recordData, ["authority"]),
        modified: getFirstTextByLocalName(recordData, ["modified", "issued", "date"]),
        summary: getFirstTextByLocalName(recordData, ["description", "samenvatting"]),
      };
    })
    .filter((record): record is BwbSearchRecord => record !== null);

  return {
    numberOfRecords: Number.isFinite(numberOfRecords) ? numberOfRecords : records.length,
    records,
  };
}

export async function searchBwb(
  query: string,
  {
    baseUrl = BWB_SRU_BASE_URL,
    startRecord = 1,
    maximumRecords = 20,
    signal,
  }: SearchBwbOptions = {},
): Promise<BwbSearchResponse> {
  const searchParameters = new URLSearchParams({
    operation: "searchRetrieve",
    version: "2.0",
    "x-connection": "BWB",
    query: buildSruQuery(query),
    startRecord: String(startRecord),
    maximumRecords: String(maximumRecords),
  });

  const response = await fetch(`${baseUrl}?${searchParameters.toString()}`, {
    headers: { Accept: "application/xml, text/xml" },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Zoekopdracht mislukt: ${response.status} ${response.statusText}`,
    );
  }

  return parseSruSearchResponse(await response.text());
}
