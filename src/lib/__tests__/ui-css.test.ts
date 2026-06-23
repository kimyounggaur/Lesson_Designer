import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("UI upgrade CSS foundation", () => {
  it("defines the exported mobile app palette and device frame", () => {
    expect(css).toContain("--app-blue: #3f5fd8");
    expect(css).toContain("--app-teal: #19b7c4");
    expect(css).toContain(".deviceStage");
    expect(css).toContain(".phoneFrame");
  });

  it("adds the prototype progress and bottom navigation patterns", () => {
    expect(css).toContain(".progressHero");
    expect(css).toContain(".continueCard");
    expect(css).toContain(".mobileTabBar");
    expect(css).toContain(".bottomNav");
  });
});
