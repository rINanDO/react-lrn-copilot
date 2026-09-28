/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Al, Artikel, Hoofdstuk, Lid } from "../../api";
import type { BwbArtikelViewModel } from "../../models/bwb-artikel";
import type { BwbArtikelLidViewModel } from "../../models/bwb-artikel-lid";
import type { BwbHoofdstukViewModel } from "../../models/bwb-hoofdstuk";
import type { BwbLijstViewModel } from "../../models/bwb-lijst";
import type { BwbParagraafViewModel } from "../../models/bwb-paragraaf";
import type { BwbTekstViewModel } from "../../models/bwb-tekst";

function toArray<T>(value?: T | T[] | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toText(value?: string | number | null): string {
  return value === undefined || value === null ? "" : String(value);
}

export function mapBwbArtikelModel(
  hoofdstuk?: Hoofdstuk,
  artikel?: Artikel,
): BwbArtikelViewModel {
  if (!artikel) {
    return {} as BwbArtikelViewModel;
  }

  var kopLabel = artikel.kop?.label?.join(" ");
  var kopNr = artikel.kop.nr?.map((nr) => nr.text?.join(" ")).join(" ");

  return {
    id: artikel.id ?? "",
    sectionId: `${hoofdstuk?.id}_${artikel.id}`,
    title: `${kopLabel} ${kopNr}`.trim(),
    structuurAlgemeen: artikel.structuurAlgemeen as unknown[] | undefined,
    lids: artikel.lid as Lid[] | undefined,
  };
}

export function mapBwbHoofdstukModel(
  hoofdstuk?: Hoofdstuk,
): BwbHoofdstukViewModel {
  const label = hoofdstuk?.kop?.label?.join(" ");
  const nummer = hoofdstuk?.kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titelTekst = hoofdstuk?.kop?.titel
    ?.map((titel) => titel.text?.join(" "))
    .join(" ");

  const basisTitel = `${label} ${nummer}`.trim();
  const title = titelTekst ? `${basisTitel}. ${titelTekst}` : basisTitel;

  return {
    id: hoofdstuk?.id ?? "",
    title,
    paragrafen: toArray(hoofdstuk?.paragraaf),
    artikel: hoofdstuk?.artikel,
    rawContent: hoofdstuk,
  };
}

export function mapBwbParagraafModel(paragraaf?: any): BwbParagraafViewModel[] {
  return toArray(paragraaf).map((paragraafItem, index) => {
    const sectionId = toText(paragraafItem?.["@bwb-ng-variabel-deel"])
      .replace(/\//g, "_")
      .substring(1);
    const id = toText(paragraafItem?.["@id"]);
    const nr =
      typeof paragraafItem?.kop?.nr === "string"
        ? `${toText(paragraafItem?.kop?.nr)}.`
        : toText(paragraafItem?.kop?.nr?.["#text"]);
    const titel =
      typeof paragraafItem?.kop?.titel === "string"
        ? toText(paragraafItem?.kop?.titel)
        : toText(paragraafItem?.kop?.titel?.["#text"]);
    const volledigeTitel =
      `${toText(paragraafItem?.kop?.label)} ${nr} ${titel}`.trim();

    return {
      key: id || `${sectionId}_${index}`,
      id,
      sectionId,
      title: volledigeTitel,
      artikelen: toArray(paragraafItem?.artikel),
      subParagrafen: toArray(paragraafItem?.["sub-paragraaf"]),
      rawContent: paragraafItem,
    };
  });
}

export function mapBwbLijstModel(lijst?: any): BwbLijstViewModel[] {
  return toArray(lijst?.li).map((lijstItem, index) => {
    const nummer = toText(lijstItem?.["li.nr"]);

    return {
      key: nummer || `lid_onderdeel_${index}`,
      nummer,
      textContent: lijstItem?.al,
      lijst: lijstItem?.lijst,
    };
  });
}

export function mapBwbArtikelLidModel(content?: Lid): BwbArtikelLidViewModel {
  return {
    id: content?.id ?? `0`,
    lidNummer: content?.lidnr?.text?.join(" ") ?? "",
    structuurAlgemeen: content?.structuurAlgemeen ?? [],
  };
}

export function mapBwbStructuurModelAl(al?: Al): BwbTekstViewModel {
  if (!al) {
    return {} as BwbTekstViewModel;
  }
  const teksten = al.text;
  const extrefs = al?.extref;
  const intrefs = al?.intref;
  const length = Math.max(
    teksten?.length ?? 0,
    extrefs?.length ?? 0,
    intrefs?.length ?? 0,
  );

  const parts = Array.from({ length }, (_, index) => {
    return {
      key: `tekst_${index}`,
      nadruk: al.nadrukProperty?.[index],
      tekst: teksten?.[index],
      extref: extrefs?.[index],
      intref: intrefs?.[index],
    };
  }).filter((part) => part.tekst !== "" || part.extref || part.intref);

  return {
    parts,
  };
}
