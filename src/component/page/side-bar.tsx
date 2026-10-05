import type {
  RegelingTekst,
  Wettekst,
  Kop,
  Hoofdstuk,
  Artikel,
  Paragraaf,
} from "../../api";
import BwbRawText from "../toestand/bwb-raw-text";

function ArtikelItem({ artikelen }: { artikelen: Artikel[] }) {
  return (
    <>
      {artikelen.map((a) => (
        <TocItem kop={a.kop} id={a.id} />
      ))}
    </>
  );
}
function ParagraafItem({ paragrafen }: { paragrafen: Paragraaf[] }) {
  return (
    <>
      {paragrafen.map((p) => (
        <>
          <TocItem kop={p.kop} id={p.id} />
          {(() => {
            if (!p.artikel) return null;
            return (
              <ul>
                <ArtikelItem artikelen={p.artikel as Artikel[]} />
              </ul>
            );
          })()}
        </>
      ))}
    </>
  );
}
function HoofdstukItem({ hoofdstuk }: { hoofdstuk: Hoofdstuk }) {
  var paragrafen = hoofdstuk.paragraaf as Paragraaf[];
  var artikelen = hoofdstuk.artikel as Artikel[];
  return (
    <>
      <TocItem kop={hoofdstuk.kop} id={hoofdstuk.id} />
      {(() => {
        if (!paragrafen) return null;
        return <ParagraafItem paragrafen={paragrafen} />;
      })()}
      {(() => {
        if (!artikelen) return null;
        return <ArtikelItem artikelen={artikelen} />;
      })()}
    </>
  );
}
function TocItem({ id, kop }: { id?: string | null | undefined; kop: Kop }) {
  const labelText = kop.label?.join(" ");
  const numberText = kop.nr?.map((nr) => nr.text?.join(" ")).join(" ");
  const titleText = kop.titel?.map((titel) => titel.text?.join(" ")).join(" ");
  const href = `#Hoofdstuk${numberText}`;

  return (
    <li key={id}>
      <a
        className="foldable"
        id="TOC_C12449541"
        href={href}
        data-decorator="add-foldability"
      >
        {labelText} {numberText}
        <small>
          <BwbRawText
            id={`hoofdstuk_${id}`}
            key={`hoofdstuk_${id}`}
            rawText={titleText}
          />
        </small>
      </a>
    </li>
  );
}

function SideBar({ toc }: { toc: Wettekst | RegelingTekst | undefined }) {
  return (
    <div id="sidebar" className="columns--sticky-sidebar__sidebar">
      <div>
        <h2>Inhoudsopgave</h2>
        <ul className="treeview treeview--foldable" id="treeview-">
          {toc?.hoofdstuk?.map((hoofdstuk) => (
            <HoofdstukItem hoofdstuk={hoofdstuk} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
