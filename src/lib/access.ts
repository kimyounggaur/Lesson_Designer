import type { LessonApp } from "./apps";

export type UserRole = "guest" | "member" | "admin";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (role === "admin") {
    return "admin";
  }

  if (role === "member") {
    return "member";
  }

  return "guest";
}

export function canOpenApp(app: LessonApp, role: UserRole) {
  if (role === "admin" || role === "member") {
    return true;
  }

  return app.publicAccess;
}

export function canAccessAdminPage(role: UserRole) {
  return role === "admin";
}
