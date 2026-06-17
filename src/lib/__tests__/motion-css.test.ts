import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("motion CSS", () => {
  it("defines a calm fade-up entrance animation", () => {
    expect(css).toContain("@keyframes ld-fade-up");
    expect(css).toContain("translateY(16px)");
  });

  it("adds lift transitions to app and category cards", () => {
    expect(css).toContain(".categoryButton:hover");
    expect(css).toContain(".appCard:hover");
    expect(css).toContain("translateY(-4px)");
  });

  it("respects reduced motion preferences", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important");
  });
});
