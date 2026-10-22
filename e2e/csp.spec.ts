import { expect, test } from "@playwright/test";
import { openSettled, SCREENS } from "./helpers/screens";

/**
 * Step 6.6 — CSP 위반 수집. Chromium 은 enforce 든 Report-Only 든 위반을 콘솔에
 * "Content Security Policy" 문구로 남기므로, 4개 화면을 열어 그 메시지가 0건임을 확인한다.
 */
test.describe("CSP", () => {
  for (const screen of SCREENS) {
    test(`${screen.name} 화면에 CSP 위반이 없다`, async ({ page }) => {
      const violations: string[] = [];
      page.on("console", (message) => {
        if (message.text().includes("Content Security Policy")) {
          violations.push(message.text());
        }
      });

      // openSettled 는 networkidle 까지 기다리므로 하이드레이션 이후의 프리페치·이미지 로드도 포함된다.
      await openSettled(page, screen.path);

      expect(violations).toEqual([]);
    });
  }
});
