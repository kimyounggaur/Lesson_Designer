import { describe, expect, it } from "vitest";
import { canAccessAdminPage, canOpenApp, firstOpenableApp, normalizeRole, roleLabel } from "../access";
import type { LessonApp } from "../apps";

const publicApp: LessonApp = {
  id: "guitar-chord",
  name: "기타 코드 배우기",
  description: "기타 기본 코드와 손가락 위치를 확인하는 테스트 앱입니다.",
  icon: "/icons/guitar.png",
  url: "https://guitar-chord-viewer.vercel.app/",
  categories: ["instrument-education"],
  access: "public"
};

const lockedApp: LessonApp = {
  id: "kalimba",
  name: "칼림바",
  description: "회원 로그인 후 이용할 수 있는 테스트 앱입니다.",
  icon: "/icons/kalimba.png",
  url: "https://kalimba-play.vercel.app/",
  categories: ["instrument-education", "music-game"],
  access: "member"
};

describe("access rules", () => {
  it("allows guests to open public apps only", () => {
    expect(canOpenApp(publicApp, "guest")).toBe(true);
    expect(canOpenApp(lockedApp, "guest")).toBe(false);
  });

  it("allows members and admins to open every app", () => {
    expect(canOpenApp(lockedApp, "member")).toBe(true);
    expect(canOpenApp(lockedApp, "admin")).toBe(true);
  });

  it("restricts the admin page to admins", () => {
    expect(canAccessAdminPage("admin")).toBe(true);
    expect(canAccessAdminPage("member")).toBe(false);
    expect(canAccessAdminPage("guest")).toBe(false);
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
