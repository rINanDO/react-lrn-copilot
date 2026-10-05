import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import type { Kop, Hoofdstuk, Artikel, Paragraaf, Wetgeving } from "../../api";
import { Children, useId, useState, type ReactNode } from "react";
import BwbRawText from "../toestand/bwb-raw-text";
import "./side-bar.css";

function kopNumber(kop?: Kop): string | undefined {
  return kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ");
}

/** "(Artikel 1)" or "(Artikelen 2.51-2.54)" for the articles under a TOC item. */
function artikelRange(artikelen: Artikel[]): string | undefined {
  const numbers = artikelen
    .map((artikel) => kopNumber(artikel.kop))
    .filter((number): number is string => !!number);
  if (numbers.length === 0) return undefined;
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  return first === last ? `(Artikel ${first})` : `(Artikelen ${first}-${last})`;
}

function ArtikelItem({ artikelen }: { artikelen: Artikel[] }) {
  return (
    <>
      {artikelen.map((a, index) => (
        <TocItem key={a.id ?? index} kop={a.kop} id={a.id} />
      ))}
    </>
  );
}
function ParagraafItem({ paragrafen }: { paragrafen: Paragraaf[] }) {
  return (
    <>
      {paragrafen.map((p, index) => (
        <TocItem
          key={p.id ?? index}
          kop={p.kop}
          id={p.id}
          useSmallText={true}
          range={artikelRange((p.artikel as Artikel[]) ?? [])}
        >
          {p.artikel && <ArtikelItem artikelen={p.artikel as Artikel[]} />}
        </TocItem>
      ))}
    </>
  );
}
function HoofdstukItem({ hoofdstuk }: { hoofdstuk: Hoofdstuk }) {
  var paragrafen = hoofdstuk.paragraaf as Paragraaf[];
  var artikelen = hoofdstuk.artikel as Artikel[];
  const alleArtikelen = [
    ...(artikelen ?? []),
    ...(paragrafen ?? []).flatMap((p) => (p.artikel as Artikel[]) ?? []),
  ];
  return (
    <TocItem
      kop={hoofdstuk.kop}
      id={hoofdstuk.id}
      range={artikelRange(alleArtikelen)}
      useSmallText={true}
    >
      {artikelen && <ArtikelItem artikelen={artikelen} />}
      {paragrafen && <ParagraafItem paragrafen={paragrafen} />}
    </TocItem>
  );
}
function TocItem({
  id,
  kop,
  range,
  children,
  useSmallText,
}: {
  id?: string | null | undefined;
  kop: Kop;
  /** Article range shown under the title, e.g. "(Artikelen 2.51-2.54)". */
  range?: string;
  /** Nested TOC items, folded away until the toggle button is used. */
  children?: ReactNode;
  /** Whether to use smaller text for the TOC item. */
  useSmallText?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fallbackId = useId();
  const listId = `lijst-${id ?? fallbackId}`;
  const hasChildren = Children.toArray(children).length > 0;

  const labelText = kop.label?.join(" ");
  const numberText = kopNumber(kop);
  const titleText = kop.titel?.map((titel) => titel.text?.join(" ")).join(" ");
  const href = `#Hoofdstuk${numberText}`;

  return (
    <li>
      <a
        className={hasChildren ? "foldable" : undefined}
        id={`TOC_${id}`}
        href={href}
      >
        {labelText} {numberText}
        {useSmallText && (
          <small>
            <BwbRawText
              id={`hoofdstuk_${id}`}
              key={`hoofdstuk_${id}`}
              rawText={titleText}
            />
          </small>
        )}
        {!useSmallText && (
          <BwbRawText
            id={`hoofdstuk_${id}`}
            key={`hoofdstuk_${id}`}
            rawText={titleText}
          />
        )}
        {range && <span>{range}</span>}
        {hasChildren && (
          <button
            type="button"
            data-handler="toggle-fold"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={(event) => {
              // The button sits inside the link: fold without navigating.
              event.preventDefault();
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
          >
            {expanded ? "Verberg onderliggende" : "Toon onderliggende"}
          </button>
        )}
      </a>
      {hasChildren && (
        <ul id={listId} hidden={!expanded}>
          {children}
        </ul>
      )}
    </li>
  );
}

function SideBar({ wetgeving }: { wetgeving: Wetgeving | undefined }) {
  const toc =
    wetgeving?.regeling?.regelingTekst ?? wetgeving?.wetBesluit?.wettekst;
  return (
    <div id="sidebar" className="columns--sticky-sidebar__sidebar">
      <div>
        <Heading level={2}>
          <BwbRawText
            id="citeerTitel"
            rawText={wetgeving?.citeertitel?.text?.join(" ")}
          />
        </Heading>
        <Heading level={2}>Inhoudsopgave</Heading>
        <ul className="treeview treeview--foldable" id="treeview-">
          {toc?.hoofdstuk?.map((hoofdstuk, index) => (
            <HoofdstukItem key={hoofdstuk.id ?? index} hoofdstuk={hoofdstuk} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
