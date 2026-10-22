import { expect, test } from "@playwright/test";
import { openSettled, SCREENS } from "./helpers/screens";

/**
 * Step 6.6 — CSP 위반 수집. Chromium 은 enforce 든 Report-Only 든 위반을 콘솔에
 * "Content Security Policy" 문구로 남기므로, 4개 화면을 열어 그 메시지가 0건임을 확인한다.
 */
test.describe("CSP", () => {
  test("응답 헤더가 enforce 모드이고 인라인 스크립트(하이드레이션)가 막히지 않는다", async ({ page }) => {
    const response = await page.goto("/login");
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy-report-only"]).toBeUndefined();

    // 클라이언트 컴포넌트가 하이드레이션되어야 동작하는 토글 — script-src 가 Next 번들을 막으면 실패한다.
    const password = page.getByLabel("비밀번호", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "비밀번호 보기" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });

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
