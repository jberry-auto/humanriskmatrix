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

  it("lists all five intent degrees", () => {
    render(<Home />);
    for (const degree of ["Unintentional", "Unaware", "Deceived", "Coerced", "Complicit"]) {
      expect(screen.getByText(degree)).toBeInTheDocument();
    }
  });
});
