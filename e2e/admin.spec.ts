import { expect, test } from "@playwright/test";
import { e2eAccount, login, logout, skipReason } from "./helpers/login";

const admin = e2eAccount("admin");

test.describe("관리자", () => {
  test.skip(!admin, skipReason("admin"));

  test("로그인 → 하단 탭에 '관리' → /admin 200", async ({ page }) => {
    await login(page, admin, "/");

    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "관리자", exact: true })).toHaveAttribute("href", "/admin");
    await expect(header.getByRole("button", { name: "로그아웃" })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "주 메뉴" });
    const adminTab = nav.getByRole("link", { name: "관리", exact: true });
    await expect(adminTab).toHaveAttribute("href", "/admin");
    await adminTab.click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(adminTab).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1, name: "앱 접근 현황" })).toBeVisible();

    const response = await page.request.get("/admin");
    expect(response.status()).toBe(200);

    await logout(page);
  });
});
