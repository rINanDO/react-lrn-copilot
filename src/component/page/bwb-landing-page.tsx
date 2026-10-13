import { type FormEvent, useEffect, useState } from "react";
import { generatePath, Link as RouterLink } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import {
  Heading,
  Link,
  PrimaryActionButton,
  TextInput,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import {
  searchBwb,
  type BwbSearchResponse,
} from "../../api/bwbSearchRepository";
import { appRoutes } from "../../router/routes";
import "./bwb-landing-page.css";

const PAGE_SIZE = 20;

function BwbLandingPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [startRecord, setStartRecord] = useState(1);
  const [searchResult, setSearchResult] = useState<BwbSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setStartRecord(1);
    setSubmittedQuery(trimmed);
  };

  useEffect(() => {
    if (!submittedQuery) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchBwb(submittedQuery, {
      startRecord,
      maximumRecords: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((result) => setSearchResult(result))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Er ging iets mis bij het zoeken in de BWB zoekservice.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [submittedQuery, startRecord]);

  const total = searchResult?.numberOfRecords ?? 0;
  const shown = searchResult?.records.length ?? 0;
  const from = shown > 0 ? startRecord : 0;
  const to = shown > 0 ? Math.min(startRecord + shown - 1, total) : 0;
  const hasNext = total > to;

  return (
    <div className="rhc-theme bwb-landing-page">
      <div className="bwb-landing-page__shell">
        <header className="bwb-landing-page__hero">
          <div className="bwb-landing-page__eyebrow">Overheid.nl</div>
          <Heading level={1}>Zoeken in de wet- en regelgeving</Heading>
          <p className="bwb-landing-page__lede">
            Zoek in Nederlandse wetten, regelingen en officiële publicaties.
          </p>

          <form className="bwb-landing-page__search" onSubmit={handleSubmit}>
            <TextInput
              aria-label="Zoek in wetten"
              name="search"
              placeholder="Zoek op onderwerp, artikel of wet"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <PrimaryActionButton type="submit">Zoeken</PrimaryActionButton>
          </form>

          <ul className="bwb-landing-page__links" aria-label="Handige links">
            <li>
              <Link href="https://wetten.overheid.nl/" aria-label="Open overzicht van wetten">
                Wet- en regelgeving
              </Link>
            </li>
            <li>
              <Link href="https://www.overheid.nl/" aria-label="Open overheid.nl">
                Overheid.nl
              </Link>
            </li>
            <li>
              <Link href="https://www.overheid.nl/help/zoeken" aria-label="Open hulp bij zoeken">
                Help bij zoeken
              </Link>
            </li>
          </ul>
        </header>

        {submittedQuery && (
          <section className="bwb-landing-page__results" aria-live="polite">
            <Heading level={2}>Zoekresultaten</Heading>
            <p className="bwb-landing-page__result-meta">
              Zoekterm: <strong>{submittedQuery}</strong>
            </p>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && searchResult && (
              <>
                <p className="bwb-landing-page__result-meta">
                  {searchResult.numberOfRecords === 0
                    ? "Geen resultaten gevonden."
                    : `${from}–${to} van ${searchResult.numberOfRecords} resultaten`}
                </p>

                {searchResult.records.length > 0 && (
                  <>
                    <table className="bwb-landing-page__table">
                      <thead>
                        <tr>
                          <th>Titel</th>
                          <th>BWB-id</th>
                          <th>Actie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResult.records.map((record) => (
                          <tr key={`${record.bwbId}:${record.title}`}>
                            <td>{record.title}</td>
                            <td>{record.bwbId}</td>
                            <td>
                              <RouterLink
                                to={generatePath(appRoutes.bwbExpressions, {
                                  bwbid: record.bwbId,
                                })}
                              >
                                Open regeling
                              </RouterLink>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="bwb-landing-page__pager">
                      <button
                        type="button"
                        className="bwb-landing-page__pager-button"
                        onClick={() =>
                          setStartRecord((current) => Math.max(1, current - PAGE_SIZE))
                        }
                        disabled={startRecord <= 1 || loading}
                      >
                        Vorige
                      </button>
                      <button
                        type="button"
                        className="bwb-landing-page__pager-button"
                        onClick={() => setStartRecord((current) => current + PAGE_SIZE)}
                        disabled={!hasNext || loading}
                      >
                        Volgende
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default BwbLandingPage;
