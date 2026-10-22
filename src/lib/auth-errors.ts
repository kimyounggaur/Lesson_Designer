import type { AuthError } from "@supabase/supabase-js";

export const FALLBACK_AUTH_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_not_confirmed: "이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.",
  user_already_exists: "이미 가입된 이메일입니다. 로그인해주세요.",
  weak_password: "비밀번호가 너무 단순합니다. 6자 이상, 문자와 숫자를 섞어주세요.",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  over_email_send_rate_limit: "인증 메일 발송 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
  signup_disabled: "현재 신규 가입이 중단되어 있습니다.",
  otp_expired: "인증 링크가 만료되었습니다. 다시 시도해주세요.",
  validation_failed: "입력값을 확인해주세요."
};

type ErrorLike = Pick<AuthError, "code"> | { code?: string | null } | null | undefined;

export function toUserMessage(error: ErrorLike, fallback = FALLBACK_AUTH_MESSAGE): string {
  if (!error || !error.code) {
    return fallback;
  }

  return MESSAGES[error.code] ?? fallback;
}
