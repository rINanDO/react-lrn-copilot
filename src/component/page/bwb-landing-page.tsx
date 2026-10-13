import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heading,
  Link,
  PrimaryActionButton,
  TextInput,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import { appRoutes } from "../../router/routes";
import "./bwb-landing-page.css";

function BwbLandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    navigate({
      pathname: appRoutes.bwbSearch,
      search: q ? `?${new URLSearchParams({ q })}` : "",
    });
  };

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
      </div>
    </div>
  );
}

export default BwbLandingPage;
