import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = ["/", "/category/instrument-education", "/category/music-game"];

test.describe("게스트", () => {
  test("홈 → 악기 탭 → 공개 앱은 /go 게이트, 회원용 앱은 로그인(next 포함)으로 이어진다", async ({
    page
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Lesson Designer/ })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "로그인", exact: true })).toHaveAttribute(
      "href",
      "/login"
    );

    await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "악기" }).click();
    await expect(page).toHaveURL(/\/category\/instrument-education$/);
    await expect(page.getByRole("heading", { level: 1, name: "악기 교육앱" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "악기" })
    ).toHaveAttribute("aria-current", "page");

    const guitar = page
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { level: 3, name: "기타 코드 배우기" }) });
    const start = guitar.getByRole("link", { name: /시작/ });
    await expect(start).toHaveAttribute("href", "/go/guitar-chord");
    await expect(start).toHaveAttribute("target", "_blank");
    await expect(start).toHaveAttribute("rel", "noreferrer");

    const kalimba = page
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { level: 3, name: "칼림바" }) });
    const loginToOpen = kalimba.getByRole("link", { name: /로그인하고 열기/ });
    await expect(loginToOpen).toHaveAttribute("href", /^\/login\?next=%2Fgo%2Fkalimba/);
    await loginToOpen.click();

    await expect(page).toHaveURL(/\/login\?next=%2Fgo%2Fkalimba&notice=required$/);
    await expect(page.getByRole("heading", { level: 1, name: "회원 로그인" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("이 앱은 회원 로그인 후 이용할 수 있습니다.");
    await expect(page.locator('input[name="next"]')).toHaveValue("/go/kalimba");
    await expect(page.getByRole("link", { name: "회원가입" })).toHaveAttribute(
      "href",
      "/signup?next=%2Fgo%2Fkalimba"
    );
  });

  test("/go 게이트: 회원용 앱은 로그인으로, 공개 앱은 외부 배포로, 모르는 id 는 404", async ({ request }) => {
    const locked = await request.get("/go/kalimba", { maxRedirects: 0 });
    expect(locked.status()).toBe(302);
    expect(locked.headers()["location"]).toContain("/login?next=%2Fgo%2Fkalimba&notice=required");
    expect(locked.headers()["cache-control"]).toBe("no-store");

    const open = await request.get("/go/guitar-chord", { maxRedirects: 0 });
    expect(open.status()).toBe(302);
    expect(open.headers()["location"]).toBe("https://guitar-chord-viewer.vercel.app/");
    expect(open.headers()["cache-control"]).toBe("no-store");

    const unknown = await request.get("/go/nope", { maxRedirects: 0 });
    expect(unknown.status()).toBe(404);
  });

  test("외부 배포 URL 은 어떤 화면의 HTML 에도 없다", async ({ page }) => {
    for (const path of PUBLIC_PAGES) {
      await page.goto(path);
      expect(await page.content(), path).not.toContain("vercel.app");
    }
  });

  test("게스트의 /admin 은 로그인 화면으로 보낸다", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=(%2F|\/)admin$/);
    await expect(page.getByRole("heading", { level: 1, name: "회원 로그인" })).toBeVisible();
  });

  test("보안 응답 헤더가 모든 화면에 붙는다", async ({ request }) => {
    for (const path of [...PUBLIC_PAGES, "/login"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const headers = response.headers();
      expect(headers["x-content-type-options"], path).toBe("nosniff");
      expect(headers["x-frame-options"], path).toBe("DENY");
      expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
      expect(
        headers["content-security-policy"] ?? headers["content-security-policy-report-only"],
        path
      ).toContain("default-src 'self'");
    }
  });
});
