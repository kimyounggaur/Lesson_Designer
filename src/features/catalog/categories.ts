export const APP_CATEGORIES = ["instrument-education", "music-game"] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type CategoryTone = "edu" | "play";

export type CategoryMeta = {
  label: string;
  shortLabel: string;
  tone: CategoryTone;
  description: string;
  preview: string;
};

export const CATEGORY_META = {
  "instrument-education": {
    label: "악기 교육앱",
    shortLabel: "악기 교육",
    tone: "edu",
    description: "코드, 운지, 음계를 단계별로 익히는 학습 앱",
    preview: "기타 코드 · 우쿨렐레 코드 · 칼림바 · 색소폰"
  },
  "music-game": {
    label: "음악 게임앱",
    shortLabel: "음악 게임",
    tone: "play",
    description: "리듬과 연주 감각을 키우는 게임형 앱",
    preview: "난타 · 드럼 비트 · 텅드럼 · 칼림바"
  }
} as const satisfies Record<AppCategory, CategoryMeta>;

export function isAppCategory(value: string): value is AppCategory {
  return (APP_CATEGORIES as readonly string[]).includes(value);
}

export function getCategoryMeta(category: AppCategory): CategoryMeta {
  return CATEGORY_META[category];
}
