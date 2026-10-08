import { Fragment } from "react";
import { encodeHTML } from "./utils";

function BwbRawText({ id, rawText }: { id: string; rawText?: string }) {
  if (!rawText) {
    return <></>;
  }
  // Without tags or entities the text parses to itself; skip the DOMParser,
  // which is costly when repeated for every fragment of a large regeling.
  if (!/[<&]/.test(rawText)) {
    return <>{rawText}</>;
  }
  const raw = `<?xml version="1.0" encoding="UTF-8" ?><root>${rawText}</root>`;
  const parser = new DOMParser();
  const xml = parser.parseFromString(raw, "text/xml");
  const nodes = Array.prototype.slice.call(xml.childNodes[0]?.childNodes);
  if (nodes.length === 0) {
    return (
      <>
        <span
          key={id}
          dangerouslySetInnerHTML={{ __html: encodeHTML(rawText) }}
        />
      </>
    );
  }
  // TODO
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            return <Fragment key={index}>{node.textContent}</Fragment>;
          default:
            switch (node.nodeName) {
              case "nadruk":
                {
                  const nadrukType = node.getAttribute("type") ?? "";
                  const textContent = node.textContent ?? "";
                  switch (nadrukType) {
                    case "vet":
                      return (
                        <Fragment key={index}>
                          <strong>{textContent}</strong>
                        </Fragment>
                      );
                    case "cur":
                      return (
                        <Fragment key={index}>
                          <em>{textContent}</em>
                        </Fragment>
                      );
                    case "ondlijn":
                      return (
                        <Fragment key={index}>
                          <u>{textContent}</u>
                        </Fragment>
                      );
                    default:
                      // Handle default case
                      break;
                  }
                }
                break;
              case "extref": {
                const doc = node.getAttribute("doc") ?? "";
                const text = node.textContent ?? "";
                const reeks = node.getAttribute("reeks") ?? "";
                switch (reeks) {
                  case "Celex":
                    return (
                      <Fragment key={index}>
                        <a
                          href={`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${doc}`}
                          rel="nofollow"
                          target="_blank"
                        >
                          {text}
                        </a>
                      </Fragment>
                    );
                  default:
                    return (
                      <Fragment key={index}>
                        <a
                          href={`https://wetten.overheid.nl/${doc}`}
                          rel="nofollow"
                          target="_blank"
                        >
                          {text}
                        </a>
                      </Fragment>
                    );
                }
              }
              case "intref": {
                const doc = node.getAttribute("bwb-ng-variabel-deel") ?? "";
                const text = node.textContent ?? "";
                return (
                  <Fragment key={index}>
                    <a href={`#${doc}`}>{text}</a>
                  </Fragment>
                );
              }
              case "redactie":
                return <Fragment key={index}>[Red: {node.textContent}]</Fragment>;
              default:
                return (
                  <Fragment key={index}>
                    <strong>
                      * TODO {node.nodeName}: {node.textContent}
                    </strong>
                  </Fragment>
                );
            }
            break;
        }
        return <Fragment key={index}>{node.textContent}</Fragment>;
      })}
    </>
  );
}
export default BwbRawText;
