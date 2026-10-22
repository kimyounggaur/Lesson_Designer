import { expect, type Page } from "@playwright/test";

export type E2EAccount = { email: string; password: string };

export type E2ERole = "member" | "admin";

const ENV_KEYS: Record<E2ERole, { email: string; password: string }> = {
  member: { email: "E2E_MEMBER_EMAIL", password: "E2E_MEMBER_PASSWORD" },
  admin: { email: "E2E_ADMIN_EMAIL", password: "E2E_ADMIN_PASSWORD" }
};

/** DECISIONS D8: e2e 계정은 환경변수에서만 읽는다. 없으면 null → 호출 측이 test.skip 한다. */
export function e2eAccount(role: E2ERole): E2EAccount | null {
  const keys = ENV_KEYS[role];
  const email = process.env[keys.email];
  const password = process.env[keys.password];
  return email && password ? { email, password } : null;
}

export function skipReason(role: E2ERole): string {
  const keys = ENV_KEYS[role];
  return `e2e 계정 없음 — ${keys.email}/${keys.password} 환경변수를 설정하세요 (DECISIONS D8)`;
}

/** 로그인 화면에서 자격 증명을 제출하고 `next` 경로로 돌아올 때까지 기다린다. */
export async function login(page: Page, account: E2EAccount | null, next = "/") {
  if (!account) {
    throw new Error("e2e 계정이 없는데 login() 이 호출되었습니다. test.skip 조건을 확인하세요.");
  }

  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("이메일").fill(account.email);
  await page.getByLabel("비밀번호", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  const target = new URL(next, "http://placeholder.invalid");
  await page.waitForURL((url) => url.pathname === target.pathname && url.search === target.search);
}

/** 헤더의 로그아웃 폼을 제출하고 게스트 상태(로그인 칩)가 보일 때까지 기다린다. */
export async function logout(page: Page) {
  const header = page.getByRole("banner");
  await header.getByRole("button", { name: "로그아웃" }).click();
  await expect(header.getByRole("link", { name: "로그인", exact: true })).toBeVisible();
}
