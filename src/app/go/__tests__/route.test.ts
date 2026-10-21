import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUserProfile } from "@/features/auth/types";

const getCurrentUserProfile = vi.fn<() => Promise<CurrentUserProfile | null>>();

vi.mock("@/features/auth/service", () => ({
  getCurrentUserProfile: () => getCurrentUserProfile()
}));

const { GET } = await import("../[appId]/route");

function call(appId: string) {
  const request = new NextRequest(`http://localhost:3000/go/${appId}`);
  return GET(request, { params: Promise.resolve({ appId }) });
}

function profile(role: CurrentUserProfile["role"]): CurrentUserProfile {
  return { id: "user-1", email: "user@example.com", role };
}

describe("GET /go/[appId]", () => {
  beforeEach(() => {
    getCurrentUserProfile.mockReset();
    getCurrentUserProfile.mockResolvedValue(null);
  });

  it("returns 404 for unknown app ids", async () => {
    const response = await call("nope");
    expect(response.status).toBe(404);
  });

  it("is case sensitive about ids", async () => {
    const response = await call("Kalimba");
    expect(response.status).toBe(404);
  });

  it("redirects guests to public apps with no-store caching", async () => {
    const response = await call("guitar-chord");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://guitar-chord-viewer.vercel.app/");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("sends guests to login with a safe next target for member apps", async () => {
    const response = await call("kalimba");
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") ?? "", "http://localhost:3000");
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/go/kalimba");
    expect(location.searchParams.get("notice")).toBe("required");
  });

  it("treats a profile lookup that returns null as guest", async () => {
    getCurrentUserProfile.mockResolvedValue(null);
    const response = await call("nanta");
    expect(new URL(response.headers.get("location") ?? "", "http://localhost:3000").pathname).toBe("/login");
  });

  it("redirects members to member apps", async () => {
    getCurrentUserProfile.mockResolvedValue(profile("member"));
    const response = await call("kalimba");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://kalimba-play.vercel.app/");
  });

  it("redirects admins to member apps", async () => {
    getCurrentUserProfile.mockResolvedValue(profile("admin"));
    const response = await call("nanta");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://nanta-play.vercel.app/");
  });

  it("keeps a logged-in guest-role profile locked out (fail-closed)", async () => {
    getCurrentUserProfile.mockResolvedValue(profile("guest"));
    const response = await call("kalimba");
    expect(new URL(response.headers.get("location") ?? "", "http://localhost:3000").pathname).toBe("/login");
  });
});
