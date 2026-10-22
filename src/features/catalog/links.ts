import type { Route } from "next";
import type { LessonApp } from "./apps";

type AppRef = Pick<LessonApp, "id">;

/** 앱 열기 경로. 외부 URL 은 절대 직접 렌더하지 않는다 — 서버 게이트 /go/[appId] 경유 (CLAUDE.md 규칙 2). */
export function appOpenHref(app: AppRef): Route {
  return `/go/${app.id}` as Route;
}

/** 잠긴 앱의 로그인 경로. 로그인 후 /go/[appId] 로 복귀한다 (B-2). */
export function appLoginHref(app: AppRef): Route {
  return `/login?next=${encodeURIComponent(`/go/${app.id}`)}&notice=required` as Route;
}
