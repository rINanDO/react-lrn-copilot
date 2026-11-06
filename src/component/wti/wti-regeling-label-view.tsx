import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@mui/material";
import type {
  bron_groot,
  bron_klein,
  bron_kleinBekendmaking,
  opmerkingenOpmerking,
  terugwerkendekrachtdatumklein,
  wijzigingenRegelingelement,
  wijzigingenRegelingelementDatumDetails,
} from "../../api/types.gen";
import AlView from "../elements/al-view";
import type { VersiePaden } from "./use-wti-versies";

const BEKENDMAKINGEN_URL = "https://zoek.officielebekendmakingen.nl";

type Bron = bron_groot | bron_klein;

type Rij = {
  waarde?: string | null;
  details?: wijzigingenRegelingelementDatumDetails;
  /** The row's opmerkingen with their footnote number. */
  voetnoten: { nummer: number; opmerking: opmerkingenOpmerking }[];
};

/** `2014-01-18` → `18-01-2014`. */
function formatDatum(datum?: string | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum ?? "");
  return match ? `${match[3]}-${match[2]}-${match[1]}` : (datum ?? "");
}

/** `intrekking-regeling` → `Intrekking-regeling`. */
function formatBetreft(betreft?: string | null): string {
  return betreft ? betreft.charAt(0).toUpperCase() + betreft.slice(1) : "";
}

/** `t/m 01-01-2014` for a date scope of `tot-en-met`, otherwise just the date. */
function formatTerugwerkendeKracht({
  datumScope,
  waarde,
}: terugwerkendekrachtdatumklein): string {
  const datum = formatDatum(waarde);
  return datumScope === "tot-en-met" ? `t/m ${datum}` : datum;
}

/** One row per `details` of a datum, so a datum with several repeats its date. */
function toRijen({ datum }: wijzigingenRegelingelement): Rij[] {
  let nummer = 0;
  return (datum ?? []).flatMap(({ waarde, details }): Rij[] => {
    if (!details?.length) {
      return waarde ? [{ waarde, voetnoten: [] }] : [];
    }
    return details.map((detail) => ({
      waarde,
      details: detail,
      voetnoten: (detail.opmerkingen?.opmerking ?? []).map((opmerking) => ({
        nummer: ++nummer,
        opmerking,
      })),
    }));
  });
}

/** The values of a source's bronnen, one below the other, joined by "samen met". */
function SamenMet({ items }: { items: ReactNode[] }) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <>
              <br />
              samen met
              <br />
            </>
          )}
          {item}
        </Fragment>
      ))}
    </>
  );
}

/** `Stcrt. 2014, 1435`, linked when the publication has a URL. */
function Bekendmaking({
  bekendmaking: { soort, publicatiejaar, publicatienummer, urlidentifier },
}: {
  bekendmaking: bron_kleinBekendmaking;
}) {
  const naam = `${soort}. ${publicatiejaar}, ${publicatienummer}`;
  if (!urlidentifier) return <>{naam}</>;
  return (
    <a
      href={`${BEKENDMAKINGEN_URL}/${urlidentifier}.html`}
      target="_blank"
      rel="noreferrer"
    >
      {naam}
    </a>
  );
}

function ondertekeningen(bronnen: Bron[]): ReactNode[] {
  return bronnen.flatMap((bron) =>
    bron.ondertekening ? [formatDatum(bron.ondertekening)] : [],
  );
}

function bekendmakingen(bronnen: Bron[]): ReactNode[] {
  return bronnen.flatMap((bron) =>
    bron.bekendmaking
      ? [<Bekendmaking key={0} bekendmaking={bron.bekendmaking} />]
      : [],
  );
}

/** The kamerstukken dossier of a source when it has one, otherwise its kenmerk. */
function kenmerken(bronnen: bron_groot[]): ReactNode[] {
  return bronnen.flatMap((bron): ReactNode[] => {
    if (bron.dossiernummer) {
      return [
        <a
          key={0}
          href={`${BEKENDMAKINGEN_URL}/dossier/${encodeURIComponent(bron.dossiernummer)}`}
          target="_blank"
          rel="noreferrer"
        >
          {bron.dossiernummer}
        </a>,
      ];
    }
    const kenmerk = bron.bekendmaking?.kenmerk ?? bron.kenmerk;
    return kenmerk ? [kenmerk] : [];
  });
}

/** The latest date of the rows on or before the date of `expression`. */
function huidigeDatum(rijen: Rij[], expression?: string): string | undefined {
  const peildatum = expression?.split("_")[0];
  if (!peildatum) return undefined;
  return rijen
    .flatMap((rij) => (rij.waarde && rij.waarde <= peildatum ? [rij.waarde] : []))
    .sort()
    .at(-1);
}

