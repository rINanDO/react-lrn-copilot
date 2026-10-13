import { type FormEvent, useState } from "react";
import { generatePath, Link, useSearchParams } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import {
  Heading,
  PrimaryActionButton,
  TextInput,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import {
  PAGE_SIZE,
  type CvdrSearchRecord,
  type CvdrSearchCriteria,
} from "../../api/sruRepository";
import { appRoutes } from "../../router/routes";
import LoadError from "../document/load-error";
import { useCvdrSearch } from "./use-cvdr-search";
import "./cvdr-search-page.css";

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function resultHref(record: CvdrSearchRecord, q: string): string {
  const path = generatePath(appRoutes.cvdr, {
    cvdr: record.cvdrId,
    expression: record.expression,
  });
  return q ? `${path}?${new URLSearchParams({ q })}` : path;
}

function SearchForm({ q, onSearch }: { q: string; onSearch: (q: string) => void }) {
  const [text, setText] = useState(q);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(text.trim());
  };

  return (
    <form className="cvdr-search-page__search" role="search" onSubmit={handleSubmit}>
      <TextInput
        aria-label="Zoek in lokale regelgeving"
        name="q"
        placeholder="Zoek op titel van een regeling"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <PrimaryActionButton type="submit">Zoeken</PrimaryActionButton>
    </form>
  );
}

function ResultItem({ record, q }: { record: CvdrSearchRecord; q: string }) {
  const details = [record.type, record.authority, record.cvdrId].filter(Boolean);

  return (
    <li className="cvdr-search-page__result">
      <Link className="cvdr-search-page__result-link" to={resultHref(record, q)}>
        {record.title}
      </Link>
      {details.length > 0 && (
        <div className="cvdr-search-page__result-details">{details.join(" · ")}</div>
      )}
    </li>
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
  records: CvdrSearchRecord[];
  total: number;
  pageSearch: (page: number) => string;
}) {
  if (total === 0) {
    return <p role="status">Er zijn geen regelingen gevonden.</p>;
  }
  if (records.length === 0) {
    return (
      <p role="status">
        Geen resultaten op deze pagina. <Link to={pageSearch(1)}>Naar de eerste pagina</Link>
      </p>
    );
  }

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + records.length - 1;
  const lastPage = Math.ceil(total / PAGE_SIZE);
  const count = `${total.toLocaleString("nl-NL")} ${total === 1 ? "resultaat" : "resultaten"}`;

  return (
    <>
      <p className="cvdr-search-page__count" role="status">
        {total > PAGE_SIZE ? `${count} (${from}–${to})` : count}
      </p>
      <ol className="cvdr-search-page__list" start={from}>
        {records.map((record) => (
          <ResultItem key={`${record.cvdrId}/${record.expression}`} record={record} q={q} />
        ))}
      </ol>
      {lastPage > 1 && (
        <nav className="cvdr-search-page__paging" aria-label="Paginering">
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

function CvdrSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const criteria: CvdrSearchCriteria = { q };
  const page = parsePage(searchParams.get("pagina"));
  const state = useCvdrSearch(criteria, page);

  const updateSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
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
    <div className="rhc-theme cvdr-search-page">
      <div className="cvdr-search-page__shell">
        <header className="cvdr-search-page__header">
          <div className="cvdr-search-page__eyebrow">Overheid.nl</div>
          <Heading level={1}>Zoeken in de lokale regelgeving</Heading>
          <SearchForm key={q} q={q} onSearch={updateSearch} />
          <p className="cvdr-search-page__note">
            Er wordt gezocht in de titels van regelingen uit de CVDR-collectie.
          </p>
        </header>

        <section className="cvdr-search-page__results" aria-label="Zoekresultaten">
          {state.status === "idle" && <p>Typ een zoekterm om te zoeken.</p>}
          {state.status === "loading" && (
            <div className="cvdr-search-page__loading">
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

export default CvdrSearchPage;
