import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * 매 요청마다 Supabase 세션 쿠키를 갱신한다 (Next 16 proxy).
 *
 * D6: 프로젝트의 JWT 서명 키 타입이 확인되지 않아 `getUser()` 를 유지한다(Auth 서버에서 토큰 검증).
 * 비대칭 키(ECC/RSA)로 확인되면 `getClaims()` 로 바꿔 로컬 검증으로 전환한다 — docs/refactor/DECISIONS.md D6.
 */
export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();

  if (!env.isConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();

  return response;
}
