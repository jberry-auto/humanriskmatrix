import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "../app/page";

describe("Home", () => {
  it("renders the project name as a heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /human risk matrix/i }),
    ).toBeInTheDocument();
  });

  it("links to the Matrix from the hero", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /view matrix/i })).toHaveAttribute("href", "/matrix");
  });

  it("shows the About content and roadmap milestones", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /about the project/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /project goals/i })).toBeInTheDocument();
    for (const v of ["v0.1", "v0.5", "v1.0"]) {
      expect(screen.getByText(v)).toBeInTheDocument();
    }
  });
});