/**
 * The changes to a regelingelement, as listed in its wetstechnische informatie.
 * Marks the change in force at `expression`, and links the other dates that
 * start a version in `versiePaden`.
 */
function WtiRegelingLabelView({
  regelingelement,
  expression,
  versiePaden,
}: {
  regelingelement: wijzigingenRegelingelement;
  expression?: string;
  versiePaden?: VersiePaden;
}) {
  const rijen = toRijen(regelingelement);

  if (rijen.length === 0) {
    return (
      <Alert severity="info">
        Er zijn geen wijzigingen bekend voor dit regelingelement.
      </Alert>
    );
  }

  // Staatscourant publications carry a kenmerk; laws refer to kamerstukken.
  const heeftKenmerk = rijen.some((rij) =>
    rij.details?.ontstaansbron?.bron?.some(
      (bron) => bron.bekendmaking?.kenmerk ?? bron.kenmerk,
    ),
  );
  const voetnoten = rijen.flatMap((rij) => rij.voetnoten);
  const huidig = huidigeDatum(rijen, expression);

  return (
    <>
      <div className="table__container">
        <table className="table--condensed">
          <thead>
            <tr>
              <td colSpan={3}></td>
              <th scope="colgroup" colSpan={3}>
                Ontstaansbron
              </th>
              <th scope="colgroup" colSpan={3}>
                Inwerkingtreding
              </th>
            </tr>
            <tr>
              <th scope="col">Datum van inwerkingtreding</th>
              <th scope="col">Terugwerkende kracht</th>
              <th scope="col">Betreft</th>
              <th scope="col">Ondertekening</th>
              <th scope="col">Bekendmaking</th>
              <th scope="col">{heeftKenmerk ? "Kenmerk" : "Kamerstukken"}</th>
              <th scope="col">Ondertekening</th>
              <th scope="col">Bekendmaking</th>
              <th scope="col">Opmerking</th>
            </tr>
          </thead>
          <tbody>
            {rijen.map((rij, index) => {
              const ontstaan = rij.details?.ontstaansbron?.bron ?? [];
              const inwerking = rij.details?.inwerkingtreding?.bron ?? [];
              const terugwerkend =
                rij.details?.terugwerkendeKracht?.terugwerkendeKrachtDatum ?? [];
              const isHuidig = !!rij.waarde && rij.waarde === huidig;
              const versiePad =
                rij.waarde && !isHuidig ? versiePaden?.get(rij.waarde) : undefined;
              return (
                // A date can occur twice in one regelingelement.
                <tr
                  key={index}
                  className={isHuidig ? "current" : undefined}
                  aria-current={isHuidig ? "true" : undefined}
                >
                  <td>
                    {versiePad ? (
                      <Link to={versiePad}>{formatDatum(rij.waarde)}</Link>
                    ) : (
                      formatDatum(rij.waarde)
                    )}
                  </td>
                  <td>
                    <SamenMet items={terugwerkend.map(formatTerugwerkendeKracht)} />
                  </td>
                  <td>{formatBetreft(rij.details?.betreft)}</td>
                  <td>
                    <SamenMet items={ondertekeningen(ontstaan)} />
                  </td>
                  <td>
                    <SamenMet items={bekendmakingen(ontstaan)} />
                  </td>
                  <td>
                    <SamenMet items={kenmerken(ontstaan)} />
                  </td>
                  <td>
                    <SamenMet items={ondertekeningen(inwerking)} />
                  </td>
                  <td>
                    <SamenMet items={bekendmakingen(inwerking)} />
                  </td>
                  <td>
                    {rij.voetnoten.map(({ nummer, opmerking }, voetnootIndex) => (
                      <Fragment key={nummer}>
                        {voetnootIndex > 0 && <br />}
                        <a href={`#voetnoot_${nummer}`} id={`voetnoot_ref_${nummer}`}>
                          {opmerking.type}. {nummer}
                        </a>
                      </Fragment>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {voetnoten.length > 0 && (
        <div>
          <p>Opmerkingen</p>
          <ol className="footnotes">
            {voetnoten.map(({ nummer, opmerking }) => (
              <li key={nummer} id={`voetnoot_${nummer}`}>
                {opmerking.al?.map((al, index) => <AlView key={index} al={al} />)}
                {opmerking.text?.join(" ")}{" "}
                <a href={`#voetnoot_ref_${nummer}`}>{nummer})</a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

export default WtiRegelingLabelView;
