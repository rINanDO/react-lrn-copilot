// The backend now hands <al> content through as raw inner XML instead of a
// parsed tree, so BWB markup tags (nadruk, extref, intref, inf, ...) need to
// be rewritten to real HTML equivalents before they're set as innerHTML.

const NADRUK_SIMPLE_TAGS: Record<string, string> = {
  vet: "strong",
  cur: "em",
  ondlijn: "u",
};

const NADRUK_STYLES: Record<string, string> = {
  rom: "font-style:normal;font-weight:normal",
  nonprop: "font-family:monospace",
  klkap: "font-variant:small-caps",
  kap: "text-transform:uppercase",
  halfvet: "font-weight:600",
};

const EXT_REF_REEKSEN: Record<
  string,
  { href: string; class: string; rel: string }
> = {
  Celex: {
    href: "https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:[doc]",
    class: "eurlex-link is-external",
    rel: "nofollow",
  },
};
function replaceElementWithTag(
  element: Element,
  tagName: string,
  attributes?: Record<string, string>,
): HTMLElement {
  const replacement = document.createElement(tagName);
  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      replacement.setAttribute(name, value);
    }
  }
  while (element.firstChild) {
    replacement.appendChild(element.firstChild);
  }
  element.replaceWith(replacement);
  return replacement;
}

function processNadruk(element: Element): void {
  const type = element.getAttribute("type")?.toLowerCase() ?? "cur";

  if (type === "vetcur") {
    const em = document.createElement("em");
    while (element.firstChild) {
      em.appendChild(element.firstChild);
    }
    const strong = document.createElement("strong");
    strong.appendChild(em);
    element.replaceWith(strong);
    return;
  }

  const simpleTag = NADRUK_SIMPLE_TAGS[type];
  if (simpleTag) {
    replaceElementWithTag(element, simpleTag);
    return;
  }

  const style = NADRUK_STYLES[type];
  replaceElementWithTag(element, "span", style ? { style } : undefined);
}

function processReference(
  element: Element,
  refType: "extref" | "intref",
): void {
  const doc = element.getAttribute("doc");
  const attributes: Record<string, string> = { class: `bwb-${refType}` };
  if (doc) {
    attributes["href"] = doc;
  }
  if (refType === "extref") {
    const reeks = element.getAttribute("reeks");
    if (reeks && EXT_REF_REEKSEN[reeks]) {
      const extRef = EXT_REF_REEKSEN[reeks];
      attributes["href"] = extRef.href.replace("[doc]", doc ?? "");
      attributes["class"] = extRef.class;
      attributes["rel"] = extRef.rel;

      const wcagSpan = document.createElement("span");
      wcagSpan.className = "visually-hidden";
      wcagSpan.textContent = "Externe link: ";
      element.insertBefore(wcagSpan, element.firstChild);
    }
  }
  replaceElementWithTag(element, "a", attributes);
}

function processInf(element: Element): void {
  replaceElementWithTag(element, "sub");
}

/**
 * Rewrites BWB-specific tags found in raw <al> XML content into real HTML
 * elements, so the result is safe to hand to dangerouslySetInnerHTML.
 */
export function processAlHtml(rawHtml: string): string {
  if (!rawHtml) {
    return "";
  }

  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  container.querySelectorAll("nadruk").forEach(processNadruk);
  container
    .querySelectorAll("extref")
    .forEach((element) => processReference(element, "extref"));
  container
    .querySelectorAll("intref")
    .forEach((element) => processReference(element, "intref"));
  container.querySelectorAll("inf").forEach(processInf);

  return container.innerHTML;
}
