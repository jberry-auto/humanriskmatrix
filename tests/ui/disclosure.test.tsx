import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Disclosure } from "@/components/ui/Disclosure";

describe("Disclosure", () => {
  it("toggles expanded state via keyboard/click", async () => {
    render(<Disclosure title="More info">Body</Disclosure>);
    const trigger = screen.getByRole("button", { name: "More info" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
