import { expect, test } from "@playwright/test";
import { openSettled, SCREENS } from "./helpers/screens";

/**
 * 시각 회귀 기준선 — 390×844 모바일 Chromium, maxDiffPixelRatio 0.01 (playwright.config.ts).
 * 기준선 갱신: `npx playwright test e2e/visual.spec.ts --update-snapshots` 후 이미지를 눈으로 확인하고 커밋.
 */
test.describe("시각 스냅샷", () => {
  for (const screen of SCREENS) {
    test(`${screen.name} 화면이 기준선과 같다`, async ({ page }) => {
      await openSettled(page, screen.path);
      await expect(page).toHaveScreenshot(`${screen.name}.png`, { animations: "disabled", caret: "hide" });
    });
  }
});
