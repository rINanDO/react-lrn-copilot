/** Searching the basiswettenbestand through the SRU service of overheid.nl. */

import { fetchXml, type FetchOptions } from "./repository";

export const SRU_BASE_URL = "https://zoekservice.overheid.nl/sru/Search";

/** Records per page; also the service's default `maximumRecords`. */
export const PAGE_SIZE = 50;

const NS_DCTERMS = "http://purl.org/dc/terms/";
const NS_OVERHEID = "http://standaarden.overheid.nl/owms/terms/";
const NS_OVERHEIDBWB = "http://standaarden.overheid.nl/bwb/terms/";

/** Search criteria; blank values are left out of the query. */
export type BwbSearchCriteria = {
  /** Words that must all occur in the title. */
  q?: string;
  /** Regelingsoort, e.g. `wet`. */
  soort?: string;
  /** Eerstverantwoordelijke, e.g. `justitie en veiligheid`. */
  ministerie?: string;
  rechtsgebied?: string;
};

export type BwbSearchRecord = {
  bwbId: string;
  title: string;
  type?: string;
  authorities: string[];
  /** Expression label of the toestand found, e.g. `2023-02-22_0`. */
  expression: string;
  geldigVanaf?: string;
  /** Left out when the toestand has no end date. */
  geldigTot?: string;
};

export type BwbSearchResult = {
  total: number;
  records: BwbSearchRecord[];
};

/** An SRU diagnostic: the service answered, but could not run the query. */
export class SruDiagnosticError extends Error {
  readonly technical: string;

  constructor(technical: string) {
    super("De zoekopdracht kon niet worden uitgevoerd.");
    this.name = "SruDiagnosticError";
    this.technical = technical;
  }
}

/** Quotes a CQL term, escaping the quote, escape, masking and anchoring characters. */
function quoteCql(value: string): string {
  return `"${value.replace(/[\\"*?^]/g, "\\$&")}"`;
}

/** Trims and collapses whitespace; control characters make the service answer 500, so they become spaces. */
function normalize(value: string | undefined): string {
  return (value ?? "").replace(/[\p{Cc}\s]+/gu, " ").trim();
}

/** Builds the CQL query for `criteria`, restricted to the toestanden in force and visible on `date` (`YYYY-MM-DD`). */
export function buildBwbCql(criteria: BwbSearchCriteria, date: string): string {
  const clauses: string[] = [];
  const add = (index: string, relation: string, value: string | undefined) => {
    const normalized = normalize(value);
    if (normalized) clauses.push(`${index}${relation}${quoteCql(normalized)}`);
  };
  add("overheidbwb.titel", " all ", criteria.q);
  add("dcterms.type", "==", criteria.soort);
  add("overheid.authority", "==", criteria.ministerie);
  add("overheidbwb.rechtsgebied", "==", criteria.rechtsgebied);
  clauses.push(`overheidbwb.geldigheidsdatum==${date}`);
  clauses.push(`overheidbwb.zichtdatum==${date}`);
  return clauses.join(" and ");
}

/** True when the criteria hold a search text or at least one filter. */
export function hasSearchCriteria(criteria: BwbSearchCriteria): boolean {
  return [criteria.q, criteria.soort, criteria.ministerie, criteria.rechtsgebied].some(
    (value) => normalize(value) !== "",
  );
}

export function getSruSearchUrl(
  cql: string,
  startRecord: number,
  maximumRecords: number,
  baseUrl = SRU_BASE_URL,
): string {
  const params = new URLSearchParams({
    operation: "searchRetrieve",
    version: "2.0",
    "x-connection": "BWB",
    query: cql,
    startRecord: String(startRecord),
    maximumRecords: String(maximumRecords),
  });
  return `${baseUrl}?${params}`;
}

/** `http://wetten.overheid.nl/id/BWBR0001840/2023-02-22/0` → `2023-02-22_0`. */
function expressionFromToestand(toestand: string | undefined): string | undefined {
  const match = toestand?.match(/\/(\d{4}-\d{2}-\d{2})\/(\d+)\/?$/);
  return match ? `${match[1]}_${match[2]}` : undefined;
}

/** `…/bwb/BWBR0001840/2023-02-22_0/xml/…` → `2023-02-22_0`. */
function expressionFromLocatie(
  locatie: string | undefined,
  bwbId: string,
): string | undefined {
  const segments = locatie?.split("/") ?? [];
  const index = segments.indexOf(bwbId);
  const expression = index >= 0 ? segments[index + 1] : undefined;
  return expression && /^\d{4}-\d{2}-\d{2}_\d+$/.test(expression)
    ? expression
    : undefined;
}

function parseRecord(record: Element): BwbSearchRecord | undefined {
  const texts = (namespace: string, name: string) =>
    Array.from(record.getElementsByTagNameNS(namespace, name))
      .map((element) => element.textContent?.trim() ?? "")
      .filter((text) => text !== "");
  const text = (namespace: string, name: string) => texts(namespace, name)[0];

  const bwbId = text(NS_DCTERMS, "identifier");
  if (!bwbId) return undefined;
  const expression =
    expressionFromToestand(text(NS_OVERHEIDBWB, "toestand")) ??
    expressionFromLocatie(text(NS_OVERHEIDBWB, "locatie_toestand"), bwbId);
  if (!expression) return undefined;

  const geldigTot = text(NS_OVERHEIDBWB, "geldigheidsperiode_einddatum");
  return {
    bwbId,
    title: text(NS_DCTERMS, "title") ?? bwbId,
    type: text(NS_DCTERMS, "type"),
    authorities: texts(NS_OVERHEID, "authority"),
    expression,
    geldigVanaf: text(NS_OVERHEIDBWB, "geldigheidsperiode_startdatum"),
    geldigTot: geldigTot === "9999-12-31" ? undefined : geldigTot,
  };
}

/** Parses an SRU `searchRetrieveResponse`; throws `SruDiagnosticError` on a `diagnostics` answer. */
export function parseSearchResponse(xml: string): BwbSearchResult {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid SRU XML: ${parseError.textContent}`);
  }

  const root = document.documentElement;
  if (root.localName === "diagnostics") {
    const diagnostic = (name: string) =>
      root.getElementsByTagNameNS("*", name)[0]?.textContent?.trim();
    throw new SruDiagnosticError(
      [diagnostic("uri"), diagnostic("message"), diagnostic("details")]
        .filter(Boolean)
        .join(" – "),
    );
  }

  const childText = (name: string) =>
    Array.from(root.children).find((child) => child.localName === name)
      ?.textContent;
  const records = Array.from(root.getElementsByTagNameNS("*", "record"))
    .map(parseRecord)
    .filter((record): record is BwbSearchRecord => record !== undefined);
  return { total: Number(childText("numberOfRecords") ?? 0) || 0, records };
}

/** Today's date in the browser's time zone, as `YYYY-MM-DD`. */
export function localDate(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Searches the basiswettenbestand; `page` is 1-based. */
export async function searchBwb(
  criteria: BwbSearchCriteria,
  {
    page = 1,
    date = localDate(),
    baseUrl,
    signal,
  }: { page?: number; date?: string } & Pick<FetchOptions, "baseUrl" | "signal"> = {},
): Promise<BwbSearchResult> {
  const url = getSruSearchUrl(
    buildBwbCql(criteria, date),
    (page - 1) * PAGE_SIZE + 1,
    PAGE_SIZE,
    baseUrl,
  );
  const xml = await fetchXml(url, "zoekresultaten", { signal });
  return parseSearchResponse(xml);
}
