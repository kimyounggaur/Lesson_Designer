/**
 * 로그인 후 복귀 경로를 검증한다. 오픈 리다이렉트를 막기 위해
 * 같은 사이트의 절대 경로("/..." 형태)만 허용하고, 나머지는 fallback을 돌려준다.
 */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // "//evil.com" 또는 "/\evil.com" 같은 프로토콜 상대 URL 차단
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  if (trimmed.includes("://") || /[\r\n]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
