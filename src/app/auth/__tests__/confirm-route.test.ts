import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  createClient: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

const { GET } = await import("../confirm/route");

const ORIGIN = "http://localhost:3000";

function call(query: Record<string, string>) {
  const url = new URL("/auth/confirm", ORIGIN);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  return GET(new NextRequest(url));
}

function locationOf(response: Response) {
  return new URL(response.headers.get("location") ?? "", ORIGIN);
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { verifyOtp: mocks.verifyOtp } });
  mocks.verifyOtp.mockResolvedValue({ data: { session: { access_token: "jwt" } }, error: null });
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

describe("GET /auth/confirm", () => {
  it("redirects to the login notice when the token or type is missing", async () => {
    const response = await call({});

    expect(response.status).toBe(303);
    const location = locationOf(response);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("notice")).toBe("confirm-failed");
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("rejects unknown otp types without calling supabase", async () => {
    const response = await call({ token_hash: "abc", type: "bogus" });

    expect(response.status).toBe(303);
    expect(locationOf(response).searchParams.get("notice")).toBe("confirm-failed");
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("verifies the token and sends a signed-in user to the safe next path", async () => {
    const response = await call({ token_hash: "abc", type: "email", next: "/go/kalimba" });

    expect(mocks.verifyOtp).toHaveBeenCalledWith({ type: "email", token_hash: "abc" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/go/kalimba`);
  });

  it("sends a verified user without a session to the login screen with a confirmed notice", async () => {
    mocks.verifyOtp.mockResolvedValue({ data: { session: null }, error: null });

    const response = await call({ token_hash: "abc", type: "signup", next: "/go/kalimba" });

    expect(response.status).toBe(303);
    const location = locationOf(response);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("notice")).toBe("confirmed");
  });

  it("never redirects to another origin after confirmation", async () => {
    const response = await call({ token_hash: "abc", type: "email", next: "https://evil.com" });

    expect(response.headers.get("location")).toBe(`${ORIGIN}/`);
  });

  it("reports verification errors as a confirm-failed notice and logs the raw error server-side", async () => {
    mocks.verifyOtp.mockResolvedValue({
      data: { session: null },
      error: { code: "otp_expired", message: "Token has expired or is invalid" }
    });

    const response = await call({ token_hash: "abc", type: "email", next: "/go/kalimba" });

    expect(response.status).toBe(303);
    const location = locationOf(response);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("notice")).toBe("confirm-failed");
    expect(location.toString()).not.toContain("expired");
    expect(consoleError).toHaveBeenCalledWith(
      "[auth:confirm]",
      "otp_expired",
      "Token has expired or is invalid"
    );
  });
});
