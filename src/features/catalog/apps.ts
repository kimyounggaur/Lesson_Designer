import type { AppCategory } from "./categories";

/** public: 누구나 열 수 있음 · member: 로그인(회원/관리자) 필요 */
export type AccessTier = "public" | "member";

export type LessonApp = {
  id: string;
  name: string;
  description: string;
  /** /icons/<id>.webp — scripts/optimize-icons.mjs 가 design/icons-src/<id>.* 에서 생성 (png 폴백도 함께 생성) */
  icon: string;
  /** 외부 배포 URL. UI에 직접 렌더하지 않고 /go/[appId] 를 경유한다 (CLAUDE.md 규칙 2). */
  url: string;
  /** 복수 카테고리 허용 — 같은 앱이 교육·게임 양쪽에 보일 수 있다 (D3). */
  categories: readonly AppCategory[];
  access: AccessTier;
};

export const LESSON_APPS: readonly LessonApp[] = [
  {
    id: "guitar-chord",
    name: "기타 코드 배우기",
    description: "기타 기본 코드와 손가락 위치를 빠르게 확인하며 연습합니다.",
    icon: "/icons/guitar-chord.webp",
    url: "https://guitar-chord-viewer.vercel.app/",
    categories: ["instrument-education"],
    access: "public"
  },
  {
    id: "ukulele-chord",
    name: "우쿨렐레 코드 배우기",
    description: "우쿨렐레 코드 운지와 코드 전환을 가볍게 익힙니다.",
    icon: "/icons/ukulele-chord.webp",
    url: "https://ukulele-chord-viewer.vercel.app/",
    categories: ["instrument-education"],
    access: "public"
  },
  {
    id: "tongue-drum",
    name: "텅드럼",
    description: "번호 악보와 음계를 보며 배우고, 소리를 직접 눌러 멜로디 놀이도 즐깁니다.",
    icon: "/icons/tongue-drum.webp",
    url: "https://tonguedrum-play.vercel.app/",
    categories: ["instrument-education", "music-game"],
    access: "member"
  },
  {
    id: "kalimba",
    name: "칼림바",
    description: "음계와 탭 위치로 멜로디를 연습하고, 음색을 터치하며 패턴을 만들어 봅니다.",
    icon: "/icons/kalimba.webp",
    url: "https://kalimba-play.vercel.app/",
    categories: ["instrument-education", "music-game"],
    access: "member"
  },
  {
    id: "miniharp",
    name: "미니하프 배우기",
    description: "줄 배열과 계이름을 확인하며 미니하프 기초를 익힙니다.",
    icon: "/icons/miniharp.webp",
    url: "https://miniharp-app.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "saxophone",
    name: "색소폰 배우기",
    description: "색소폰 운지와 음역을 단계별로 확인하는 학습 앱입니다.",
    icon: "/icons/saxophone.webp",
    url: "https://saxophone-edu.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "ocarina",
    name: "오카리나 배우기",
    description: "오카리나 구멍 위치와 계이름을 보며 연주를 연습합니다.",
    icon: "/icons/ocarina.webp",
    url: "https://ocarina-master.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "panflute",
    name: "팬플룻 배우기",
    description: "팬플룻 관 배열과 음높이를 시각적으로 익히는 앱입니다.",
    icon: "/icons/panflute.webp",
    url: "https://panflute-edu.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "violin",
    name: "바이올린 배우기",
    description: "바이올린 줄, 포지션, 음정을 기초부터 확인합니다.",
    icon: "/icons/violin.webp",
    url: "https://violin-edu.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "cello",
    name: "첼로 배우기",
    description: "첼로 줄 이름과 포지션 감각을 차분하게 연습합니다.",
    icon: "/icons/cello.webp",
    url: "https://cello-edu.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "flute",
    name: "플루트 배우기",
    description: "플루트 운지와 음계를 한눈에 확인하며 연습합니다.",
    icon: "/icons/flute.webp",
    url: "https://flute-edu.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "metronome",
    name: "메트로놈",
    description: "박자와 템포를 맞추며 연주 루틴을 안정적으로 잡습니다.",
    icon: "/icons/metronome.webp",
    url: "https://metronome-app-flax.vercel.app/",
    categories: ["instrument-education"],
    access: "member"
  },
  {
    id: "nanta",
    name: "난타 리듬 게임",
    description: "리듬 패턴을 따라 치며 박자 감각과 반응 속도를 키웁니다.",
    icon: "/icons/nanta.webp",
    url: "https://nanta-play.vercel.app/",
    categories: ["music-game"],
    access: "member"
  },
  {
    id: "drum",
    name: "드럼 리듬 게임",
    description: "드럼 비트를 게임처럼 누르며 그루브를 체험합니다.",
    icon: "/icons/drum.webp",
    url: "https://drum-beat-pi.vercel.app/",
    categories: ["music-game"],
    access: "member"
  }
];

export function getApp(id: string): LessonApp | null {
  return LESSON_APPS.find((app) => app.id === id) ?? null;
}

export function getAppsByCategory(category: AppCategory): LessonApp[] {
  return LESSON_APPS.filter((app) => app.categories.includes(category));
}
