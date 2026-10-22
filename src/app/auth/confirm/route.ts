import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "email",
  "recovery",
  "invite",
  "magiclink",
  "email_change"
];

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (OTP_TYPES as readonly string[]).includes(value);
}

/**
 * Supabase 이메일 확인 콜백.
 * 이메일 템플릿의 링크: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next"));

  if (tokenHash && isOtpType(type)) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // verifyOtp 가 세션을 만들었으면 바로 목적지로, 아니면 로그인 화면으로.
      const target = data.session ? next : "/login?notice=confirmed";
      return NextResponse.redirect(new URL(target, request.url), { status: 303 });
    }

    console.error("[auth:confirm]", error.code, error.message);
  }

  return NextResponse.redirect(new URL("/login?notice=confirm-failed", request.url), { status: 303 });
}
