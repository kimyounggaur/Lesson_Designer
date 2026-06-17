import { describe, expect, it } from "vitest";
import { validateCredentials } from "../auth-validation";

describe("auth validation", () => {
  it("rejects invalid email addresses", () => {
    expect(validateCredentials("lesson-designer", "password1")).toBe("이메일 주소를 확인해주세요.");
  });

  it("rejects short passwords", () => {
    expect(validateCredentials("user@example.com", "12345")).toBe("비밀번호는 6자 이상이어야 합니다.");
  });

  it("accepts an email and password with enough length", () => {
    expect(validateCredentials("user@example.com", "123456")).toBeNull();
  });
});
