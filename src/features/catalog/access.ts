import type { LessonApp } from "./apps";

export type UserRole = "guest" | "member" | "admin";

type AccessLike = Pick<LessonApp, "access">;

/** DB 의 role 문자열을 안전하게 좁힌다. 모르는 값은 guest (fail-closed). */
export function normalizeRole(role: unknown): UserRole {
  if (role === "admin") {
    return "admin";
  }

  if (role === "member") {
    return "member";
  }

  return "guest";
}

export function canOpenApp(app: AccessLike, role: UserRole): boolean {
  return role !== "guest" || app.access === "public";
}

export function canAccessAdminPage(role: UserRole): boolean {
  return role === "admin";
}

/** 현재 역할로 열 수 있는 첫 번째 앱. 없으면 null (추천 카드에 잠긴 앱을 노출하지 않기 위함). */
export function firstOpenableApp<T extends AccessLike>(apps: readonly T[], role: UserRole): T | null {
  return apps.find((app) => canOpenApp(app, role)) ?? null;
}

export function roleLabel(role: UserRole): string {
  return { guest: "게스트", member: "회원", admin: "관리자" }[role];
}
