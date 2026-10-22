import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ko } from "@/content/ko";
import { FALLBACK_AUTH_MESSAGE } from "@/features/auth/errors";
import type { AuthState } from "@/features/auth/types";
import { CREDENTIAL_ERRORS } from "@/features/auth/validation";
import type { PublicEnv } from "@/lib/env";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  createClient: vi.fn(),
  getPublicEnv: vi.fn<() => PublicEnv>(),
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  })
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/env", () => ({ getPublicEnv: mocks.getPublicEnv }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const { loginAction, logoutAction, signUpAction } = await import("../actions");

const CONFIGURED: PublicEnv = {
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
  siteUrl: "https://lesson-designer.example",
  isConfigured: true
};

const NOT_CONFIGURED: PublicEnv = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  siteUrl: "http://localhost:3000",
  isConfigured: false
};

const idle: AuthState = { message: "", tone: "idle" };

function form(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

const valid = { email: "teacher@example.com", password: "secret1" };

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPublicEnv.mockReturnValue(CONFIGURED);
  mocks.createClient.mockResolvedValue({
    auth: { signInWithPassword: mocks.signInWithPassword, signUp: mocks.signUp, signOut: mocks.signOut }
  });
  mocks.signInWithPassword.mockResolvedValue({ error: null });
  mocks.signUp.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

describe("loginAction", () => {
  it("rejects a malformed email before touching supabase", async () => {
    const state = await loginAction(idle, form({ email: "not-an-email", password: "secret1" }));

    expect(state).toEqual({ message: CREDENTIAL_ERRORS.email, tone: "error" });
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects a short password before touching supabase", async () => {
    const state = await loginAction(idle, form({ email: valid.email, password: "123" }));

    expect(state).toEqual({ message: CREDENTIAL_ERRORS.password, tone: "error" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("maps supabase error codes to Korean copy and keeps the raw message out of the UI state", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { code: "invalid_credentials", message: "Invalid login credentials" }
    });

    const state = await loginAction(idle, form(valid));

    expect(state).toEqual({ message: "이메일 또는 비밀번호가 올바르지 않습니다.", tone: "error" });
    expect(state.message).not.toContain("Invalid login credentials");
    expect(consoleError).toHaveBeenCalledWith(
      "[auth:login]",
      "invalid_credentials",
      "Invalid login credentials"
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("falls back to a generic Korean message for unknown error codes", async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { code: "something_new", message: "boom" } });

    const state = await loginAction(idle, form(valid));

    expect(state).toEqual({ message: FALLBACK_AUTH_MESSAGE, tone: "error" });
  });

  it("signs in with the normalized credentials and redirects to the safe next path", async () => {
    await expect(
      loginAction(idle, form({ email: "  Teacher@Example.COM ", password: "secret1", next: "/go/kalimba" }))
    ).rejects.toThrow("REDIRECT:/go/kalimba");

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "teacher@example.com",
      password: "secret1"
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/go/kalimba");
  });

  it("falls back to the home page when next is missing", async () => {
    await expect(loginAction(idle, form(valid))).rejects.toThrow("REDIRECT:/");
  });

  it("blocks open redirects to other origins", async () => {
    for (const next of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)"]) {
      mocks.redirect.mockClear();
      await expect(loginAction(idle, form({ ...valid, next }))).rejects.toThrow("REDIRECT:/");
      expect(mocks.redirect).toHaveBeenCalledWith("/");
    }
  });

  it("explains the missing server configuration instead of calling supabase", async () => {
    mocks.getPublicEnv.mockReturnValue(NOT_CONFIGURED);

    const state = await loginAction(idle, form(valid));

    expect(state).toEqual({ message: ko.auth.notConfigured, tone: "error" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});

describe("signUpAction", () => {
  it("sends the confirmation link to /auth/confirm on the configured site url with the next path", async () => {
    const state = await signUpAction(idle, form({ ...valid, next: "/go/kalimba" }));

    expect(state).toEqual({ message: ko.auth.signupSent, tone: "success" });
    expect(mocks.signUp).toHaveBeenCalledTimes(1);

    const [payload] = mocks.signUp.mock.calls[0] as [
      { email: string; password: string; options: { emailRedirectTo: string } }
    ];
    expect(payload.email).toBe(valid.email);
    expect(payload.password).toBe(valid.password);

    const redirectTo = new URL(payload.options.emailRedirectTo);
    expect(`${redirectTo.origin}${redirectTo.pathname}`).toBe("https://lesson-designer.example/auth/confirm");
    expect(redirectTo.searchParams.get("next")).toBe("/go/kalimba");
    expect(payload.options.emailRedirectTo).toBe(
      "https://lesson-designer.example/auth/confirm?next=%2Fgo%2Fkalimba"
    );
  });

  it("sanitizes an open-redirect next before embedding it in the confirmation link", async () => {
    await signUpAction(idle, form({ ...valid, next: "https://evil.com" }));

    const [payload] = mocks.signUp.mock.calls[0] as [{ options: { emailRedirectTo: string } }];
    expect(new URL(payload.options.emailRedirectTo).searchParams.get("next")).toBe("/");
  });

  it("shows the same success copy when the email is already registered (no account enumeration)", async () => {
    mocks.signUp.mockResolvedValue({
      error: { code: "user_already_exists", message: "User already registered" }
    });

    const state = await signUpAction(idle, form(valid));

    expect(state).toEqual({ message: ko.auth.signupSent, tone: "success" });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("maps other supabase errors to Korean copy", async () => {
    mocks.signUp.mockResolvedValue({
      error: { code: "weak_password", message: "Password should be at least 6 characters" }
    });

    const state = await signUpAction(idle, form(valid));

    expect(state.tone).toBe("error");
    expect(state.message).toBe("비밀번호가 너무 단순합니다. 6자 이상, 문자와 숫자를 섞어주세요.");
    expect(state.message).not.toContain("Password should");
    expect(consoleError).toHaveBeenCalledWith(
      "[auth:signup]",
      "weak_password",
      "Password should be at least 6 characters"
    );
  });

  it("validates the form before calling supabase", async () => {
    const state = await signUpAction(idle, form({ email: "nope", password: "secret1" }));

    expect(state).toEqual({ message: CREDENTIAL_ERRORS.email, tone: "error" });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("explains the missing server configuration instead of calling supabase", async () => {
    mocks.getPublicEnv.mockReturnValue(NOT_CONFIGURED);

    const state = await signUpAction(idle, form(valid));

    expect(state).toEqual({ message: ko.auth.notConfigured, tone: "error" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});

describe("logoutAction", () => {
  it("signs out and then redirects to the home page", async () => {
    await expect(logoutAction()).rejects.toThrow("REDIRECT:/");

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith("/");
    expect(mocks.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.redirect.mock.invocationCallOrder[0]
    );
  });

  it("still redirects home when supabase is not configured", async () => {
    mocks.getPublicEnv.mockReturnValue(NOT_CONFIGURED);

    await expect(logoutAction()).rejects.toThrow("REDIRECT:/");

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
