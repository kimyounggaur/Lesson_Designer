export const APP_CATEGORIES = ["instrument-education", "music-game"] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type LessonApp = {
  id: string;
  category: AppCategory;
  name: string;
  icon: string;
  url: string;
  publicAccess: boolean;
};

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  "instrument-education": "악기 교육앱",
  "music-game": "음악 게임앱"
};

export const LESSON_APPS: LessonApp[] = [
  {
    id: "guitar-chord",
    category: "instrument-education",
    name: "기타 코드 배우기",
    icon: "/icons/guitar.png",
    url: "https://guitar-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "ukulele-chord",
    category: "instrument-education",
    name: "우쿨렐레 코드 배우기",
    icon: "/icons/ukulele.png",
    url: "https://ukulele-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "tongue-drum-edu",
    category: "instrument-education",
    name: "텅드럼 배우기",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-edu",
    category: "instrument-education",
    name: "칼림바 배우기",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "miniharp-edu",
    category: "instrument-education",
    name: "미니하프 배우기",
    icon: "/icons/miniharp.png",
    url: "https://miniharp-app.vercel.app/",
    publicAccess: false
  },
  {
    id: "saxophone-edu",
    category: "instrument-education",
    name: "색소폰 배우기",
    icon: "/icons/saxophone.png",
    url: "https://saxophone-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "ocarina-edu",
    category: "instrument-education",
    name: "오카리나 배우기",
    icon: "/icons/ocarina.png",
    url: "https://ocarina-master.vercel.app/",
    publicAccess: false
  },
  {
    id: "panflute-edu",
    category: "instrument-education",
    name: "팬플룻 배우기",
    icon: "/icons/panflute.png",
    url: "https://panflute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "violin-edu",
    category: "instrument-education",
    name: "바이올린 배우기",
    icon: "/icons/violin.png",
    url: "https://violin-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "cello-edu",
    category: "instrument-education",
    name: "첼로 배우기",
    icon: "/icons/cello.png",
    url: "https://cello-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "flute-edu",
    category: "instrument-education",
    name: "플루트 배우기",
    icon: "/icons/flute.png",
    url: "https://flute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "metronome",
    category: "instrument-education",
    name: "메트로놈",
    icon: "/icons/metronome.png",
    url: "https://metronome-app-flax.vercel.app/",
    publicAccess: false
  },
  {
    id: "nanta-game",
    category: "music-game",
    name: "난타 리듬 게임",
    icon: "/icons/nanta.png",
    url: "https://nanta-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "drum-game",
    category: "music-game",
    name: "드럼 리듬 게임",
    icon: "/icons/drum.png",
    url: "https://drum-beat-pi.vercel.app/",
    publicAccess: false
  },
  {
    id: "tongue-drum-game",
    category: "music-game",
    name: "텅드럼 리듬 게임",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-game",
    category: "music-game",
    name: "칼림바 연주 게임",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  }
];

export function getAppsByCategory(category: AppCategory) {
  return LESSON_APPS.filter((app) => app.category === category);
}

export function getCategoryLabel(category: AppCategory) {
  return CATEGORY_LABELS[category];
}

export function isAppCategory(value: string): value is AppCategory {
  return APP_CATEGORIES.includes(value as AppCategory);
}
