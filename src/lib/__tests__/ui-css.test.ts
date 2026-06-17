import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("UI upgrade CSS foundation", () => {
  it("defines Ink & Stage design tokens", () => {
    expect(css).toContain("--edu: #3457D5");
    expect(css).toContain("--play: #FF6B3D");
    expect(css).toContain("--surface-soft: #FBFCFE");
    expect(css).toContain("--r-lg: 22px");
  });

  it("adds the home staff-line signature motion", () => {
    expect(css).toContain("@keyframes staff-line-draw");
    expect(css).toContain("@keyframes playhead-sweep");
    expect(css).toContain(".heroStaff");
  });
});
