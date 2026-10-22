export const PASSWORD_MIN = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Credentials = { email: string; password: string };

export type CredentialsResult = { ok: true; value: Credentials } | { ok: false; error: string };

export const CREDENTIAL_ERRORS = {
  email: "이메일 주소를 확인해주세요.",
  password: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.`
} as const;

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** 폼 데이터에서 이메일·비밀번호를 꺼내 검증한다. 이메일은 공백 제거 + 소문자 정규화. */
export function credentialsFromForm(formData: FormData): CredentialsResult {
  const email = formString(formData, "email").trim().toLowerCase();
  const password = formString(formData, "password");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: CREDENTIAL_ERRORS.email };
  }

  if (password.length < PASSWORD_MIN) {
    return { ok: false, error: CREDENTIAL_ERRORS.password };
  }

  return { ok: true, value: { email, password } };
}
