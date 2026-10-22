import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openSettled, SCREENS } from "./helpers/screens";

type Violation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

const BLOCKING = new Set(["serious", "critical"]);

function summarize(violation: Violation) {
  return {
    id: violation.id,
    impact: violation.impact ?? "unknown",
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(" ")).slice(0, 5)
  };
}

test.describe("접근성(axe)", () => {
  for (const screen of SCREENS) {
    test(`${screen.name} 화면에 serious/critical 위반이 없다`, async ({ page }) => {
      await openSettled(page, screen.path);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter((violation) => BLOCKING.has(violation.impact ?? ""));
      const advisory = results.violations.filter((violation) => !BLOCKING.has(violation.impact ?? ""));

      if (advisory.length > 0) {
        // moderate/minor 는 실패시키지 않고 리포트에만 남긴다.
        console.log(
          `[a11y:${screen.name}] moderate/minor:`,
          JSON.stringify(advisory.map(summarize), null, 2)
        );
      }

      expect(blocking.map(summarize)).toEqual([]);
    });
  }
});
