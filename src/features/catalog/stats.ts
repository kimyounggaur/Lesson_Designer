import { getAppsByCategory, LESSON_APPS, type LessonApp } from "./apps";
import type { AppCategory } from "./categories";

export type CatalogStats = {
  total: number;
  publicCount: number;
  lockedCount: number;
};

function summarize(apps: readonly LessonApp[]): CatalogStats {
  const publicCount = apps.filter((app) => app.access === "public").length;
  return { total: apps.length, publicCount, lockedCount: apps.length - publicCount };
}

export function getCategoryStats(category: AppCategory): CatalogStats {
  return summarize(getAppsByCategory(category));
}

/** 중복 카테고리 앱을 한 번만 세는 전체 통계. */
export function getCatalogStats(): CatalogStats {
  return summarize(LESSON_APPS);
}
