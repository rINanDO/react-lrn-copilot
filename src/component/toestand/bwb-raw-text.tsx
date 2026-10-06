import { encodeHTML } from "./utils";

function BwbRawText({ id, rawText }: { id: string; rawText?: string }) {
  if (!rawText) {
    return <></>;
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
      {nodes.map((node) => {
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            return <>{node.textContent}</>;
          default:
            switch (node.nodeName) {
              case "nadruk":
                {
                  const nadrukType = node.getAttribute("type") ?? "";
                  const textContent = node.textContent ?? "";
                  switch (nadrukType) {
                    case "vet":
                      return (
                        <>
                          <strong>{textContent}</strong>
                        </>
                      );
                    case "cur":
                      return (
                        <>
                          <em>{textContent}</em>
                        </>
                      );
                    case "ondlijn":
                      return (
                        <>
                          <u>{textContent}</u>
                        </>
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
                      <>
                        <a
                          href={`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${doc}`}
                          rel="nofollow"
                          target="_blank"
                        >
                          {text}
                        </a>
                      </>
                    );
                  default:
                    return (
                      <>
                        <a
                          href={`https://wetten.overheid.nl/${doc}`}
                          rel="nofollow"
                          target="_blank"
                        >
                          {text}
                        </a>
                      </>
                    );
                }
              }
              case "intref": {
                const doc = node.getAttribute("bwb-ng-variabel-deel") ?? "";
                const text = node.textContent ?? "";
                return (
                  <>
                    <a href={`#${doc}`}>{text}</a>
                  </>
                );
              }
              case "redactie":
                return <>[Red: {node.textContent}]</>;
              default:
                return (
                  <>
                    <strong>
                      * TODO {node.nodeName}: {node.textContent}
                    </strong>
                  </>
                );
            }
            break;
        }
        return <>{node.textContent}</>;
      })}
    </>
  );
}
export default BwbRawText;
