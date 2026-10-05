function Footer() {
  return (
    <>
      <div className="footer row--footer" role="contentinfo">
        <div className="container columns">
          <ul className="list--linked">
            <li>
              <a href="https://www.overheid.nl/over-deze-site">
                Over deze website
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/contact/reageren-op-wet-en-regelgeving">
                Contact
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/english" lang="en">
                English
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/help/wet-en-regelgeving">Help</a>
            </li>
            <li>
              <a href="https://www.overheid.nl/help/zoeken">Zoeken</a>
            </li>
          </ul>
          <ul className="list list--linked">
            <li>
              <a href="https://www.overheid.nl/informatie-hergebruiken">
                Informatie hergebruiken
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/privacy-statement">
                Privacy en cookies
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/toegankelijkheid">
                Toegankelijkheid
              </a>
            </li>
            <li>
              <a href="https://www.overheid.nl/sitemap">Sitemap</a>
            </li>
            <li className="list__item">
              <a
                href="https://www.ncsc.nl/contact/kwetsbaarheid-melden"
                className="is-external"
              >
                <span className="visually-hidden">Externe link: </span>
                Kwetsbaarheid melden
              </a>
            </li>
          </ul>
          <ul className="list list--linked">
            <li>
              <a href="https://linkeddata.overheid.nl/">Linked Data Overheid</a>
            </li>
            <li>
              <a href="http://powersearch.wetten.nl/" className="is-external">
                <span className="visually-hidden">Externe link: </span>
                Powersearch
              </a>
            </li>
          </ul>
          <ul className="list list--linked">
            <li>
              <a href="https://mijn.overheid.nl/">MijnOverheid.nl</a>
            </li>
            <li>
              <a href="https://www.rijksoverheid.nl/" className="is-external">
                <span className="visually-hidden">Externe link: </span>
                Rijksoverheid.nl
              </a>
            </li>
            <li>
              <a
                href="https://ondernemersplein.kvk.nl/"
                className="is-external"
              >
                <span className="visually-hidden">Externe link: </span>
                Ondernemersplein
              </a>
            </li>
            <li>
              <a
                href="https://www.werkenbijdeoverheid.nl/"
                className="is-external"
              >
                <span className="visually-hidden">Externe link: </span>
                Werkenbijdeoverheid.nl
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Footer;
