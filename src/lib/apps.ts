export const APP_CATEGORIES = ["instrument-education", "music-game"] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type CategoryTone = "edu" | "play";

export type LessonApp = {
  id: string;
  category: AppCategory;
  categoryLabel: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  publicAccess: boolean;
};

export const CATEGORY_META: Record<
  AppCategory,
  {
    label: string;
    shortLabel: string;
    description: string;
    tone: CategoryTone;
    preview: string;
  }
> = {
  "instrument-education": {
    label: "악기 교육앱",
    shortLabel: "악기 교육",
    description: "코드, 운지, 음계, 연주 루틴을 단계적으로 익히는 수업형 웹앱 모음입니다.",
    tone: "edu",
    preview: "기타 코드 · 우쿨렐레 코드 · 칼림바 · 색소폰"
  },
  "music-game": {
    label: "음악 게임앱",
    shortLabel: "음악 게임",
    description: "리듬과 반응, 소리 탐색을 게임처럼 경험하는 활동형 웹앱 모음입니다.",
    tone: "play",
    preview: "난타 · 드럼 비트 · 텅드럼 · 칼림바"
  }
};

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  "instrument-education": CATEGORY_META["instrument-education"].label,
  "music-game": CATEGORY_META["music-game"].label
};

export const LESSON_APPS: LessonApp[] = [
  {
    id: "guitar-chord",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "기타 코드 배우기",
    description: "기타 기본 코드와 손가락 위치를 빠르게 확인하며 연습합니다.",
    icon: "/icons/guitar.png",
    url: "https://guitar-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "ukulele-chord",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "우쿨렐레 코드 배우기",
    description: "우쿨렐레 코드 운지와 코드 전환을 가볍게 익힙니다.",
    icon: "/icons/ukulele.png",
    url: "https://ukulele-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "tongue-drum-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "텅드럼 배우기",
    description: "번호 악보와 음계를 보며 텅드럼 연주 흐름을 배웁니다.",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "칼림바 배우기",
    description: "칼림바 음계, 탭 위치, 간단한 멜로디 연습을 이어갑니다.",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "miniharp-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "미니하프 배우기",
    description: "줄 배열과 계이름을 확인하며 미니하프 기초를 익힙니다.",
    icon: "/icons/miniharp.png",
    url: "https://miniharp-app.vercel.app/",
    publicAccess: false
  },
  {
    id: "saxophone-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "색소폰 배우기",
    description: "색소폰 운지와 음역을 단계별로 확인하는 학습 앱입니다.",
    icon: "/icons/saxophone.png",
    url: "https://saxophone-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "ocarina-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "오카리나 배우기",
    description: "오카리나 구멍 위치와 계이름을 보며 연주를 연습합니다.",
    icon: "/icons/ocarina.png",
    url: "https://ocarina-master.vercel.app/",
    publicAccess: false
  },
  {
    id: "panflute-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "팬플룻 배우기",
    description: "팬플룻 관 배열과 음높이를 시각적으로 익히는 앱입니다.",
    icon: "/icons/panflute.png",
    url: "https://panflute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "violin-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "바이올린 배우기",
    description: "바이올린 줄, 포지션, 음정을 기초부터 확인합니다.",
    icon: "/icons/violin.png",
    url: "https://violin-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "cello-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "첼로 배우기",
    description: "첼로 줄 이름과 포지션 감각을 차분하게 연습합니다.",
    icon: "/icons/cello.png",
    url: "https://cello-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "flute-edu",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "플루트 배우기",
    description: "플루트 운지와 음계를 한눈에 확인하며 연습합니다.",
    icon: "/icons/flute.png",
    url: "https://flute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "metronome",
    category: "instrument-education",
    categoryLabel: "악기 교육",
    name: "메트로놈",
    description: "박자와 템포를 맞추며 연주 루틴을 안정적으로 잡습니다.",
    icon: "/icons/metronome.png",
    url: "https://metronome-app-flax.vercel.app/",
    publicAccess: false
  },
  {
    id: "nanta-game",
    category: "music-game",
    categoryLabel: "음악 게임",
    name: "난타 리듬 게임",
    description: "리듬 패턴을 따라 치며 박자 감각과 반응 속도를 키웁니다.",
    icon: "/icons/nanta.png",
    url: "https://nanta-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "drum-game",
    category: "music-game",
    categoryLabel: "음악 게임",
    name: "드럼 리듬 게임",
    description: "드럼 비트를 게임처럼 누르며 그루브를 체험합니다.",
    icon: "/icons/drum.png",
    url: "https://drum-beat-pi.vercel.app/",
    publicAccess: false
  },
  {
    id: "tongue-drum-game",
    category: "music-game",
    categoryLabel: "음악 게임",
    name: "텅드럼 리듬 게임",
    description: "텅드럼 소리를 직접 눌러보며 멜로디 놀이를 즐깁니다.",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-game",
    category: "music-game",
    categoryLabel: "음악 게임",
    name: "칼림바 연주 게임",
    description: "칼림바 음색을 터치하며 간단한 패턴을 만들어 봅니다.",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  }
];

export function getAppsByCategory(category: AppCategory) {
  return LESSON_APPS.filter((app) => app.category === category);
}

export function getCategoryMeta(category: AppCategory) {
  return CATEGORY_META[category];
}

export function getCategoryStats(category: AppCategory) {
  const apps = getAppsByCategory(category);

  return {
    total: apps.length,
    publicCount: apps.filter((app) => app.publicAccess).length,
    lockedCount: apps.filter((app) => !app.publicAccess).length
  };
}

export function getCategoryLabel(category: AppCategory) {
  return CATEGORY_LABELS[category];
}

export function isAppCategory(value: string): value is AppCategory {
  return APP_CATEGORIES.includes(value as AppCategory);
}
