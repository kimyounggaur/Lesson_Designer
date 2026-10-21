import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserProfile } from "@/features/auth/service";
import { canOpenApp, getApp } from "@/features/catalog";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ appId: string }> };

/**
 * 서버 접근 게이트. 모든 "앱 열기" 링크는 외부 URL 대신 이 라우트를 가리킨다.
 * 권한이 있으면 302 로 외부 배포 URL 에 보내고, 없으면 로그인 화면으로 보낸다.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { appId } = await params;
  const app = getApp(appId);

  if (!app) {
    return NextResponse.json({ error: "unknown app" }, { status: 404 });
  }

  const profile = await getCurrentUserProfile();
  const role = profile?.role ?? "guest";

  if (!canOpenApp(app, role)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `/go/${app.id}`);
    login.searchParams.set("notice", "required");
    return NextResponse.redirect(login, { status: 302, headers: { "Cache-Control": "no-store" } });
  }

  // Phase 8.1: 여기서 열람 기록(app_opens) 저장
  return NextResponse.redirect(app.url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
