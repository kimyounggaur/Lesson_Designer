import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicEnv } from "@/lib/env";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  createClient: vi.fn(),
  getPublicEnv: vi.fn<() => PublicEnv>()
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ getPublicEnv: mocks.getPublicEnv }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

const { getCurrentUserProfile } = await import("../service");

const CONFIGURED: PublicEnv = {
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
  siteUrl: "http://localhost:3000",
  isConfigured: true
};

const user = { id: "user-1", email: "teacher@example.com" };

let consoleError: ReturnType<typeof vi.spyOn>;
let consoleWarn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPublicEnv.mockReturnValue(CONFIGURED);
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
  mocks.getUser.mockResolvedValue({ data: { user } });
  mocks.maybeSingle.mockResolvedValue({
    data: { id: user.id, email: user.email, role: "member" },
    error: null
  });
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
  consoleWarn.mockRestore();
});

describe("getCurrentUserProfile", () => {
  it("is a guest (null) when supabase is not configured", async () => {
    mocks.getPublicEnv.mockReturnValue({ ...CONFIGURED, supabaseUrl: "", isConfigured: false });

    await expect(getCurrentUserProfile()).resolves.toBeNull();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("is a guest (null) when there is no signed-in user and skips the profile query", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    await expect(getCurrentUserProfile()).resolves.toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("reads the caller's own profiles row by id", async () => {
    const profile = await getCurrentUserProfile();

    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.select).toHaveBeenCalledWith("id,email,role");
    expect(mocks.eq).toHaveBeenCalledWith("id", user.id);
    expect(profile).toEqual({ id: user.id, email: user.email, role: "member" });
  });

  it("recognises admins", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: user.id, email: null, role: "admin" }, error: null });

    const profile = await getCurrentUserProfile();

    expect(profile?.role).toBe("admin");
    expect(profile?.email, "falls back to the auth email when the row has none").toBe(user.email);
  });

  it("downgrades unknown role strings to guest (fail-closed)", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { id: user.id, email: user.email, role: "owner" },
      error: null
    });

    await expect(getCurrentUserProfile()).resolves.toMatchObject({ role: "guest" });
  });

  it("treats a failed profile lookup as guest and logs the raw error server-side only", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "permission denied for table profiles" }
    });

    const profile = await getCurrentUserProfile();

    expect(profile).toEqual({ id: user.id, email: user.email, role: "guest" });
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(consoleError.mock.calls[0])).toContain("permission denied");
  });

  it("treats a missing profiles row as guest and warns about the trigger", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const profile = await getCurrentUserProfile();

    expect(profile).toEqual({ id: user.id, email: user.email, role: "guest" });
    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
