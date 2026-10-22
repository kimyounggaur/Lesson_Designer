import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUserProfile } from "@/features/auth/types";
import { LESSON_APPS } from "@/features/catalog";

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
    for (const appId of ["Kalimba", "KALIMBA", "Guitar-Chord"]) {
      const response = await call(appId);
      expect(response.status, appId).toBe(404);
    }
  });

  it("does not trim whitespace around ids", async () => {
    for (const appId of ["kalimba ", " kalimba", "kalimba\t", "guitar-chord "]) {
      const response = await call(appId);
      expect(response.status, JSON.stringify(appId)).toBe(404);
    }
  });

  it("answers unknown ids without a profile lookup and without leaking any deployment url", async () => {
    const response = await call("nope");
    expect(getCurrentUserProfile).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBeNull();
    expect(JSON.stringify(await response.json())).not.toContain("vercel.app");
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

  it("encodes the next path exactly as the login page expects and never caches the login redirect", async () => {
    const response = await call("kalimba");
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fgo%2Fkalimba&notice=required"
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("locks guests out of every member app in the catalog", async () => {
    for (const app of LESSON_APPS.filter((entry) => entry.access === "member")) {
      const response = await call(app.id);
      const location = response.headers.get("location") ?? "";
      expect(response.status, app.id).toBe(302);
      expect(location, app.id).toContain(`/login?next=${encodeURIComponent(`/go/${app.id}`)}`);
      expect(location, app.id).not.toContain("vercel.app");
    }
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

  it("sends members to the exact deployment url of every app with no-store caching", async () => {
    getCurrentUserProfile.mockResolvedValue(profile("member"));
    for (const app of LESSON_APPS) {
      const response = await call(app.id);
      expect(response.status, app.id).toBe(302);
      expect(response.headers.get("location"), app.id).toBe(app.url);
      expect(response.headers.get("cache-control"), app.id).toBe("no-store");
    }
  });

  it("keeps a logged-in guest-role profile locked out (fail-closed)", async () => {
    getCurrentUserProfile.mockResolvedValue(profile("guest"));
    const response = await call("kalimba");
    expect(new URL(response.headers.get("location") ?? "", "http://localhost:3000").pathname).toBe("/login");
  });
});
