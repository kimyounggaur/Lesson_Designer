import { describe, expect, it } from "vitest";
import { FALLBACK_AUTH_MESSAGE, toUserMessage } from "../auth-errors";

describe("toUserMessage", () => {
  it("maps known supabase auth error codes to Korean messages", () => {
    expect(toUserMessage({ code: "invalid_credentials" })).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
    expect(toUserMessage({ code: "email_not_confirmed" })).toContain("이메일 인증");
  });

  it("falls back for unknown codes without leaking the raw message", () => {
    expect(toUserMessage({ code: "some_new_code" })).toBe(FALLBACK_AUTH_MESSAGE);
  });

  it("falls back when there is no error or no code", () => {
    expect(toUserMessage(null)).toBe(FALLBACK_AUTH_MESSAGE);
    expect(toUserMessage(undefined)).toBe(FALLBACK_AUTH_MESSAGE);
    expect(toUserMessage({ code: null })).toBe(FALLBACK_AUTH_MESSAGE);
  });

  it("accepts a custom fallback", () => {
    expect(toUserMessage({ code: "nope" }, "다시 시도해주세요.")).toBe("다시 시도해주세요.");
  });
});
