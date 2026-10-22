/** 사용자에게 보이는 문구 모음 (한국어). 컴포넌트에 문자열을 흩뿌리지 않기 위한 단일 출처. */
export const ko = {
  brand: "Lesson Designer",
  tagline: "악기 교육앱과 음악 게임앱을 한곳에서 고르고 여는 수업 허브",
  shell: {
    eyebrow: "LESSON DESIGNER",
    homeLink: "Lesson Designer 홈",
    greeting: {
      guest: "반가워요, 선생님",
      member: "반가워요, 선생님",
      admin: "반가워요, 관리자님"
    },
    login: "로그인",
    logout: "로그아웃",
    menu: "주 메뉴",
    nav: {
      home: "홈",
      instrument: "악기",
      game: "게임",
      admin: "관리"
    }
  },
  home: {
    lead: {
      guest: (lockedCount: number) => `로그인하면 회원용 앱 ${lockedCount}개가 더 열려요.`,
      member: "회원 계정으로 모든 앱을 열 수 있어요.",
      admin: "관리자 계정으로 모든 앱과 관리 화면을 쓸 수 있어요."
    },
    cta: {
      login: "로그인",
      signup: "회원가입",
      instrument: "악기 교육 보기",
      game: "음악 게임 보기"
    },
    categoryEyebrow: "카테고리",
    categoryTitle: "수업 방식에 맞춰 앱을 고르세요",
    quickStartTitle: "바로 시작",
    quickStartHint: {
      guest: "로그인 없이 바로 열 수 있는 앱이에요.",
      member: "지금 계정으로 바로 열 수 있는 앱이에요."
    },
    statsLabel: "앱 현황"
  },
  category: {
    back: "홈으로",
    statsLabel: "카테고리 현황",
    continueTitle: "이어 학습하기",
    continueHint: "추천",
    openNow: "바로 열기",
    accessLabel: "이용 권한 요약",
    totalApps: "전체 앱",
    currentState: "현재 상태",
    allApps: "전체 앱",
    lockedSuffix: "회원용",
    count: (n: number) => `${n}개`
  },
  catalog: {
    open: "열림",
    locked: "회원용",
    start: "시작",
    opensInNewTab: "(새 창에서 열림)",
    loginToOpen: "로그인하고 열기",
    empty: "표시할 앱이 없습니다.",
    categoryMeta: (total: number, publicCount: number, lockedCount: number) =>
      `앱 ${total}개 · 공개 ${publicCount}개 · 회원용 ${lockedCount}개`,
    loading: "앱 목록을 불러오는 중"
  },
  stats: {
    total: "전체 앱",
    public: "공개",
    locked: "회원용"
  },
  admin: {
    eyebrow: "관리자",
    title: "앱 접근 현황",
    description: (email: string) => `${email} 계정은 관리자 권한으로 모든 기능을 사용할 수 있습니다.`,
    byCategory: "카테고리별 현황",
    membersTitle: "회원 관리",
    membersBadge: "준비 중",
    membersBody:
      "회원 역할 변경 기능은 준비 중입니다. 지금은 Supabase 대시보드에서 profiles.role 값을 바꿔주세요.",
    deniedTitle: "관리자 전용 화면입니다",
    deniedBody: "회원 계정으로는 들어갈 수 없어요. 앱은 악기 교육·음악 게임 화면에서 바로 열 수 있습니다."
  },
  status: {
    loading: "불러오는 중",
    notFoundTitle: "찾을 수 없는 화면입니다",
    notFoundBody: "주소가 바뀌었거나 삭제된 화면이에요.",
    errorTitle: "문제가 생겼어요",
    errorBody: "잠시 후 다시 시도해주세요. 계속 반복되면 관리자에게 알려주세요.",
    retry: "다시 시도",
    home: "홈으로",
    errorCode: "오류 코드"
  },
  auth: {
    back: "홈",
    login: {
      title: "회원 로그인",
      description: "회원 계정으로 로그인하면 모든 앱을 바로 열 수 있습니다.",
      submit: "로그인",
      pending: "로그인 중",
      switchPrompt: "계정이 없나요?",
      switchLabel: "회원가입"
    },
    signup: {
      title: "회원가입",
      description: "가입하면 모든 악기 교육앱과 음악 게임앱을 이용할 수 있습니다.",
      submit: "회원가입",
      pending: "가입 처리 중",
      switchPrompt: "이미 계정이 있나요?",
      switchLabel: "로그인"
    },
    notices: {
      required: "이 앱은 회원 로그인 후 이용할 수 있습니다.",
      confirmed: "이메일 인증이 완료되었습니다. 로그인해주세요.",
      "confirm-failed": "인증 링크가 만료되었거나 올바르지 않습니다. 다시 가입하거나 로그인해주세요.",
      "logged-out": "로그아웃되었습니다."
    },
    signupSent: "입력한 주소로 안내 메일을 보냈습니다. 메일함을 확인해주세요.",
    notConfigured: "서버 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.",
    fields: {
      email: "이메일",
      password: "비밀번호",
      showPassword: "비밀번호 보기",
      hidePassword: "비밀번호 숨기기"
    }
  }
} as const;

export type AuthNoticeKey = keyof typeof ko.auth.notices;

export function authNotice(key: string | undefined | null): string | undefined {
  if (!key) {
    return undefined;
  }

  return (ko.auth.notices as Record<string, string>)[key];
}
