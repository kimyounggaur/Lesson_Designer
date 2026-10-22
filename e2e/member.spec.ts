import { expect, test } from "@playwright/test";
import { e2eAccount, login, logout, skipReason } from "./helpers/login";

const member = e2eAccount("member");

test.describe("회원", () => {
  test.skip(!member, skipReason("member"));

  test("로그인 → next 복귀 → 모든 앱 열림 → /admin 은 403 안내 → 로그아웃", async ({ page }) => {
    await login(page, member, "/category/instrument-education");
    await expect(page.getByRole("heading", { level: 1, name: "악기 교육앱" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "로그아웃" })).toBeVisible();

    // 요청 레벨: 로그인 쿠키를 가진 요청은 /go/kalimba 에서 외부 배포로 302 한다 (외부 요청은 따라가지 않는다).
    const gate = await page.request.get("/go/kalimba", { maxRedirects: 0 });
    expect(gate.status()).toBe(302);
    const location = gate.headers()["location"] ?? "";
    expect(location).toMatch(/^https:\/\//);
    expect(location).not.toContain("/login");
    expect(gate.headers()["cache-control"]).toBe("no-store");

    // 두 카테고리 화면의 카드가 전부 "시작" 이고, 고유한 /go 링크 수가 전체 앱 수(14)와 같다.
    const openHrefs = new Set<string>();
    for (const path of ["/category/instrument-education", "/category/music-game"]) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: /로그인하고 열기/ })).toHaveCount(0);
      const hrefs = await page
        .getByRole("article")
        .getByRole("link", { name: /시작/ })
        .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
      hrefs.forEach((href) => openHrefs.add(href));
      expect(await page.content(), path).not.toContain("vercel.app");
    }
    expect([...openHrefs].every((href) => href.startsWith("/go/"))).toBe(true);
    expect(openHrefs.size).toBe(14);

    // 회원의 /admin: 로그아웃시키거나 다른 곳으로 보내지 않고 403 안내만 보여준다 (B-1).
    const admin = await page.goto("/admin");
    expect(admin?.status()).toBe(200);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1, name: "관리자 전용 화면입니다" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "로그아웃" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "관리" })
    ).toHaveCount(0);

    await logout(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("banner").getByRole("link", { name: "로그인", exact: true })).toBeVisible();

    const afterLogout = await page.request.get("/go/kalimba", { maxRedirects: 0 });
    expect(afterLogout.headers()["location"]).toContain("/login?next=%2Fgo%2Fkalimba");
  });
});
