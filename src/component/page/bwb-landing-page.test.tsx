import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import BwbLandingPage from "./bwb-landing-page";

afterEach(cleanup);

function SearchMarker() {
  const location = useLocation();
  return <div data-testid="search-page">{location.pathname + location.search}</div>;
}

function search(text: string) {
  render(
    <MemoryRouter initialEntries={["/bwb"]}>
      <Routes>
        <Route path="/bwb" element={<BwbLandingPage />} />
        <Route path="/bwb/zoeken" element={<SearchMarker />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: /zoek in wetten/i }), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /zoeken/i }));
}

describe("BwbLandingPage", () => {
  it("navigates to the search results for the trimmed search text", () => {
    search("  grondwet ");

    expect(screen.getByTestId("search-page")).toHaveTextContent("/bwb/zoeken?q=grondwet");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates to the search page without q for a blank search", () => {
    search("   ");

    expect(screen.getByTestId("search-page").textContent).toBe("/bwb/zoeken");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
