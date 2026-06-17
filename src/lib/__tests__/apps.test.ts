import { describe, expect, it } from "vitest";
import { APP_CATEGORIES, getAppsByCategory, getCategoryLabel } from "../apps";

describe("app catalog", () => {
  it("defines both major categories", () => {
    expect(APP_CATEGORIES).toEqual(["instrument-education", "music-game"]);
  });

  it("keeps guitar and ukulele public in instrument education", () => {
    const apps = getAppsByCategory("instrument-education");

    expect(apps.find((app) => app.id === "guitar-chord")?.publicAccess).toBe(true);
    expect(apps.find((app) => app.id === "ukulele-chord")?.publicAccess).toBe(true);
  });

  it("returns Korean category labels", () => {
    expect(getCategoryLabel("instrument-education")).toBe("악기 교육앱");
    expect(getCategoryLabel("music-game")).toBe("음악 게임앱");
  });
});
