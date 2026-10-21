import { describe, expect, it } from "vitest";
import { canAccessAdminPage, canOpenApp, firstOpenableApp, normalizeRole, roleLabel } from "../access";
import type { LessonApp } from "../apps";

const publicApp: LessonApp = {
  id: "guitar-chord",
  category: "instrument-education",
  categoryLabel: "악기 교육",
  name: "기타 코드 배우기",
  description: "기타 기본 코드와 손가락 위치를 확인하는 테스트 앱입니다.",
  icon: "/icons/guitar.png",
  url: "https://guitar-chord-viewer.vercel.app/",
  publicAccess: true
};

const lockedApp: LessonApp = {
  id: "kalimba-play",
  category: "instrument-education",
  categoryLabel: "악기 교육",
  name: "칼림바 배우기",
  description: "회원 로그인 후 이용할 수 있는 테스트 앱입니다.",
  icon: "/icons/kalimba.png",
  url: "https://kalimba-play.vercel.app/",
  publicAccess: false
};

describe("access rules", () => {
  it("allows guests to open public apps", () => {
    expect(canOpenApp(publicApp, "guest")).toBe(true);
  });

  it("blocks guests from locked apps", () => {
    expect(canOpenApp(lockedApp, "guest")).toBe(false);
  });

  it("allows members to open all apps", () => {
    expect(canOpenApp(lockedApp, "member")).toBe(true);
  });

  it("allows admins to open all apps and admin page", () => {
    expect(canOpenApp(lockedApp, "admin")).toBe(true);
    expect(canAccessAdminPage("admin")).toBe(true);
  });

  it("blocks non-admins from admin page", () => {
    expect(canAccessAdminPage("guest")).toBe(false);
    expect(canAccessAdminPage("member")).toBe(false);
  });
});

describe("normalizeRole (fail-closed)", () => {
  it("returns guest for missing or unknown roles", () => {
    expect(normalizeRole(undefined)).toBe("guest");
    expect(normalizeRole(null)).toBe("guest");
    expect(normalizeRole("")).toBe("guest");
    expect(normalizeRole("superuser")).toBe("guest");
    expect(normalizeRole(42)).toBe("guest");
  });

  it("keeps known roles", () => {
    expect(normalizeRole("member")).toBe("member");
    expect(normalizeRole("admin")).toBe("admin");
  });
});

describe("firstOpenableApp", () => {
  it("returns null for guests when every app is locked", () => {
    expect(firstOpenableApp([lockedApp, lockedApp], "guest")).toBeNull();
  });

  it("skips locked apps for guests", () => {
    expect(firstOpenableApp([lockedApp, publicApp], "guest")).toBe(publicApp);
  });

  it("returns the first app for members", () => {
    expect(firstOpenableApp([lockedApp, publicApp], "member")).toBe(lockedApp);
  });

  it("returns null for an empty list", () => {
    expect(firstOpenableApp([], "admin")).toBeNull();
  });
});

describe("roleLabel", () => {
  it("returns Korean labels", () => {
    expect(roleLabel("guest")).toBe("게스트");
    expect(roleLabel("member")).toBe("회원");
    expect(roleLabel("admin")).toBe("관리자");
  });
});
