/** 사용자에게 보이는 문구 모음 (한국어). 컴포넌트에 문자열을 흩뿌리지 않기 위한 단일 출처. */
export const ko = {
  auth: {
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
    },
    backHome: "홈으로 돌아가기"
  }
} as const;

export type AuthNoticeKey = keyof typeof ko.auth.notices;

export function authNotice(key: string | undefined | null): string | undefined {
  if (!key) {
    return undefined;
  }

  return (ko.auth.notices as Record<string, string>)[key];
}
