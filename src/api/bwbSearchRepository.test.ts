import { afterEach, describe, expect, it, vi } from "vitest";
import { parseSruSearchResponse, searchBwb } from "./bwbSearchRepository";

afterEach(() => {
  vi.unstubAllGlobals();
});

const searchResponseXml = `<?xml version="1.0" encoding="UTF-8"?>
<srw:searchRetrieveResponse
  xmlns:srw="http://docs.oasis-open.org/ns/search-ws/sruResponse"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <srw:numberOfRecords>2</srw:numberOfRecords>
  <srw:records>
    <srw:record>
      <srw:recordData>
        <dc:identifier>https://wetten.overheid.nl/BWBR0001840/</dc:identifier>
        <dc:title>Grondwet</dc:title>
        <dc:authority>Binnenlandse Zaken</dc:authority>
      </srw:recordData>
    </srw:record>
    <srw:record>
      <srw:recordData>
        <dc:identifier>BWBR0039872</dc:identifier>
        <dc:title>Tijdelijke regeling</dc:title>
      </srw:recordData>
    </srw:record>
  </srw:records>
</srw:searchRetrieveResponse>`;

describe("parseSruSearchResponse", () => {
  it("maps records to BWB ids and titles", () => {
    expect(parseSruSearchResponse(searchResponseXml)).toEqual({
      numberOfRecords: 2,
      records: [
        {
          bwbId: "BWBR0001840",
          title: "Grondwet",
          authority: "Binnenlandse Zaken",
          modified: undefined,
          summary: undefined,
        },
        {
          bwbId: "BWBR0039872",
          title: "Tijdelijke regeling",
          authority: undefined,
          modified: undefined,
          summary: undefined,
        },
      ],
    });
  });
});

describe("searchBwb", () => {
  it("calls SRU and parses the response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(searchResponseXml, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchBwb("grondwet", {
      baseUrl: "https://example.test/sru",
      startRecord: 21,
      maximumRecords: 20,
    });

    expect(result.numberOfRecords).toBe(2);
    expect(result.records[0]?.bwbId).toBe("BWBR0001840");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain("operation=searchRetrieve");
    expect(requestUrl).toContain("x-connection=BWB");
    expect(requestUrl).toContain("query=%22grondwet%22");
    expect(requestUrl).toContain("startRecord=21");
    expect(requestUrl).toContain("maximumRecords=20");
  });
});
