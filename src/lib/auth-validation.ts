export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateCredentials(email: string, password: string): string | null {
  if (!email.includes("@")) {
    return "이메일 주소를 확인해주세요.";
  }

  if (password.length < 6) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }

  return null;
}
