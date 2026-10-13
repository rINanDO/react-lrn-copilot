import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BwbLandingPage from "./bwb-landing-page";
import { searchBwb } from "../../api/bwbSearchRepository";

vi.mock("../../api/bwbSearchRepository", () => ({
  searchBwb: vi.fn(),
}));

describe("BwbLandingPage", () => {
  it("searches via SRU and shows links to BWB regulations", async () => {
    vi.mocked(searchBwb).mockResolvedValue({
      numberOfRecords: 1,
      records: [{ bwbId: "BWBR0001840", title: "Grondwet" }],
    });

    render(
      <MemoryRouter>
        <BwbLandingPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: /zoek in wetten/i }), {
      target: { value: "grondwet" },
    });
    fireEvent.click(screen.getByRole("button", { name: /zoeken/i }));

    await waitFor(() => {
      expect(searchBwb).toHaveBeenCalledWith(
        "grondwet",
        expect.objectContaining({ startRecord: 1, maximumRecords: 20 }),
      );
    });

    expect(await screen.findByText("Grondwet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open regeling/i })).toHaveAttribute(
      "href",
      "/bwb/BWBR0001840",
    );
  });
});
