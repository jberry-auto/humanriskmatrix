import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tag } from "@/components/ui/Tag";

describe("Tag", () => {
  it("always renders its label (meaning never relies on color alone)", () => {
    render(<Tag degree="internal">Accidental Disclosure</Tag>);
    expect(screen.getByText("Accidental Disclosure")).toBeInTheDocument();
  });
});
