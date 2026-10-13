import { type FormEvent, useState } from "react";
import { generatePath, Link, useSearchParams } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import {
  FormFieldSelect,
  Heading,
  PrimaryActionButton,
  SelectOption,
  TextInput,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import {
  PAGE_SIZE,
  type BwbSearchCriteria,
  type BwbSearchRecord,
} from "../../api/sruRepository";
import { appRoutes } from "../../router/routes";
import LoadError from "../document/load-error";
import {
  MINISTERIE_OPTIONS,
  RECHTSGEBIED_OPTIONS,
  SOORT_OPTIONS,
  type SearchOption,
} from "./bwb-search-options";
import { useBwbSearch } from "./use-bwb-search";
import "./bwb-search-page.css";

type FilterParam = "soort" | "ministerie" | "rechtsgebied";

const FILTERS: {
  param: FilterParam;
  label: string;
  allLabel: string;
  options: SearchOption[];
}[] = [
  {
    param: "soort",
    label: "Regelingsoort",
    allLabel: "Alle regelingsoorten",
    options: SOORT_OPTIONS,
  },
  {
    param: "ministerie",
    label: "Eerstverantwoordelijke",
    allLabel: "Alle eerstverantwoordelijken",
    options: MINISTERIE_OPTIONS,
  },
  {
    param: "rechtsgebied",
    label: "Rechtsgebied",
    allLabel: "Alle rechtsgebieden",
    options: RECHTSGEBIED_OPTIONS,
  },
];

/** `pagina` as a page number; anything but an integer ≥ 1 is page 1. */
function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** `2023-02-22` → `22-2-2023`, without a time-zone round trip. */
function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${Number(day)}-${Number(month)}-${year}`;
}

function resultHref(record: BwbSearchRecord, q: string): string {
  const path = generatePath(appRoutes.bwb, {
    bwbid: record.bwbId,
    expression: record.expression,
  });
  return q ? `${path}?${new URLSearchParams({ q })}` : path;
}

function SearchForm({
  q,
  onSearch,
}: {
  q: string;
  onSearch: (q: string) => void;
}) {
  const [text, setText] = useState(q);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(text.trim());
  };

  return (
    <form className="bwb-search-page__search" role="search" onSubmit={handleSubmit}>
      <TextInput
        aria-label="Zoek in wetten"
        name="q"
        placeholder="Zoek op titel van een regeling"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <PrimaryActionButton type="submit">Zoeken</PrimaryActionButton>
    </form>
  );
}

function ResultItem({ record, q }: { record: BwbSearchRecord; q: string }) {
  const details = [
    record.type,
    record.authorities.join(", "),
    record.bwbId,
    record.geldigVanaf && `geldig vanaf ${formatDate(record.geldigVanaf)}`,
  ].filter(Boolean);

  return (
    <li className="bwb-search-page__result">
      <Link className="bwb-search-page__result-link" to={resultHref(record, q)}>
        {record.title}
      </Link>
      <div className="bwb-search-page__result-details">{details.join(" · ")}</div>
    </li>
  );
}

function BwbSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const criteria: BwbSearchCriteria = {
    q,
    soort: searchParams.get("soort") ?? "",
    ministerie: searchParams.get("ministerie") ?? "",
    rechtsgebied: searchParams.get("rechtsgebied") ?? "",
  };
  const page = parsePage(searchParams.get("pagina"));
  const state = useBwbSearch(criteria, page);

  /** Pushes a new search: empty values are dropped and paging starts over. */
  const updateSearch = (name: "q" | FilterParam, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    next.delete("pagina");
    setSearchParams(next);
  };

  const pageSearch = (target: number) => {
    const next = new URLSearchParams(searchParams);
    if (target > 1) {
      next.set("pagina", String(target));
    } else {
      next.delete("pagina");
    }
    return `?${next}`;
  };

  return (
    <div className="rhc-theme bwb-search-page">
      <div className="bwb-search-page__shell">
        <header className="bwb-search-page__header">
          <div className="bwb-search-page__eyebrow">Overheid.nl</div>
          <Heading level={1}>Zoeken in de wet- en regelgeving</Heading>
          <SearchForm key={q} q={q} onSearch={(text) => updateSearch("q", text)} />
          <p className="bwb-search-page__note">
            Er wordt gezocht in de titels van regelingen die vandaag geldig zijn.
          </p>
          <div className="bwb-search-page__filters">
            {FILTERS.map(({ param, label, allLabel, options }) => {
              const value = criteria[param] ?? "";
              const known = !value || options.some((option) => option.value === value);
              return (
                <FormFieldSelect
                  key={param}
                  label={label}
                  name={param}
                  value={value}
                  onChange={(event) => updateSearch(param, event.target.value)}
                >
                  <SelectOption value="">{allLabel}</SelectOption>
                  {!known && <SelectOption value={value}>{value}</SelectOption>}
                  {options.map((option) => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </FormFieldSelect>
              );
            })}
          </div>
        </header>

        <section className="bwb-search-page__results" aria-label="Zoekresultaten">
          {state.status === "idle" && (
            <p>Typ een zoekterm of kies een filter om te zoeken.</p>
          )}
          {state.status === "loading" && (
            <div className="bwb-search-page__loading">
              <p role="status">Zoeken…</p>
              <LinearProgress aria-label="Zoeken" />
            </div>
          )}
          {state.status === "error" && <LoadError error={state.error} />}
          {state.status === "loaded" && (
            <SearchResults
              page={page}
              q={q}
              records={state.result.records}
              total={state.result.total}
              pageSearch={pageSearch}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SearchResults({
  page,
  q,
  records,
  total,
  pageSearch,
}: {
  page: number;
  q: string;
  records: BwbSearchRecord[];
  total: number;
  pageSearch: (page: number) => string;
}) {
  if (total === 0) {
    return <p role="status">Er zijn geen regelingen gevonden.</p>;
  }
  if (records.length === 0) {
    return (
      <p role="status">
        Geen resultaten op deze pagina.{" "}
        <Link to={pageSearch(1)}>Naar de eerste pagina</Link>
      </p>
    );
  }

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + records.length - 1;
  const lastPage = Math.ceil(total / PAGE_SIZE);
  const count = `${total.toLocaleString("nl-NL")} ${total === 1 ? "resultaat" : "resultaten"}`;

  return (
    <>
      <p className="bwb-search-page__count" role="status">
        {total > PAGE_SIZE ? `${count} (${from}–${to})` : count}
      </p>
      <ol className="bwb-search-page__list" start={from}>
        {records.map((record) => (
          <ResultItem key={`${record.bwbId}/${record.expression}`} record={record} q={q} />
        ))}
      </ol>
      {lastPage > 1 && (
        <nav className="bwb-search-page__paging" aria-label="Paginering">
          {page > 1 && <Link to={pageSearch(page - 1)}>Vorige pagina</Link>}
          <span>
            Pagina {page} van {lastPage}
          </span>
          {page < lastPage && <Link to={pageSearch(page + 1)}>Volgende pagina</Link>}
        </nav>
      )}
    </>
  );
}

export default BwbSearchPage;
