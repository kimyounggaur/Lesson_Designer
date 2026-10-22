import { defineConfig } from "@playwright/test";

/**
 * Phase 6 e2e 설정.
 * - 프로덕션 빌드(`next start -p 3100`)를 대상으로 돈다. 로컬에서 서버를 미리 띄워 두면 재사용한다.
 * - 뷰포트는 설계 §6 Step 6.4 의 390×844 모바일 Chromium 하나로 고정한다(시각 스냅샷 기준선과 동일).
 * - PW_EXECUTABLE_PATH 가 있으면 그 Chromium 을 쓴다(사전 설치 브라우저가 @playwright/test 버전과 다른 환경용).
 *   CI 는 `npx playwright install --with-deps chromium` 으로 받은 기본 브라우저를 쓴다.
 * - 회원/관리자 스펙은 E2E_* 계정(DECISIONS D8)이 없으면 스스로 skip 한다.
 */
const PORT = 3100;
const executablePath = process.env.PW_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 }
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 180_000
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        ...(executablePath ? { launchOptions: { executablePath } } : {})
      }
    }
  ]
});
