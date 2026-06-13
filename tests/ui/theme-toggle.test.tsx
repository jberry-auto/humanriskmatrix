import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("defaults to light and switches to dark on press", async () => {
    renderToggle();

    const toggle = await screen.findByRole("button", { name: /switch to dark theme/i });
    await userEvent.click(toggle);

    expect(
      await screen.findByRole("button", { name: /switch to light theme/i }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });
});
