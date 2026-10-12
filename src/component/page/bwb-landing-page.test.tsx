import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BwbLandingPage from "./bwb-landing-page";

describe("BwbLandingPage", () => {
  it("shows a dismissible work-in-progress dialog when submitting the search form", () => {
    render(<BwbLandingPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /zoek in wetten/i }), {
      target: { value: "grondwet" },
    });
    fireEvent.click(screen.getByRole("button", { name: /zoeken/i }));

    expect(screen.getByRole("dialog", { name: /zoeken/i })).toBeInTheDocument();
    expect(screen.getByText("Work in progress")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sluiten/i }));

    expect(screen.queryByText("Work in progress")).not.toBeInTheDocument();
  });
});
