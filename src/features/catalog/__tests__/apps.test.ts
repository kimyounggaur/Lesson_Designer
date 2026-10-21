import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { APP_CATEGORIES, CATEGORY_META, getCategoryMeta, isAppCategory } from "../categories";
import { getApp, getAppsByCategory, LESSON_APPS } from "../apps";
import { getCatalogStats, getCategoryStats } from "../stats";

describe("catalog integrity", () => {
  it("defines both major categories with Korean labels", () => {
    expect(APP_CATEGORIES).toEqual(["instrument-education", "music-game"]);
    expect(CATEGORY_META["instrument-education"].label).toBe("악기 교육앱");
    expect(CATEGORY_META["music-game"].label).toBe("음악 게임앱");
    expect(getCategoryMeta("music-game").tone).toBe("play");
    expect(isAppCategory("music-game")).toBe(true);
    expect(isAppCategory("nope")).toBe(false);
  });

  it("has 14 apps after merging duplicates (D3), 2 of them public", () => {
    expect(LESSON_APPS).toHaveLength(14);
    expect(LESSON_APPS.filter((app) => app.access === "public").map((app) => app.id)).toEqual([
      "guitar-chord",
      "ukulele-chord"
    ]);
  });

  it("uses unique, url-safe ids", () => {
    const ids = LESSON_APPS.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });

  it("does not register the same deployment twice", () => {
    const urls = LESSON_APPS.map((app) => app.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("points every app at an https deployment with a trailing slash", () => {
    LESSON_APPS.forEach((app) => {
      expect(app.url).toMatch(/^https:\/\/[^/]+\/$/);
    });
  });

  it("ships an icon file for every app", () => {
    LESSON_APPS.forEach((app) => {
      expect(app.icon).toMatch(/^\/icons\/[a-z0-9-]+\.(png|webp)$/);
      expect(existsSync(path.join(process.cwd(), "public", app.icon)), `${app.icon} missing`).toBe(true);
    });
  });

  it("gives every app at least one known category and a useful description", () => {
    LESSON_APPS.forEach((app) => {
      expect(app.categories.length).toBeGreaterThan(0);
      app.categories.forEach((category) => expect(APP_CATEGORIES).toContain(category));
      expect(app.description.length).toBeGreaterThanOrEqual(12);
    });
  });

  it("lists multi-category apps under each of their categories", () => {
    const edu = getAppsByCategory("instrument-education").map((app) => app.id);
    const game = getAppsByCategory("music-game").map((app) => app.id);
    expect(edu).toContain("kalimba");
    expect(game).toContain("kalimba");
    expect(edu).toContain("guitar-chord");
    expect(game).not.toContain("guitar-chord");
  });

  it("looks apps up by id", () => {
    expect(getApp("kalimba")?.name).toBe("칼림바");
    expect(getApp("missing")).toBeNull();
  });

  it("computes category and catalog stats", () => {
    expect(getCategoryStats("instrument-education")).toEqual({ total: 12, publicCount: 2, lockedCount: 10 });
    expect(getCategoryStats("music-game")).toEqual({ total: 4, publicCount: 0, lockedCount: 4 });
    expect(getCatalogStats()).toEqual({ total: 14, publicCount: 2, lockedCount: 12 });
  });
});
