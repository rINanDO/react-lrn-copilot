function encodeHTML(str: string) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function htmlDecode(str: string) {
  const element = document.createElement("div");
  if (str) {
    element.innerHTML = str;
  }
  return element.innerText || element.textContent;
}

export { encodeHTML, htmlDecode };
