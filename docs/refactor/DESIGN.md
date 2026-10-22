# Lesson Designer 모바일 웹앱 리팩토링 설계문서

| 항목 | 내용 |
|---|---|
| 대상 저장소 | https://github.com/kimyounggaur/Lesson_Designer |
| 분석 기준 커밋 | `2374a98` (2026-06-23, "Apply mobile app redesign") — 총 8개 커밋 |
| 분석 방법 | 전체 소스 정독(33개 파일), CSS 사용률 스크립트 분석, package-lock 버전 대조, 커밋 히스토리 대조, Next.js 16 / Supabase SSR 최신 가이드 확인 |
| 문서 작성일 | 2026-10-21 |
| 문서 목적 | 현재 코드의 문제점을 근거(파일:라인)와 함께 정리하고, 이를 해소하는 리팩토링을 **단계별로 실행 가능한 수준**(파일 단위 변경, 코드, 검증 명령, 완료 기준)으로 설계 |

> 이 문서는 사람이 읽는 설계서이자, Claude Code 등 에이전트에게 Phase 단위로 그대로 넘겨 실행시킬 수 있도록 작성되었습니다. 각 Step은 "변경 파일 → 코드 → 검증 → 완료 기준" 구조를 따릅니다.

---

## 목차

1. [요약 (Executive Summary)](#1-요약-executive-summary)
2. [현재 상태 분석](#2-현재-상태-분석)
3. [문제점 상세 목록](#3-문제점-상세-목록)
4. [리팩토링 목표와 원칙](#4-리팩토링-목표와-원칙)
5. [목표 아키텍처](#5-목표-아키텍처)
6. [단계별 실행 계획 (Phase 0 ~ 8)](#6-단계별-실행-계획)
7. [검증 체크리스트 및 수용 기준](#7-검증-체크리스트-및-수용-기준)
8. [우선순위·의존관계·일정](#8-우선순위의존관계일정)
9. [부록](#9-부록)

---

## 1. 요약 (Executive Summary)

### 1.1 한 줄 평가

**"기능은 동작하지만, 프로토타입 2개가 포개진 채 배포된 상태."** 인증·권한 로직의 뼈대(서버 액션 + Supabase + RLS)는 올바른 방향으로 잡혀 있으나, (1) 접근 제어에 실제 우회 경로가 있고, (2) UI는 가짜 데이터(스트릭·XP·60% 진행률·"9:41" 상태바)로 채워져 있으며, (3) CSS는 v1 데스크톱 디자인 위에 v2 모바일 디자인을 **삭제 없이 덮어쓴** 2,048줄짜리 단일 파일이고, (4) 테스트는 그 데드 CSS와 가짜 데이터를 "유지하라"고 고정하고 있습니다. 의존성은 전부 `"latest"`로 선언되어 재현 불가능하고, `npm run lint`는 Next.js 16에서 이미 깨져 있습니다.

### 1.2 핵심 수치

| 지표 | 값 | 비고 |
|---|---|---|
| 소스 총 라인 | 3,384줄 | `src/` 기준 |
| 그중 CSS | 2,048줄 (**60.5%**) | 단일 `globals.css` |
| 완전 데드 CSS 규칙 | 65개 규칙 / 최소 395줄 (19.3%) | 어떤 컴포넌트에서도 참조되지 않는 클래스만 집계. 덮어써져 무효화된 v1 규칙까지 포함하면 체감 50% 이상 |
| 미사용 CSS 클래스 | 37개 | `.appCard`, `.heroSection`, `.headerButton`, `.staffLine`… |
| 동일 셀렉터 중복 정의 | `:root`×2, `body`×2, `.appGrid`×2(+미디어쿼리 내 ×2), `.categoryStack`×2, `.backLink`×2 | 덮어쓰기 구조의 증거 |
| 하드코딩 색상 | hex 54종 + rgba 57개 | 토큰 체계 2벌(`--edu/--play` vs `--app-blue/--app-teal`) |
| 테스트 | 7파일 / 21케이스 | 이 중 2파일(5케이스)은 CSS **문자열** 검사 |
| 의존성 선언 | 6/6 dependencies, 8/8 devDependencies가 `"latest"` | lock은 next 16.2.9, react 19.2.7, @supabase/ssr 0.12.0 |
| 레포 비산 자산 | 약 6.5MB | `아이콘/`(5.7MB, .ai 포함), `icons/`(public과 100% 중복), `*.dc.html`+`support.js`, 루트 `1~3.png`, `screenshots/` |

### 1.3 반드시 고쳐야 할 것 (심각도 상위 5)

| # | 문제 | 위치 |
|---|---|---|
| 1 | **잠긴 앱 우회**: 카테고리 페이지 "이어 학습하기" 카드가 권한 검사 없이 `apps[0]`의 URL을 그대로 노출 → 게스트가 음악 게임 카테고리에서 잠긴 `난타 리듬 게임`을 바로 열 수 있음 | `src/app/category/[category]/page.tsx:27, 74` |
| 2 | **회원이 자기 계정 칩을 누르면 로그아웃당함**: 헤더 계정 칩이 로그인 사용자를 무조건 `/admin`으로 보내고 → `/admin-login`으로 리다이렉트 → 거기서 로그인하면 "관리자 권한이 없는 계정입니다"와 함께 `signOut()` | `src/components/SiteHeader.tsx:32`, `src/app/admin/page.tsx:15`, `src/app/auth/actions.ts:92-95` |
| 3 | **권한 판정 fail-open**: profiles 조회 오류/행 없음 시 `error`를 버리고 `"member"`로 기본 승격 | `src/lib/auth.ts:25-35` |
| 4 | **매 요청 2~3회 Supabase 왕복**: middleware `getUser()` + 페이지 `getUser()` + `profiles` 쿼리. 중복 제거(`cache()`) 없음, `getClaims()` 미사용 | `src/lib/supabase/middleware.ts:29`, `src/lib/auth.ts:16-29` |
| 5 | **빌드 파이프라인 신뢰 불가**: 전 의존성 `"latest"`, Next 16에서 제거된 `next lint` 스크립트, ESLint 설정 부재, CI 없음 | `package.json` |

### 1.4 리팩토링 전략 요약

```
Phase 0  안전망        : 브랜치·의존성 고정·ESLint·CI·README         (0.5일)
Phase 1  긴급 수정     : 우회 버그·로그아웃 트랩·fail-open·에러 메시지  (0.5일)
Phase 2  인증 계층     : proxy.ts·cache()·auth 서비스·단일 로그인·confirm (1일)
Phase 3  도메인 계층   : 카탈로그 정규화·접근 등급·/go 게이트·DB 타입   (1일)
Phase 4  UI 셸        : 라우트 그룹·AppShell·BottomNav·가짜 데이터 제거   (1.5일)
Phase 5  CSS 재구축    : 토큰 1벌·CSS Modules·데드 코드 삭제            (1.5일)
Phase 6  테스트/품질   : 액션 테스트·Playwright e2e·a11y·CI 확장         (1일)
Phase 7  레포/에셋     : 디자인 파일 이동·아이콘 최적화·중복 제거          (0.5일)
Phase 8  확장(선택)    : 관리자 기능·실제 진행률·PWA                      (2일+)
```

총 소요(Phase 0~7): 약 **7.5 작업일**. Phase 1까지만 적용해도 보안·UX 치명 결함은 해소됩니다.

---

## 2. 현재 상태 분석

### 2.1 기술 스택 (lock 파일 기준 실제 버전)

| 패키지 | package.json 선언 | 실제 설치 버전 | 비고 |
|---|---|---|---|
| next | `latest` | 16.2.9 | Turbopack 기본, `middleware.ts`→`proxy.ts`, `next lint` 제거 |
| react / react-dom | `latest` | 19.2.7 | `useActionState` 사용 중 (정상) |
| @supabase/ssr | `latest` | 0.12.0 | `getAll/setAll` 쿠키 패턴 사용 (정상) |
| @supabase/supabase-js | `latest` | 2.108.2 | `getClaims()` 사용 가능 |
| lucide-react | `latest` | 1.20.0 | |
| typescript | `latest` | 6.0.3 | |
| vitest / jsdom | `latest` | 4.1.9 / 29.1.1 | `@vitejs/plugin-react` 없음 (tsconfig `jsx: react-jsx`로 우회) |
| eslint / eslint-config-next | **없음** | — | `npm run lint` 실행 불가 |

### 2.2 디렉터리 구조 (현재)

```
Lesson_Designer/
├── middleware.ts                 # Next 16에서 deprecated (proxy.ts로 대체 필요)
├── next.config.mjs               # reactStrictMode만 설정, 보안 헤더 없음
├── package.json                  # 전부 "latest"
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 메타데이터만. viewport/폰트/theme-color 없음
│   │   ├── globals.css           # 2,048줄: v1 데스크톱(1~1286) + v2 모바일 덮어쓰기(1287~2048)
│   │   ├── page.tsx              # 홈: 가짜 스트릭/XP/60% 카드
│   │   ├── category/[category]/page.tsx   # 카테고리: 잠긴 앱 우회 버그
│   │   ├── login/ signup/ admin-login/    # AuthForm 재사용 (폰 프레임 밖에서 렌더)
│   │   ├── admin/page.tsx        # 폰 프레임 밖에서 렌더, 실질 기능 없음
│   │   └── auth/actions.ts       # 4개 서버 액션, 3개가 거의 동일 코드
│   ├── components/               # 7개 (AppCard, AppGrid, AuthForm, CategoryButton, SiteFooter, SiteHeader, StatusBanner)
│   └── lib/
│       ├── apps.ts               # 코드 내 카탈로그 16개 앱 (중복 URL 2쌍)
│       ├── access.ts             # 권한 규칙 (양호)
│       ├── auth.ts               # 현재 사용자 조회 (fail-open)
│       ├── env.ts                # siteUrl 선언만 하고 미사용
│       └── supabase/{client,server,middleware}.ts
├── supabase/migrations/202606170001_create_profiles.sql   # 커밋 후 수정됨(불변성 위반)
├── 아이콘/ (5.7MB, .ai/.jpg 원본)  icons/ (public/icons 100% 중복)
├── *.dc.html ×4 + support.js      # Claude Design 내보내기 (앱과 무관)
├── 1.png 2.png 3.png screenshots/ docs/superpowers/   # 산출물·계획 문서
└── 음악&악기 교육 앱 Vercel 링크.md
```

### 2.3 요청 처리 흐름 (현재)

```
브라우저 요청
  └─▶ middleware.ts ─▶ updateSession() ─▶ supabase.auth.getUser()   ← 네트워크 왕복 ①
        └─▶ 페이지 서버 컴포넌트 ─▶ getCurrentUserProfile()
              ├─▶ supabase.auth.getUser()                           ← 네트워크 왕복 ②
              └─▶ from("profiles").select(...)                      ← 네트워크 왕복 ③
                    └─▶ SiteHeader(profile) / AppGrid(role) 렌더
```

- 같은 요청 안에서 `getUser()`가 2번 호출되고, 결과를 공유하는 메커니즘(React `cache()`)이 없습니다.
- 서버 액션 `adminLoginAction`은 `signInWithPassword()`가 이미 `data.user`를 반환하는데도 `getUser()`를 한 번 더 호출합니다 (`actions.ts:82-84`).

### 2.4 화면 인벤토리

| 라우트 | 셸 | 상태 |
|---|---|---|
| `/` | 폰 프레임 O | 가짜 진행 데이터, "이어서 학습하기"는 항상 기타 코드 앱 |
| `/category/[category]` | 폰 프레임 O | 헤더 퀵탭 + 본문 탭바 + 하단 탭 = **같은 2개 목적지를 3군데서** 제공. 추천 카드 권한 우회 |
| `/login`, `/signup`, `/admin-login` | 폰 프레임 **X** | 데스크톱용 `authShell` 레이아웃 → 모바일 흐름과 단절 |
| `/admin` | 폰 프레임 **X** | `pageShell adminPage`(`.adminPage` CSS 없음). 앱 그리드만 재출력, 관리 기능 없음 |
| 404 | 기본 Next 404 | `not-found.tsx` 없음 → 프레임 밖 흰 화면 |

### 2.5 CSS 레이어 구조 (문제의 핵심)

```
globals.css
├─ 1~1286줄   v1 "데스크톱 포털" 레이어 (커밋 8246af2, cea3c68, 0e4b7c8)
│   ├─ :root 토큰 1벌 (--edu, --play, --beat …)
│   ├─ 헤더 버튼/프로필 배지/히어로(오선지 애니메이션)/.appCard …  ← 전부 미사용
│   └─ 1040px/760px/520px 미디어쿼리 (데스크톱 전제)
└─ 1287~2048줄 v2 "모바일 앱" 레이어 (커밋 2374a98, +763줄 / 삭제 0줄)
    ├─ :root 토큰 2벌째 (--app-blue, --app-teal …)
    ├─ body 재정의, .appGrid/.categoryStack/.backLink 재정의
    └─ 특이성 올리기로 v1 덮어쓰기: .homeShell.appMain, .bottomNav.siteFooter, .appPermissionStrip.permissionStrip …
```

커밋 로그가 이를 정확히 증명합니다: `2374a98`은 `globals.css`에 **763줄 추가, 0줄 삭제**입니다.

---

## 3. 문제점 상세 목록

심각도: 🔴 치명(보안/핵심 UX 결함) · 🟠 높음(품질·유지보수에 지속 비용) · 🟡 보통(개선 권장)

### A. 보안 · 접근 제어

| ID | 심각도 | 문제 | 근거 | 영향 |
|---|---|---|---|---|
| A-1 | 🔴 | 카테고리 "이어 학습하기" 카드가 `apps[0]`를 **권한 검사 없이** 링크. 음악 게임의 첫 앱(`nanta-game`, `publicAccess:false`)이 게스트에게 열림 | `category/[category]/page.tsx:27` `const featuredApp = apps[0];`, `:74` `<Link href={featuredApp.url} … target="_blank">` | 회원 전용 정책 무력화 |
| A-2 | 🟠 | 잠금이 **UI 게이트**일 뿐. 모든 하위 앱 URL은 공개 Vercel 배포이며 저장소(`apps.ts`, `음악&악기 교육 앱 Vercel 링크.md`)에 공개 | `src/lib/apps.ts` 전체 | URL만 알면 누구나 접근. 설계상 한계이므로 "무엇을 보호하는지" 재정의 필요 |
| A-3 | 🔴 | 프로필 조회 실패 시 fail-open: `error`를 구조분해에서 버리고, 행이 없으면 `"member"`로 기본 승격 | `src/lib/auth.ts:25-29, 34` `normalizeRole(data?.role ?? "member")` | DB 장애·RLS 오류가 "회원 권한"으로 둔갑. 장애가 로그에 남지 않음 |
| A-4 | 🟠 | Supabase 원문 에러(`error.message`, 영어)를 그대로 UI 노출 | `actions.ts:33, 56, 79` | "User already registered" 등 계정 존재 여부 열거(enumeration) + 한국어 UI 안에 영어 에러 |
| A-5 | 🟠 | 보안 응답 헤더 전무 (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors) | `next.config.mjs` | 클릭재킹·MIME 스니핑 노출 |
| A-6 | 🟡 | RLS update 정책이 같은 테이블을 서브쿼리로 참조(`with check (role = (select role from profiles …))`) — 동작은 하지만 Supabase가 경고하는 재귀 패턴. `grant update` 전체 컬럼 허용 후 정책으로 role 변경만 막는 구조 | `migrations/…create_profiles.sql:10, 19-28` | 컬럼 단위 권한으로 단순·안전하게 대체 가능 |
| A-7 | 🟡 | `auth.users.email` 변경 시 `profiles.email` 동기화 트리거 없음 (insert만 처리) | `…create_profiles.sql:32-50` | 이메일 변경 후 관리 화면 데이터 불일치 |
| A-8 | 🟡 | 마이그레이션 파일을 커밋 후 제자리 수정(`51d6d08`) — 마이그레이션 불변성 위반 | `git log --follow supabase/migrations/…` | 이미 적용된 DB와 파일이 달라져 `supabase db push` 이력 꼬임 |

### B. 인증 · 세션 흐름

| ID | 심각도 | 문제 | 근거 | 영향 |
|---|---|---|---|---|
| B-1 | 🔴 | 회원 → 계정 칩(`/admin`) → `/admin-login` 리다이렉트 → 로그인 시 **강제 로그아웃** | `SiteHeader.tsx:32` `href={profile ? "/admin" : "/login"}`, `admin/page.tsx:15`, `actions.ts:92-95` | 가장 눈에 띄는 버튼이 로그아웃 트랩 |
| B-2 | 🟠 | 로그인 후 원래 가려던 곳으로 복귀 없음 (`?required=1`만 있고 `next` 없음). 항상 `/`로 이동 | `AppCard.tsx:47`, `actions.ts:59` | 잠긴 앱 → 로그인 → 홈 → 다시 카테고리로 3단계 왕복 |
| B-3 | 🟠 | 회원가입 메시지 "로그인 후 이용해주세요"는 이메일 확인이 켜진 Supabase 기본 설정과 불일치. `emailRedirectTo` 미지정, `/auth/confirm` 라우트 없음. `NEXT_PUBLIC_SITE_URL`은 선언만 되고 **어디서도 사용되지 않음** | `actions.ts:30-36`, `env.ts:13` | 확인 메일 링크가 Supabase 기본 페이지로 떨어짐 |
| B-4 | 🟡 | 회원가입 폼의 비밀번호 `autoComplete="current-password"` (신규 가입은 `new-password`) | `AuthForm.tsx:58` | 비밀번호 관리자 자동 생성 안 됨 |
| B-5 | 🟡 | `AuthForm`이 `title.includes("관리자")`로 변형을 판별 | `AuthForm.tsx:24` | 문자열 스니핑. 제목 바꾸면 스타일 깨짐 |
| B-6 | 🟠 | 3개 액션(`signUp/login/adminLogin`)이 env 검사→파싱→검증→호출 코드를 그대로 복제 | `actions.ts:16-98` | 버그 수정 3번 해야 함 |
| B-7 | 🟠 | Next 16에서 `middleware.ts`는 `proxy.ts`로 대체(향후 제거 예정). `next lint`는 이미 제거됨 | `middleware.ts`, `package.json` `"lint": "next lint"` | 업그레이드 시 깨짐, 린트 불가 |
| B-8 | 🟠 | 요청당 Supabase 왕복 2~3회, `React.cache()` 미사용, `getClaims()` 미사용 | §2.3 참고 | 모바일 환경에서 TTFB 수백 ms 가산 |
| B-9 | 🟡 | 별도 `/admin-login` 라우트는 `/login` + 역할 검사와 기능상 동일 | `admin-login/page.tsx` | 중복 화면·중복 액션 |
| B-10 | 🟡 | `getCurrentRole()` 미사용 export | `auth.ts:38` | 데드 코드 |

### C. UI · UX · 모바일

| ID | 심각도 | 문제 | 근거 | 영향 |
|---|---|---|---|---|
| C-1 | 🔴 | **가짜 데이터가 실 서비스에 노출**: "0일 연속 학습 중!", "40 XP", "10/50", 22% 진행바, 모든 열린 앱 "60%", 헤더의 iOS 상태바 "9:41" | `page.tsx:26-29, 47`, `AppCard.tsx:15` `progress = allowed ? 60 : 0`, `SiteHeader.tsx:16`, `category/…:85` | 사용자 신뢰 훼손. 테스트가 이를 보호(`ui-upgrade.test.tsx:34`) |
| C-2 | 🟠 | 하단 탭/헤더 퀵탭의 활성 상태가 CSS `:first-child`로 고정 → 어느 화면에서나 "홈" 활성 | `SiteFooter.tsx`, `globals.css:2002` `.bottomNav a:first-child`, `:1452` `.appQuickNav a:first-child` | 현재 위치 오인 |
| C-3 | 🟠 | 카테고리 화면에 동일 목적지(악기/게임) 탐색 컨트롤 3중 중복 | `category/…:62-69` + `SiteHeader.tsx:46-49` + `SiteFooter.tsx` | 세로 공간 낭비(모바일), 인지 부하 |
| C-4 | 🟠 | 데스크톱에서 가짜 베젤(7px 테두리, 42px 라운드) 안에 앱을 그림 | `globals.css:1320-1330` | 태블릿/데스크톱 사용자(교실 PC·빔프로젝터)에게 장난감처럼 보임. 원 스펙은 "responsive mobile and desktop" |
| C-5 | 🟠 | 하단 탭이 `sticky/fixed`가 아니라 문서 흐름에 있어 스크롤하면 사라짐. iOS `safe-area-inset-bottom` 미적용 | `globals.css:1976-1983`, `layout.tsx` (viewport 없음) | 홈 인디케이터와 겹침, 탭 접근성 저하 |
| C-6 | 🟠 | 로그인/가입/관리자 페이지는 폰 프레임 없이 데스크톱 레이아웃 | `AuthForm.tsx:27`, `admin/page.tsx:18-37` | 화면 전환 시 디자인 체계가 바뀜 |
| C-7 | 🟡 | `100vh` 사용 (모바일 주소창 변동 미고려) | `globals.css:97, 1314, 1322, 2020` | 하단 잘림 |
| C-8 | 🟠 | `loading.tsx`/`error.tsx`/`not-found.tsx` 없음 | `src/app/` | 프레임 밖 기본 404, 에러 시 흰 화면 |
| C-9 | 🟡 | 폰트 토큰은 Pretendard/Space Grotesk인데 **로드하는 코드가 없음** → Arial/시스템 폰트로 폴백 | `globals.css:38-39`, `layout.tsx` | 디자인 의도 미반영. `font-weight: 950` 9회는 어떤 폰트에도 없음 |
| C-10 | 🟡 | 터치 타깃 34px (로그아웃·비밀번호 토글), 권장 44px 미만 | `globals.css:1035, 1425` | 오터치 |
| C-11 | 🟡 | 페이지별 `generateMetadata` 없음 (카테고리 2개가 같은 title) | `category/…` | 공유/북마크 시 구분 불가 |

### D. CSS 아키텍처

| ID | 심각도 | 문제 | 근거 |
|---|---|---|---|
| D-1 | 🟠 | 디자인 시스템 2벌이 한 파일에 공존 (`:root` 2회, `body` 2회) | `globals.css:1-40` vs `:1288-1311` |
| D-2 | 🟠 | 완전 데드 규칙 65개/395줄 + 덮어써진 v1 규칙 다수. `staff-line-draw`, `playhead-sweep`, `note-pop` 키프레임도 데드 | §1.2 |
| D-3 | 🟠 | 특이성 스택으로 덮어쓰기: `.homeShell.appMain`, `.bottomNav.siteFooter`, `.appPermissionStrip.permissionStrip`, `.categoryButton.appCategoryCard` | `:1471, 1655, 1805, 1976` |
| D-4 | 🟠 | 전역 네임스페이스 camelCase 클래스 123개, 컴포넌트 경계 없음 | 전체 |
| D-5 | 🟡 | hex 54종·rgba 57개 하드코딩, 그림자 색/투명도 반복 | 전체 |
| D-6 | 🟠 | **테스트가 CSS 문자열을 고정**: `.appCard:hover`, `translateY(-4px)`, `--app-blue: #3f5fd8` 등 — 데드 코드 삭제 시 테스트 실패 | `ui-css.test.ts`, `motion-css.test.ts` |
| D-7 | 🟡 | `will-change: transform` 상시 적용, `backdrop-filter` | `:523, 707, 142` |
| D-8 | 🟡 | TSX에만 있고 CSS에 없는 클래스: `.adminPage`, `.appCategorySection`, `.available`; 미사용 `data-category` | `admin/page.tsx:21`, `page.tsx:54`, `AppCard.tsx:18` |

### E. 데이터 모델 · 카탈로그

| ID | 심각도 | 문제 | 근거 |
|---|---|---|---|
| E-1 | 🟡 | `categoryLabel`이 16개 항목마다 반복(비정규화). `CATEGORY_META.shortLabel`과 동일 | `apps.ts:53, 63, …` |
| E-2 | 🟡 | `CATEGORY_LABELS`, `getCategoryLabel`은 테스트에서만 사용. `CATEGORY_META.description`은 아무 데서도 안 쓰고 `page.tsx:63, 68`에 설명을 다시 하드코딩 | `apps.ts:44-47, 230-232` |
| E-3 | 🟠 | 같은 URL·아이콘의 앱이 두 카테고리에 각각 등록: `tongue-drum-edu`=`tongue-drum-game`, `kalimba-edu`=`kalimba-game` → 통계(전체 16개)가 부풀려짐 | `apps.ts:70-89, 190-209` |
| E-4 | 🟡 | `publicAccess: boolean`은 3등급(게스트/회원/관리자) 확장 불가 | `apps.ts:15` |
| E-5 | 🟠 | Supabase DB 타입 미생성 → `from("profiles")` 결과가 사실상 `any` | `auth.ts:25`, `actions.ts:86` |
| E-6 | 🟡 | 카탈로그가 코드에 있어 관리자가 편집 불가. `AppGrid` 빈 상태 문구는 "관리자 페이지에서 앱 구성을 확인"이라 안내(존재하지 않는 기능) | `AppGrid.tsx:15` |
| E-7 | 🟡 | 아이콘 자산 품질: `drum.png`는 실제로 **JPEG**(543×314, 불투명 배경), `kalimba.png` 1381×2000(54KB)를 56px 박스에, 비율 제각각(233×604, 330×744…) | `public/icons/` |

### F. 접근성

| ID | 심각도 | 문제 | 근거 |
|---|---|---|---|
| F-1 | 🟡 | 가짜 상태바 "9:41"이 스크린리더에 읽힘(`aria-label="기기 상태"`) | `SiteHeader.tsx:15-16` |
| F-2 | 🟡 | 홈의 `<h1>`이 "0일 연속 학습 중!" — 문서 개요가 가짜 데이터로 시작 | `page.tsx:26` |
| F-3 | 🟡 | `<em>60%</em>`, 레이아웃용 `<strong>` 등 의미 태그 오용 | `page.tsx:47`, `category/…:85` |
| F-4 | 🟡 | 상태 배너에 `role="status"/"alert"`·`aria-live` 없음 → 서버 액션 결과를 스크린리더가 놓침 | `StatusBanner.tsx` |
| F-5 | 🟡 | 새 창 열림(`target="_blank"`) 미고지 | `AppCard.tsx:42` |
| F-6 | 🟡 | v2 레이어의 `.tileAction`, `.userChip`, `.bottomNav a`에는 `:focus-visible` 스타일 없음(v1 목록만 존재) | `globals.css:1113-1124` |

### G. 테스트 · 품질 보증

| ID | 심각도 | 문제 |
|---|---|---|
| G-1 | 🟠 | 실제 위험 영역(서버 액션, 세션 갱신, 역할 게이팅, 리다이렉트)에 테스트 0개 |
| G-2 | 🟠 | CSS 문자열 테스트 2파일이 데드 코드 삭제를 막음 (D-6) |
| G-3 | 🟠 | `ui-upgrade.test.tsx`가 "9:41", "60%"를 단언 → 가짜 데이터 제거를 막음 |
| G-4 | 🟡 | e2e/시각 회귀 없음 (디자인 시스템 변경을 검증할 수단이 CSS 문자열뿐) |
| G-5 | 🟠 | CI 없음, lint 불가, 타입체크 스크립트 없음 |

### H. 의존성 · 빌드 · 저장소 위생

| ID | 심각도 | 문제 |
|---|---|---|
| H-1 | 🟠 | 모든 의존성 `"latest"` — `npm update` 한 번에 메이저 점프. `overrides.next.postcss` 핀은 취약점 땜질 흔적 |
| H-2 | 🟠 | ESLint/Prettier 설정 없음, `engines`/`.nvmrc` 없음(Next 16은 Node ≥ 20.9) |
| H-3 | 🟡 | 루트에 디자인 산출물 혼재: `*.dc.html` 4개 + `support.js`(55KB 생성 코드), `1~3.png`, `screenshots/`, `.thumbnail`, `아이콘/`(5.7MB, `.ai` 원본 포함), `icons/`(public과 바이트 단위 동일) |
| H-4 | 🟡 | README 없음. 유일한 문서는 `docs/superpowers/`의 초기 계획서(현 코드와 불일치) |
| H-5 | 🟡 | `.gitignore`에 `.env*.local`은 있으나 `*.ai`, `.DS_Store`, `coverage/`, `playwright-report/` 등 없음 |

### I. 성능

| ID | 심각도 | 문제 |
|---|---|---|
| I-1 | 🟠 | B-8과 동일: 요청당 인증 왕복 중복 |
| I-2 | 🟡 | 첫 화면 아이콘에 `priority`/`sizes` 없음, 원본 해상도 과다 (E-7) |
| I-3 | 🟡 | `images.formats`(avif/webp) 미설정, 정적 경로(`generateStaticParams`) 미활용 — 쿠키 의존으로 어차피 동적이나 셸은 스트리밍 분리 가능 |
| I-4 | 🟡 | 홈·카테고리에 `Suspense` 경계 없음 → 프로필 조회가 끝나야 첫 바이트 전송 |

**집계**: 🔴 5건 · 🟠 27건 · 🟡 30건 (총 62건)

---

## 4. 리팩토링 목표와 원칙

### 4.1 목표

1. **보안 결함 0건**: UI 게이트가 아닌 서버 게이트(`/go/[appId]`)로 접근 제어 일원화, fail-closed.
2. **정직한 UI**: 실데이터가 없는 지표는 표시하지 않는다. 가짜 장식(상태바·베젤) 제거.
3. **CSS 50% 감량, 토큰 1벌**: 2,048줄 → 약 900줄 이하, `:root` 1개, 컴포넌트 단위 CSS Modules.
4. **요청당 인증 왕복 1회 이하**: `proxy.ts` + `getClaims()` + `cache()`.
5. **재현 가능한 빌드**: 버전 고정, ESLint flat config, typecheck, CI.
6. **위험 영역 테스트 커버**: 서버 액션·역할 게이팅·리다이렉트·e2e 3개 시나리오(게스트/회원/관리자).

### 4.2 유지할 것 (바꾸지 않음)

- Next.js App Router + 서버 액션 + Supabase Auth/Postgres + Vercel 배포
- `profiles` 테이블 기반 역할 모델(`member`/`admin`), RLS
- 순수 CSS(프레임워크 도입 없음) — 단, **CSS Modules + 토큰 파일**로 분리
- lucide-react 아이콘, Vitest + Testing Library
- 카탈로그를 코드에 두는 1차 방침(Phase 8에서 DB 이전 옵션)

### 4.3 원칙

- **작게, 되돌릴 수 있게**: Phase마다 별도 브랜치/PR, 각 Phase 끝에 `npm run verify` 통과.
- **삭제가 먼저**: 새 CSS를 쓰기 전에 데드 코드를 지운다. 테스트도 같이 지운다(의도적으로).
- **서버가 진실**: 권한·세션 판단은 서버 컴포넌트/라우트 핸들러/RLS에서만. 클라이언트는 표시만.
- **타입으로 막기**: `access: "public" | "member"`, `Database` 타입, `typedRoutes`.
- **문자열 테스트 금지**: CSS 내용 단언 대신 렌더 결과·시각 스냅샷으로 검증.

---

## 5. 목표 아키텍처

### 5.1 디렉터리 구조 (목표)

```
Lesson_Designer/
├── proxy.ts                          # (중요) middleware.ts 대체
├── next.config.mjs                   # headers(), images, typedRoutes
├── eslint.config.mjs  .prettierrc  .nvmrc  README.md
├── .github/workflows/ci.yml
├── design/                           # 앱과 무관한 디자인 산출물 격리
│   ├── exports/*.dc.html, support.js
│   ├── mockups/1.png 2.png 3.png screenshots/
│   └── README.md (원본 아이콘은 Drive 링크로)
├── scripts/optimize-icons.mjs        # sharp로 256×256 webp 생성
├── public/icons/*.webp (+png 폴백)
├── supabase/migrations/
│   ├── 202606170001_create_profiles.sql        # 손대지 않음
│   └── 202610210001_profiles_hardening.sql     # 컬럼 권한·admin 정책·이메일 동기화·RPC
├── src/
│   ├── app/
│   │   ├── layout.tsx                # 폰트(next/font) + viewport + metadata 기본값
│   │   ├── globals.css               # tokens.css + base.css 임포트만 (≤ 150줄)
│   │   ├── not-found.tsx  error.tsx
│   │   ├── (app)/                    # 셸(헤더+하단탭)이 있는 화면
│   │   │   ├── layout.tsx            # <AppShell profile>{children}</AppShell>
│   │   │   ├── loading.tsx
│   │   │   ├── page.tsx              # 홈
│   │   │   ├── category/[category]/page.tsx
│   │   │   └── admin/page.tsx
│   │   ├── (auth)/                   # 셸 없는 전체 화면 폼
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── auth/
│   │   │   ├── actions.ts            # 얇은 래퍼 (검증·호출·메시지 매핑은 features/auth)
│   │   │   └── confirm/route.ts      # 이메일 확인 콜백
│   │   └── go/[appId]/route.ts       # 서버 접근 게이트 (302)
│   ├── components/
│   │   ├── shell/   AppShell.tsx AppHeader.tsx BottomNav.tsx (client) *.module.css
│   │   ├── catalog/ AppCard.tsx AppGrid.tsx CategoryCard.tsx *.module.css
│   │   ├── auth/    AuthForm.tsx StatusBanner.tsx *.module.css
│   │   └── ui/      Button.tsx Pill.tsx Stat.tsx *.module.css
│   ├── features/
│   │   ├── auth/    service.ts(cache) errors.ts validation.ts types.ts role.ts
│   │   └── catalog/ apps.ts categories.ts access.ts stats.ts
│   ├── lib/
│   │   ├── env.ts
│   │   └── supabase/ server.ts client.ts proxy.ts database.types.ts
│   ├── styles/ tokens.css base.css
│   └── content/ko.ts                 # UI 문구 모음
├── e2e/ (Playwright) guest.spec.ts member.spec.ts admin.spec.ts
└── vitest.config.ts  vitest.setup.ts  playwright.config.ts
```

### 5.2 요청 흐름 (목표)

```
브라우저 요청
  └─▶ proxy.ts ─▶ updateSession(): getClaims()  (서명키 로컬 검증, 왕복 0회*)
        └─▶ (app)/layout.tsx ─▶ getCurrentUserProfile()  ← React.cache() 로 요청당 1회
              ├─▶ getUser() 1회 + profiles 1회  (오류 시 'guest' + 로그)
              └─▶ AppShell(profile) → page(children)
  앱 열기: <Link href="/go/kalimba-edu"> ─▶ route.ts: 세션·역할 검사
              ├─ 허용 ─▶ 302 → https://kalimba-play.vercel.app/
              └─ 거부 ─▶ 302 → /login?next=/go/kalimba-edu
```
\* 프로젝트가 비대칭 JWT 서명키(ES256/RS256)를 사용할 때. 레거시 대칭 키면 `getUser()` 유지(§6 Phase 2 Step 2.1 참고).

### 5.3 접근 제어 모델 (목표)

| 등급 | 조건 | 열 수 있는 앱 | 관리자 화면 |
|---|---|---|---|
| guest | 비로그인 | `access: "public"` | ✗ |
| member | 로그인 + `profiles.role='member'` **(행이 존재해야 함)** | 전부 | ✗ (403 안내) |
| admin | 로그인 + `profiles.role='admin'` | 전부 | ✓ |

- 프로필 행 없음/조회 오류 → **guest**로 처리하고 서버 로그에 기록 (fail-closed).
- 카드의 "시작" 링크는 항상 `/go/[appId]` (절대 외부 URL을 직접 렌더하지 않음) → 우회 경로 원천 차단 + 향후 열람 기록(Phase 8)의 단일 진입점.

### 5.4 탐색 모델 (목표)

- 헤더: 브랜드 + 계정 칩(게스트→`/login`, 회원→`/account` 또는 현재는 로그아웃 메뉴, 관리자→`/admin`).
- 하단 탭(`BottomNav`, client): 홈 / 악기 / 게임 / (관리자만) 관리 — `usePathname()`으로 활성 표시, `position: sticky; bottom: 0` + safe-area.
- 카테고리 화면: 헤더 퀵탭·본문 탭바 **삭제** (하단 탭이 유일한 카테고리 전환 수단).

### 5.5 디자인 토큰 (목표, 1벌)

```css
/* src/styles/tokens.css */
:root {
  color-scheme: light;
  /* 브랜드 */
  --c-brand:        #3f5fd8;  --c-brand-deep: #11152f;  --c-brand-soft: #eef2ff;
  --c-accent:       #19b7c4;  --c-accent-soft: #dff9fb;
  --c-play:         #ff7a4c;  --c-play-soft:  #fff0e7;
  --c-sun:          #ffd23f;
  /* 중립 */
  --c-canvas: #f3f2ee; --c-rail: #f4f5fb; --c-paper: #ffffff;
  --c-text: #17172c; --c-text-muted: #7b7f92; --c-line: #e7e8f2;
  /* 상태 */
  --c-ok: #16a34a; --c-ok-soft: #e7f6ed; --c-warn: #8a5f0b; --c-warn-soft: #fff3ce;
  --c-danger: #ef4444; --c-danger-soft: #fdecec;
  /* 라운드·그림자·모션 */
  --r-sm: 8px; --r-md: 15px; --r-lg: 24px; --r-pill: 999px;
  --sh-card: 0 12px 24px rgba(20, 24, 52, .06);
  --sh-float: 0 16px 34px rgba(63, 95, 216, .3);
  --motion-fast: 180ms; --motion-base: 260ms; --ease-out: cubic-bezier(.16, 1, .3, 1);
  /* 타이포 */
  --font-sans: var(--font-pretendard), "Noto Sans KR", system-ui, sans-serif;
  --fs-xs: 11px; --fs-sm: 13px; --fs-md: 15px; --fs-lg: 18px; --fs-xl: 24px; --fs-2xl: 28px;
  /* 레이아웃 */
  --shell-max: 480px; --tap: 44px;
  --safe-b: env(safe-area-inset-bottom, 0px);
}
```
카테고리별 테마는 셸 루트에 `data-tone="edu|play"`를 달고 `--c-tone`, `--c-tone-soft`만 바꾸는 방식으로 통일합니다(지금처럼 `.categoryPhone.play .siteHeader.appHeader` 식 조합 셀렉터 금지).

---

## 6. 단계별 실행 계획

각 Step 형식: **목적 → 변경 파일 → 작업 내용(코드) → 검증 → 완료 기준**.
명령은 macOS/Linux/Windows 공통(npm)으로 적었습니다.

---

### Phase 0 — 안전망 구축 (0.5일)

> 목표: 이후 모든 변경을 같은 기준으로 검증할 수 있는 도구 체인. 코드 동작 변경 없음.

#### Step 0.1 브랜치 전략

```bash
git checkout -b refactor/phase-0-tooling
```
- Phase마다 `refactor/phase-N-*` 브랜치 → PR → `main` 머지. Vercel Preview로 각 Phase 시각 확인.

#### Step 0.2 의존성 버전 고정 + 누락 도구 추가

**변경 파일**: `package.json`, `.nvmrc`

```jsonc
{
  "name": "lesson-designer",
  "version": "0.2.0",
  "private": true,
  "engines": { "node": ">=20.9.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run typecheck && npm run lint && npm run test && npm run build",
    "icons:build": "node scripts/optimize-icons.mjs",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > src/lib/supabase/database.types.ts"
  },
  "dependencies": {
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "lucide-react": "^1.20.0",
    "next": "^16.2.9",
    "pretendard": "^1.3.9",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",   // 설치 시점의 최신 1.x 로 조정
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^25.9.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.17",
    "@vitejs/plugin-react": "^5",
    "eslint": "^9",
    "eslint-config-next": "^16.2.9",
    "jsdom": "^29.1.1",
    "prettier": "^3",
    "sharp": "^0.34",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  }
}
```
- `^` 범위는 lock 파일의 현재 버전에서 시작(메이저 고정). `latest`를 전부 치환한다.
- `overrides.next.postcss`는 `npm audit`로 취약점이 해소되었는지 확인 후 삭제(해소 안 됐으면 유지하고 주석 대신 README에 사유 기록).
- `.nvmrc`: `22`

#### Step 0.3 ESLint flat config + Prettier

**변경 파일**: `eslint.config.mjs`(신규), `.prettierrc`(신규), `.prettierignore`

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "design/**", "support.js", "next-env.d.ts", "playwright-report/**"]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@next/next/no-img-element": "error"
    }
  }
]);
```
```json
// .prettierrc
{ "printWidth": 110, "trailingComma": "none", "singleQuote": false }
```
> 설치 후 `npx eslint --print-config src/app/page.tsx`로 설정이 로드되는지 확인. `eslint-config-next` 16의 flat export 이름이 다르면 패키지 README의 예시를 따른다.

#### Step 0.4 Vitest 설정 보강

**변경 파일**: `vitest.config.ts`, `vitest.setup.ts`(신규)

```ts
// vitest.config.ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", include: ["src/**"], exclude: ["src/**/*.test.*", "src/lib/supabase/database.types.ts"] }
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }
});
```
```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

#### Step 0.5 CI

**변경 파일**: `.github/workflows/ci.yml`(신규)

```yaml
name: CI
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: ".nvmrc", cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

#### Step 0.6 README + .gitignore

**변경 파일**: `README.md`(신규), `.gitignore`

README 최소 항목: 프로젝트 목적 / 로컬 실행(`.env.local` 작성법) / Supabase 설정(마이그레이션 적용, 이메일 템플릿 변경 — Phase 2) / 스크립트 목록 / 배포(Vercel env) / 폴더 구조 / 디자인 자산 위치.

`.gitignore` 추가:
```
coverage/
playwright-report/
test-results/
.DS_Store
*.ai
```

**Phase 0 완료 기준**
- [ ] `npm ci && npm run verify` 로컬 통과(현재 코드 그대로)
- [ ] GitHub Actions 녹색
- [ ] `package.json`에 `latest` 문자열 0개

---

### Phase 1 — 긴급 수정 (0.5일)

> 목표: 코드 구조를 바꾸지 않고 🔴 결함만 최소 diff로 제거. Phase 2~5가 늦어져도 이 Phase는 즉시 배포.

#### Step 1.1 잠긴 앱 우회 차단 (A-1)

**변경 파일**: `src/app/category/[category]/page.tsx`

```tsx
// before
const featuredApp = apps[0];
// after
const featuredApp = apps.find((app) => canOpenApp(app, role)) ?? null;
```
- `import { canOpenApp } from "@/lib/access";` 추가.
- 추천 카드가 없으면 섹션을 렌더하지 않는 기존 분기(`featuredApp ? … : null`) 그대로 활용.

**검증**: 로그아웃 상태에서 `/category/music-game` 접속 → "이어 학습하기" 섹션이 사라지거나(게임 전부 회원용) 공개 앱만 표시.

#### Step 1.2 로그아웃 트랩 제거 (B-1)

**변경 파일**: `src/components/SiteHeader.tsx`, `src/app/admin/page.tsx`, `src/app/auth/actions.ts`

```tsx
// SiteHeader.tsx:32 — 역할별 목적지
const accountHref = !profile ? "/login" : profile.role === "admin" ? "/admin" : "/category/instrument-education";
<Link href={accountHref} className="userChip" …>
```
```tsx
// admin/page.tsx — 비관리자 회원은 로그인 페이지가 아니라 403 안내
if (!profile) redirect("/login?next=/admin");
if (!canAccessAdminPage(profile.role)) {
  return <AccessDenied />;   // "관리자 전용 화면입니다. 홈으로 돌아가기" (임시 인라인 JSX 허용)
}
```
```ts
// actions.ts adminLoginAction — 비관리자여도 로그아웃시키지 않는다
if (profile?.role !== "admin") {
  return { message: "관리자 권한이 없는 계정입니다. 회원 화면으로 이동합니다.", tone: "error" };
}
```
(Phase 2에서 `/admin-login` 자체를 삭제하므로 임시 조치.)

#### Step 1.3 fail-closed 역할 판정 (A-3)

**변경 파일**: `src/lib/auth.ts`

```ts
const { data, error } = await supabase.from("profiles").select("id,email,role").eq("id", user.id).maybeSingle();

if (error) {
  console.error("[auth] profiles 조회 실패", { userId: user.id, code: error.code, message: error.message });
  return { id: user.id, email: user.email ?? null, role: "guest" };
}
if (!data) {
  console.warn("[auth] profiles 행 없음 — 트리거 확인 필요", { userId: user.id });
  return { id: user.id, email: user.email ?? null, role: "guest" };
}
return { id: user.id, email: data.email ?? user.email ?? null, role: normalizeRole(data.role) };
```
- `getCurrentRole()` 삭제(B-10).

**검증**: 테스트 `src/lib/__tests__/access.test.ts`에 `normalizeRole(undefined) === "guest"` 추가. Supabase 대시보드에서 임시로 `profiles_select_own` 정책을 끄고 로그인 → 게스트로 표시되는지 확인 후 정책 복구.

#### Step 1.4 에러 메시지 한국어 매핑 (A-4)

**변경 파일**: `src/lib/auth-errors.ts`(신규), `src/app/auth/actions.ts`

```ts
// src/lib/auth-errors.ts
import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_not_confirmed: "이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.",
  user_already_exists: "이미 가입된 이메일입니다. 로그인해주세요.",
  weak_password: "비밀번호가 너무 단순합니다. 6자 이상, 문자와 숫자를 섞어주세요.",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  over_email_send_rate_limit: "인증 메일 발송 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
  signup_disabled: "현재 신규 가입이 중단되어 있습니다."
};

export function toUserMessage(error: AuthError | null | undefined, fallback = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.") {
  if (!error) return fallback;
  return (error.code && MESSAGES[error.code]) ?? fallback;
}
```
- `actions.ts`의 `error.message` 3곳을 `toUserMessage(error)`로 교체.
- 서버 로그에는 원문을 남긴다: `console.error("[auth]", action, error.code, error.message)`.
- 회원가입은 계정 존재 여부와 무관하게 동일 문구를 보여 열거를 막는다: `"입력한 주소로 안내 메일을 보냈습니다. 메일함을 확인해주세요."` (Supabase는 이메일 확인이 켜져 있으면 기존 사용자에게도 `identities: []`인 가짜 성공을 돌려줌 — 그 경우에도 같은 문구).

#### Step 1.5 로그인 후 복귀 경로 (B-2)

**변경 파일**: `src/components/AppCard.tsx`, `src/app/login/page.tsx`, `src/components/AuthForm.tsx`, `src/app/auth/actions.ts`

- 잠긴 카드 링크: `/login?required=1` → ``/login?next=${encodeURIComponent(`/category/${app.category}`)}`` (Phase 3에서 `/go/[appId]`로 다시 바뀜).
- `AuthForm`에 `<input type="hidden" name="next" value={next} />` 추가(`next` prop).
- `loginAction`: `const next = safeNext(getString(formData, "next"));  redirect(next);`

```ts
// src/lib/safe-next.ts — 오픈 리다이렉트 방지
export function safeNext(value: string, fallback = "/") {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://") ? value : fallback;
}
```

#### Step 1.6 보안 헤더 (A-5)

**변경 파일**: `next.config.mjs`

```js
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only",
    value: "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'" }
];
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; }
};
export default nextConfig;
```
- CSP는 Report-Only로 시작 → Vercel 로그로 위반 수집 → Phase 6에서 enforce 전환(Next 인라인 스크립트에 nonce 적용 필요 여부 판단).

#### Step 1.7 가입 폼 autocomplete (B-4)

`AuthForm`에 `passwordAutoComplete?: "current-password" | "new-password"` prop 추가, signup 페이지에서 `"new-password"` 전달.

**Phase 1 완료 기준**
- [ ] 게스트가 어떤 화면의 어떤 링크로도 `publicAccess:false` 앱 URL에 도달할 수 없음 (DOM에 해당 URL 미출력: `curl -s localhost:3000/category/music-game | grep -c nanta-play` → 0)
- [ ] 회원이 계정 칩 → 어떤 경로로도 로그아웃되지 않음
- [ ] 프로필 조회 실패가 guest + 서버 로그로 귀결
- [ ] UI에 영어 Supabase 에러 문구 0건
- [ ] `curl -I` 응답에 보안 헤더 5종

---

### Phase 2 — 인증·세션 계층 정리 (1일)

> 목표: Next 16 규약 준수, 왕복 최소화, 액션 중복 제거, 가입→이메일 확인→로그인 흐름 완성, 로그인 화면 단일화.

#### Step 2.1 `middleware.ts` → `proxy.ts` + `getClaims()`

**변경 파일**: `middleware.ts` 삭제, `proxy.ts`(신규), `src/lib/supabase/middleware.ts` → `src/lib/supabase/proxy.ts`

```ts
// proxy.ts (프로젝트 루트)
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|robots.txt|sitemap.xml).*)"]
};
```
```ts
// src/lib/supabase/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();
  if (!env.isConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  // 비대칭 서명키 프로젝트: 로컬 JWT 검증 (Auth 서버 왕복 없음). 만료 시 ssr 클라이언트가 refresh 수행.
  await supabase.auth.getClaims();
  return response;
}
```
- Supabase 대시보드 → Project Settings → JWT Keys에서 **"JWT Signing Keys"가 ECC/RSA(비대칭)인지 확인**. 레거시 HS256(대칭)이면 `getClaims()`가 Auth 서버를 호출하므로 이득이 없다 → 키 마이그레이션을 하거나 `getUser()` 유지.
- Next 공식 codemod가 있으면 사용: `npx @next/codemod@canary middleware-to-proxy .` (존재 여부는 실행 시 확인).

**검증**: `npm run dev` 콘솔에 middleware deprecation 경고가 사라짐. 로그인 후 `/`를 새로고침해도 세션 유지. 쿠키 만료 시간을 짧게 설정(대시보드 JWT expiry 60s)하고 2분 뒤 새로고침 → 자동 갱신 확인.

#### Step 2.2 인증 서비스 모듈 + `cache()`

**변경 파일**: `src/features/auth/service.ts`(신규, `src/lib/auth.ts` 대체), `src/features/auth/types.ts`

```ts
// src/features/auth/types.ts
import type { UserRole } from "@/features/catalog/access";
export type CurrentUserProfile = { id: string; email: string | null; role: UserRole };
export type AuthState = { message: string; tone: "idle" | "success" | "error" | "info" };
export const initialAuthState: AuthState = { message: "", tone: "idle" };
```
```ts
// src/features/auth/service.ts
import "server-only";
import { cache } from "react";
import { normalizeRole } from "@/features/catalog/access";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUserProfile } from "./types";

export const getCurrentUserProfile = cache(async (): Promise<CurrentUserProfile | null> => {
  if (!getPublicEnv().isConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("id,email,role").eq("id", user.id).maybeSingle();
  if (error || !data) {
    console.error("[auth] profile lookup failed", { userId: user.id, error: error?.message ?? "no row" });
    return { id: user.id, email: user.email ?? null, role: "guest" };
  }
  return { id: user.id, email: data.email ?? user.email ?? null, role: normalizeRole(data.role) };
});
```
- `cache()` 덕분에 `(app)/layout.tsx`와 각 page가 각각 호출해도 요청당 1회만 실행.
- `server-only` 패키지 설치(`npm i server-only`)로 클라이언트 번들 유입 차단.

#### Step 2.3 서버 액션 통합

**변경 파일**: `src/app/auth/actions.ts`(재작성), `src/features/auth/validation.ts`(기존 `auth-validation.ts` 이동), `src/lib/auth-form-state.ts` 삭제

```ts
"use server";
import { redirect } from "next/navigation";
import { toUserMessage } from "@/features/auth/errors";
import { credentialsFromForm, type Credentials } from "@/features/auth/validation";
import type { AuthState } from "@/features/auth/types";
import { getPublicEnv } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

type Parsed = { ok: true; value: Credentials; next: string } | { ok: false; state: AuthState };

function parse(formData: FormData): Parsed {
  if (!getPublicEnv().isConfigured) return { ok: false, state: { message: "서버 설정이 완료되지 않았습니다.", tone: "error" } };
  const result = credentialsFromForm(formData);
  if (!result.ok) return { ok: false, state: { message: result.error, tone: "error" } };
  return { ok: true, value: result.value, next: safeNext(String(formData.get("next") ?? "")) };
}

export async function signUpAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const p = parse(formData);
  if (!p.ok) return p.state;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...p.value,
    options: { emailRedirectTo: `${getPublicEnv().siteUrl}/auth/confirm?next=${encodeURIComponent(p.next)}` }
  });
  if (error && error.code !== "user_already_exists") {
    console.error("[auth:signup]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }
  return { message: "입력한 주소로 안내 메일을 보냈습니다. 메일함을 확인해주세요.", tone: "success" };
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const p = parse(formData);
  if (!p.ok) return p.state;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(p.value);
  if (error) {
    console.error("[auth:login]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }
  redirect(p.next);
}

export async function logoutAction() {
  if (getPublicEnv().isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
```
- `adminLoginAction` **삭제**. `/admin`은 `getCurrentUserProfile()`로 판정(관리자 아니면 403 안내 화면). 관리자 전용 로그인 화면이 꼭 필요하면 `/login?as=admin`으로 `AuthForm variant="admin"`만 바꾼다.

```ts
// src/features/auth/validation.ts
export const PASSWORD_MIN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type Credentials = { email: string; password: string };

export function credentialsFromForm(formData: FormData): { ok: true; value: Credentials } | { ok: false; error: string } {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email)) return { ok: false, error: "이메일 주소를 확인해주세요." };
  if (password.length < PASSWORD_MIN) return { ok: false, error: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.` };
  return { ok: true, value: { email, password } };
}
```

#### Step 2.4 이메일 확인 콜백

**변경 파일**: `src/app/auth/confirm/route.ts`(신규)

```ts
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next") ?? "/");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
    console.error("[auth:confirm]", error.code, error.message);
  }
  redirect("/login?notice=confirm-failed");
}
```
- Supabase 대시보드 → Authentication → Email Templates → **Confirm signup** 본문의 링크를
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경.
  Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**` 등록.

#### Step 2.5 `AuthForm` 정리

**변경 파일**: `src/components/auth/AuthForm.tsx`

- props: `variant: "login" | "signup" | "admin"`, `next?: string`, `notice?: string`. `title/description/submitLabel`은 variant → `content/ko.ts`에서 조회.
- `autoComplete`는 variant별(`signup` → `new-password`).
- `StatusBanner`에 `role={tone === "error" ? "alert" : "status"}` `aria-live="polite"` 추가(F-4).
- 하단 링크: login 화면엔 "계정이 없나요? 회원가입", signup 화면엔 "이미 계정이 있나요? 로그인".

#### Step 2.6 파일 정리

- 삭제: `src/app/admin-login/`, `src/lib/auth.ts`, `src/lib/auth-form-state.ts`, `src/lib/auth-validation.ts`(이동), `middleware.ts`.
- 테스트 이동/갱신: `auth-validation.test.ts` → `src/features/auth/__tests__/validation.test.ts` (`credentialsFromForm` 기준으로 재작성).

**Phase 2 완료 기준**
- [ ] `grep -r "middleware" --include=*.ts . | grep -v node_modules` 결과 없음
- [ ] 서버 로그 기준 페이지 1회 렌더에 Supabase Auth 호출 ≤ 1회(`getUser` 1회, 프록시는 로컬 검증)
- [ ] 가입 → 메일 링크 → `/auth/confirm` → `next` 복귀 e2e 수동 확인
- [ ] 액션 파일 100줄 이하, 중복 블록 0

---

### Phase 3 — 도메인/데이터 계층 (1일)

> 목표: 카탈로그 정규화, 접근 등급 타입화, 서버 게이트 `/go/[appId]`, DB 타입.

#### Step 3.1 카탈로그 재모델링

**변경 파일**: `src/features/catalog/{categories,apps,access,stats}.ts`(신규, `src/lib/apps.ts`·`access.ts` 대체)

```ts
// categories.ts
export const APP_CATEGORIES = ["instrument-education", "music-game"] as const;
export type AppCategory = (typeof APP_CATEGORIES)[number];
export type CategoryTone = "edu" | "play";

export const CATEGORY_META = {
  "instrument-education": { label: "악기 교육앱", shortLabel: "악기 교육", tone: "edu",
    description: "코드, 운지, 음계를 단계별로 익히는 학습 앱", preview: "기타 코드 · 우쿨렐레 코드 · 칼림바 · 색소폰" },
  "music-game": { label: "음악 게임앱", shortLabel: "음악 게임", tone: "play",
    description: "리듬과 연주 감각을 키우는 게임형 앱", preview: "난타 · 드럼 비트 · 텅드럼 · 칼림바" }
} as const satisfies Record<AppCategory, { label: string; shortLabel: string; tone: CategoryTone; description: string; preview: string }>;

export const isAppCategory = (v: string): v is AppCategory => (APP_CATEGORIES as readonly string[]).includes(v);
```
```ts
// apps.ts
import type { AppCategory } from "./categories";
export type AccessTier = "public" | "member";

export type LessonApp = {
  id: string;
  name: string;
  description: string;
  icon: string;                 // /icons/<id>.webp
  url: string;                  // 외부 배포 URL — UI에 직접 렌더 금지, /go/[id] 경유
  categories: readonly AppCategory[];   // 복수 카테고리 허용 → 중복 항목 제거
  access: AccessTier;
};

export const LESSON_APPS: readonly LessonApp[] = [
  { id: "guitar-chord", name: "기타 코드 배우기", description: "기타 기본 코드와 손가락 위치를 빠르게 확인하며 연습합니다.",
    icon: "/icons/guitar.webp", url: "https://guitar-chord-viewer.vercel.app/", categories: ["instrument-education"], access: "public" },
  { id: "ukulele-chord", …, access: "public" },
  { id: "tongue-drum", name: "텅드럼", …, url: "https://tonguedrum-play.vercel.app/", categories: ["instrument-education", "music-game"], access: "member" },
  { id: "kalimba",     name: "칼림바", …, url: "https://kalimba-play.vercel.app/",   categories: ["instrument-education", "music-game"], access: "member" },
  // miniharp, saxophone, ocarina, panflute, violin, cello, flute, metronome → instrument-education / member
  // nanta, drum → music-game / member
] as const;

export const getApp = (id: string) => LESSON_APPS.find((a) => a.id === id) ?? null;
export const getAppsByCategory = (c: AppCategory) => LESSON_APPS.filter((a) => a.categories.includes(c));
```
```ts
// access.ts
import type { LessonApp } from "./apps";
export type UserRole = "guest" | "member" | "admin";
export const normalizeRole = (role: unknown): UserRole => (role === "admin" ? "admin" : role === "member" ? "member" : "guest");
export const canOpenApp = (app: Pick<LessonApp, "access">, role: UserRole) => role !== "guest" || app.access === "public";
export const canAccessAdminPage = (role: UserRole) => role === "admin";
export const roleLabel = (role: UserRole) => ({ guest: "게스트", member: "회원", admin: "관리자" })[role];
```
```ts
// stats.ts
export function getCategoryStats(category: AppCategory) {
  const apps = getAppsByCategory(category);
  const publicCount = apps.filter((a) => a.access === "public").length;
  return { total: apps.length, publicCount, lockedCount: apps.length - publicCount };
}
```
- `categoryLabel` 필드 제거(E-1), `CATEGORY_LABELS`/`getCategoryLabel` 제거(E-2), 중복 항목 통합(E-3). 중복 통합으로 "전체 앱"이 16 → 14가 되는 것은 **의도된 정정**이며 README에 기록.
- 카탈로그 무결성 테스트 추가: id 유일성, url `https://`로 시작, icon 파일 존재(`fs.existsSync(public/…)`), description ≥ 12자, categories 비어있지 않음.

#### Step 3.2 서버 접근 게이트 `/go/[appId]`

**변경 파일**: `src/app/go/[appId]/route.ts`(신규)

```ts
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserProfile } from "@/features/auth/service";
import { canOpenApp } from "@/features/catalog/access";
import { getApp } from "@/features/catalog/apps";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const app = getApp(appId);
  if (!app) return NextResponse.json({ error: "unknown app" }, { status: 404 });

  const profile = await getCurrentUserProfile();
  const role = profile?.role ?? "guest";
  if (!canOpenApp(app, role)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `/go/${app.id}`);
    login.searchParams.set("notice", "required");
    return NextResponse.redirect(login, 302);
  }
  // Phase 8: 여기서 app_opens 기록
  return NextResponse.redirect(app.url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
```
- `AppCard`의 "시작" 링크 → `href={`/go/${app.id}`}` (`target="_blank"` 유지 시 새 탭에서 302). 잠김 링크 → `/login?next=/go/<id>`.
- 홈/카테고리의 "이어 학습하기" 카드도 동일하게 `/go/`.
- **외부 URL이 HTML에 단 한 번도 나타나지 않는다**(검증: 빌드 결과 `.next/server/app/**/*.html|rsc` grep).

#### Step 3.3 Supabase DB 타입

```bash
npx supabase login
SUPABASE_PROJECT_ID=<ref> npm run db:types
```
- `src/lib/supabase/server.ts`: `createServerClient<Database>(…)`. `profiles` 쿼리 결과가 타입 보장.

#### Step 3.4 DB 하드닝 마이그레이션 (A-6, A-7, A-8)

**변경 파일**: `supabase/migrations/202610210001_profiles_hardening.sql`(신규). 기존 파일은 **수정하지 않는다**.

```sql
-- 1) 컬럼 단위 권한: role 은 사용자 본인이 바꿀 수 없다 (정책 서브쿼리 제거)
revoke update on public.profiles from authenticated;
grant update (email) on public.profiles to authenticated;

drop policy if exists "profiles_update_own_email_only" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 2) 관리자 판별 함수 (RLS 재귀 방지용 security definer)
grant usage on schema private to authenticated;
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;
grant execute on function private.is_admin() to authenticated;

-- 3) 관리자는 모든 프로필 열람 (Phase 8 관리 화면용)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using ((select private.is_admin()));

-- 4) 이메일 변경 동기화
create or replace function private.handle_user_email_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end; $$;
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users for each row execute function private.handle_user_email_update();

-- 5) 역할 변경 RPC (관리자만)
create or replace function public.set_profile_role(target_id uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if new_role not in ('member', 'admin') then raise exception 'invalid role'; end if;
  if target_id = (select auth.uid()) and new_role <> 'admin' then raise exception 'cannot demote self'; end if;
  update public.profiles set role = new_role where id = target_id;
end; $$;
revoke execute on function public.set_profile_role(uuid, text) from public, anon;
grant execute on function public.set_profile_role(uuid, text) to authenticated;

-- 6) 메타
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
```
- 적용: `supabase db push` (또는 SQL Editor). 적용 후 `supabase migration list`로 두 파일이 모두 "applied" 상태인지 확인.
- 검증 SQL(회원 토큰으로): `update profiles set role='admin' where id = auth.uid()` → **permission denied for column role**.

**Phase 3 완료 기준**
- [ ] `grep -rn "vercel.app" src/components src/app` 결과: `features/catalog/apps.ts`와 `go/[appId]/route.ts`만
- [ ] 카탈로그 무결성 테스트 통과, 앱 수 14
- [ ] 회원이 자기 role 변경 불가(SQL 검증), 관리자 RPC로만 가능
- [ ] `tsc` 에서 `profiles` 컬럼 오타가 타입 에러로 잡힘

---

### Phase 4 — UI 셸 · 탐색 · 정직한 콘텐츠 (1.5일)

> 목표: 라우트 그룹으로 셸 통일, 하단 탭 활성 상태, 가짜 데이터·장식 제거, 상태 화면 추가, 폰트·viewport.

#### Step 4.1 루트 레이아웃: 폰트 · viewport · 메타데이터

**변경 파일**: `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920", display: "swap", variable: "--font-pretendard"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Lesson Designer", template: "%s · Lesson Designer" },
  description: "악기 교육앱과 음악 게임앱을 연결하는 수업 허브",
  applicationName: "Lesson Designer",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lesson Designer" }
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#3f5fd8"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Step 4.2 라우트 그룹과 AppShell

**변경 파일**: `src/app/(app)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/components/shell/{AppShell,AppHeader,BottomNav}.tsx`

```tsx
// src/app/(app)/layout.tsx
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentUserProfile } from "@/features/auth/service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();   // cache()로 page와 공유
  return <AppShell profile={profile}>{children}</AppShell>;
}
```
```tsx
// AppShell.tsx (server)
export function AppShell({ profile, children }: { profile: CurrentUserProfile | null; children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <AppHeader profile={profile} />
      <main id="main" className={styles.main}>{children}</main>
      <BottomNav role={profile?.role ?? "guest"} />
    </div>
  );
}
```
```tsx
// BottomNav.tsx ("use client")
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, GraduationCap, Home, Shield } from "lucide-react";
import type { UserRole } from "@/features/catalog/access";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { href: "/", label: "홈", icon: Home, match: (p: string) => p === "/" },
  { href: "/category/instrument-education", label: "악기", icon: GraduationCap, match: (p: string) => p.startsWith("/category/instrument-education") },
  { href: "/category/music-game", label: "게임", icon: Gamepad2, match: (p: string) => p.startsWith("/category/music-game") },
  { href: "/admin", label: "관리", icon: Shield, match: (p: string) => p.startsWith("/admin"), adminOnly: true }
] as const;

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="주 메뉴">
      {ITEMS.filter((i) => !("adminOnly" in i) || role === "admin").map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} className={styles.item} aria-current={active ? "page" : undefined} data-active={active || undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```
```css
/* BottomNav.module.css */
.nav { position: sticky; bottom: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 8px;
  padding: 10px 16px calc(12px + var(--safe-b)); background: rgba(255,255,255,.94); border-top: 1px solid var(--c-line); backdrop-filter: blur(12px); }
.item { min-height: var(--tap); display: grid; place-items: center; gap: 3px; border-radius: var(--r-md);
  color: var(--c-text-muted); font-size: var(--fs-xs); font-weight: 800; }
.item[data-active] { color: var(--c-brand); background: var(--c-brand-soft); }
.item:focus-visible { outline: 3px solid color-mix(in srgb, var(--c-brand) 35%, transparent); outline-offset: 2px; }
```
- `(auth)/layout.tsx`: 헤더·탭 없이 같은 `--shell-max` 컬럼, 상단에 "← 홈" 링크만.
- `AppHeader`: 가짜 상태바 블록 삭제(C-1/F-1), 퀵탭 삭제(C-3), 계정 칩은 §5.4 규칙.

#### Step 4.3 홈 화면 재구성 (가짜 데이터 제거)

**변경 파일**: `src/app/(app)/page.tsx`

- 삭제: `progressHero`(스트릭/XP), `continueSection`의 "60%", `dashboardStats`의 "LD 수업 허브" 장식 타일.
- 대체 구성(실데이터만):
  1. 인사 히어로: `profile ? `${roleLabel} 계정으로 모든 앱을 열 수 있어요` : "로그인하면 회원용 앱 12개가 열려요"` + CTA(게스트: 로그인/가입, 회원: 악기 교육 보기).
  2. 카테고리 카드 2개(`CategoryCard`, `stats` 포함).
  3. "바로 시작" 가로 스크롤: `access:"public"` 앱 (게스트) / 최근 열어본 앱(Phase 8 이후).
  4. 통계 3칸: 전체 / 공개 / 회원용 (모두 카탈로그에서 계산).
- `<h1>`은 "Lesson Designer"(시각적으로는 작게) 또는 인사 문구 — 가짜 지표가 h1이 되지 않도록.

#### Step 4.4 카테고리 화면

**변경 파일**: `src/app/(app)/category/[category]/page.tsx`

- `generateMetadata`: `{ title: meta.label }`.
- `generateStaticParams`는 쿠키 의존 렌더라 효과 없음 → 대신 **Suspense 분리**: 카탈로그 히어로/그리드(정적 부분)는 즉시, 역할 의존 요소(잠금 표시)는 `<Suspense fallback={<GridSkeleton/>}>` 안의 서버 컴포넌트 `RoleAwareGrid`에서 렌더.
- 본문 `mobileTabBar` 삭제(C-3). 상단 "← 홈" 링크 유지.
- 추천 카드는 `apps.find(canOpenApp)` (Phase 1) → Phase 8 이후 "최근 열어본 앱".

#### Step 4.5 상태 화면

**변경 파일**: `src/app/(app)/loading.tsx`, `src/app/not-found.tsx`, `src/app/error.tsx`("use client"), `src/app/(app)/admin/page.tsx`

- `not-found.tsx`: 셸 컬럼 안에서 "찾을 수 없는 화면입니다" + 홈 버튼.
- `error.tsx`: `reset()` 버튼 + 에러 digest 표시(원문 노출 금지).
- `/admin`: 비로그인 → `/login?next=/admin`, 회원 → 403 안내(`AccessDenied` 컴포넌트), 관리자 → 현재 카탈로그 요약 + "회원 관리(Phase 8 예정)" 영역.

#### Step 4.6 `AppCard` 정리

```tsx
<article className={styles.card} data-tone={tone} data-locked={!allowed || undefined}>
  <div className={styles.top}>
    <span className={styles.iconWrap}><Image src={app.icon} alt="" width={56} height={56} sizes="56px" /></span>
    <span className={styles.status} data-state={allowed ? "open" : "locked"}>
      {allowed ? <Play size={12} aria-hidden /> : <LockKeyhole size={12} aria-hidden />}
      {allowed ? "열림" : "회원용"}
    </span>
  </div>
  <h3 className={styles.title}>{app.name}</h3>
  <p className={styles.desc}>{app.description}</p>
  {allowed
    ? <Link href={`/go/${app.id}`} target="_blank" rel="noreferrer" className={styles.action}>시작 <span className="sr-only">(새 창에서 열림)</span></Link>
    : <Link href={`/login?next=/go/${app.id}&notice=required`} className={styles.action} data-variant="locked">로그인하고 열기</Link>}
</article>
```
- 진행률 바 삭제(실데이터 없음). 상태 배지는 아이콘+텍스트(색만으로 구분 금지, F-2). 카드 제목은 `h3`(섹션 `h2` 하위).

**Phase 4 완료 기준**
- [ ] 소스에 `9:41`, `XP`, `60%`, `0일 연속` 문자열 0건
- [ ] 어떤 화면에서든 하단 탭의 활성 항목이 현재 경로와 일치(`aria-current="page"`)
- [ ] 로그인/가입/404/에러 화면이 앱 셸과 같은 폭·폰트·토큰 사용
- [ ] Lighthouse(모바일) Accessibility ≥ 95, 모든 인터랙티브 요소 ≥ 44px
- [ ] iOS Safari에서 하단 탭이 홈 인디케이터와 겹치지 않음

---

### Phase 5 — CSS 아키텍처 재구축 (1.5일)

> 목표: 2,048줄 → ≤ 900줄, `:root` 1개, 컴포넌트별 CSS Modules, 데드 코드 0.

#### Step 5.1 문자열 테스트 제거

`src/lib/__tests__/ui-css.test.ts`, `motion-css.test.ts` **삭제**. 대체는 Phase 6의 Playwright 시각 스냅샷.

#### Step 5.2 토큰·베이스 분리

**변경 파일**: `src/styles/tokens.css`(§5.5), `src/styles/base.css`, `src/app/globals.css`

```css
/* base.css */
*, *::before, *::after { box-sizing: border-box; }
html { min-width: 320px; background: var(--c-canvas); -webkit-text-size-adjust: 100%; }
body { margin: 0; min-height: 100vh; min-height: 100dvh; color: var(--c-text); font-family: var(--font-sans); line-height: 1.5; }
a { color: inherit; text-decoration: none; }
button, input { font: inherit; }
img, svg { display: block; max-width: 100%; }
h1, h2, h3 { margin: 0; overflow-wrap: anywhere; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
:focus-visible { outline: 3px solid color-mix(in srgb, var(--c-brand) 40%, transparent); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```
```css
/* globals.css */
@import "../styles/tokens.css";
@import "../styles/base.css";
```

#### Step 5.3 셸 레이아웃 (베젤 제거, 반응형 복원)

```css
/* AppShell.module.css */
.shell { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; width: 100%; max-width: var(--shell-max);
  margin: 0 auto; background: var(--c-rail); }
.main { padding: 18px 16px 24px; }
@media (min-width: 600px) {
  .shell { min-height: calc(100dvh - 48px); margin-block: 24px; border-radius: var(--r-lg); box-shadow: var(--sh-card); overflow: clip; }
}
```
- 데스크톱에서는 베젤·노치 없이 **카드형 중앙 컬럼**. (디자인 검토용 베젤이 필요하면 `?frame=1`에서만 `data-frame` 속성으로 추가 — 기본값 아님.)

#### Step 5.4 컴포넌트별 모듈 작성 순서

| 순서 | 모듈 | 가져올 기존 규칙(`globals.css` 라인) | 버릴 규칙 |
|---|---|---|---|
| 1 | `AppHeader.module.css` | 1332-1402 (그라데이션 헤더, 계정 칩) | 131-264 (v1 헤더 전부), 1352-1367(상태바) |
| 2 | `BottomNav.module.css` | 1976-2005 | 1088-1111 (v1 푸터) |
| 3 | `CategoryCard.module.css` | 1655-1720 | 507-611 (v1 카테고리 버튼) |
| 4 | `AppCard.module.css` | 1841-1974 | 692-884 (v1 appCard), 1935-1957(진행률) |
| 5 | `AuthForm.module.css` | 904-1058 (구조 유지, 토큰명 교체) | — |
| 6 | `StatusBanner.module.css` | 1060-1086 | — |
| 7 | `Stat.module.css` | 1722-1747 | 650-684 (v1 permissionStrip) |
| 8 | 페이지 모듈 `home.module.css`, `category.module.css` | 1545-1633, 1749-1834 중 유지분 | 279-480 (히어로·오선지), 1479-1543(스트릭) |

- 색 테마는 `[data-tone="play"] { --c-tone: var(--c-play); --c-tone-soft: var(--c-play-soft); }`로 셸 루트에서만 전환.
- `font-weight` 는 400/600/700/800만 사용(950 제거).
- 각 모듈 완료 시 해당 v1·v2 규칙을 `globals.css`에서 **즉시 삭제** → 마지막엔 `@import` 두 줄만 남는다.

#### Step 5.5 Stylelint(선택)

`stylelint` + `stylelint-config-standard`로 `color-no-hex`(토큰 강제), `selector-max-specificity: 0,2,0`, `declaration-no-important` 규칙 적용 → D-3/D-5 재발 방지.

**Phase 5 완료 기준**
- [ ] `wc -l src/**/*.css` 합계 ≤ 900
- [ ] `grep -c ":root" src/styles/tokens.css` = 1, 다른 CSS 파일에 `:root` 0
- [ ] 모듈 외 CSS에서 hex 색상 0건(`tokens.css` 제외)
- [ ] Playwright 스냅샷(홈/카테고리×2/로그인) 기준선 생성 및 리뷰 승인

---

### Phase 6 — 테스트 · 품질 보증 (1일)

#### Step 6.1 서버 액션 단위 테스트 (G-1)

**변경 파일**: `src/app/auth/__tests__/actions.test.ts`

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();
const signUp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { signInWithPassword, signUp, signOut: vi.fn() } }) }));
vi.mock("@/lib/env", () => ({ getPublicEnv: () => ({ isConfigured: true, siteUrl: "http://localhost:3000" }) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));

const form = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f; };
const { loginAction, signUpAction } = await import("../actions");

describe("loginAction", () => {
  beforeEach(() => vi.clearAllMocks());
  it("rejects malformed email before calling supabase", async () => {
    const state = await loginAction({ message: "", tone: "idle" }, form({ email: "x", password: "123456" }));
    expect(state.tone).toBe("error");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
  it("maps supabase error codes to Korean", async () => {
    signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials", message: "Invalid login credentials" } });
    const state = await loginAction({ message: "", tone: "idle" }, form({ email: "a@b.co", password: "123456" }));
    expect(state.message).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
  });
  it("redirects to safe next on success and ignores open redirects", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    await expect(loginAction({ message: "", tone: "idle" }, form({ email: "a@b.co", password: "123456", next: "https://evil.com" })))
      .rejects.toThrow("REDIRECT:/");
    await expect(loginAction({ message: "", tone: "idle" }, form({ email: "a@b.co", password: "123456", next: "/go/kalimba" })))
      .rejects.toThrow("REDIRECT:/go/kalimba");
  });
});
```

#### Step 6.2 `/go/[appId]` 라우트 테스트

- `getCurrentUserProfile`를 mock하여 guest/member/admin × public/member 앱 6조합의 상태 코드·Location 헤더 단언.

#### Step 6.3 컴포넌트 테스트 교체 (G-3)

- `ui-upgrade.test.tsx` 삭제 → `BottomNav.test.tsx`(`usePathname` mock으로 `aria-current` 검증), `AppCard.test.tsx`(열림/잠김 링크가 `/go/`·`/login?next=`인지, 외부 URL이 DOM에 없는지), `AuthForm.test.tsx`(variant별 autocomplete, `role="alert"`).

#### Step 6.4 Playwright e2e + 시각 스냅샷 (G-4)

**변경 파일**: `playwright.config.ts`, `e2e/*.spec.ts`

- 시나리오 3개:
  1. **게스트**: 홈 → 악기 → 기타 코드 "시작" 클릭 시 새 탭 URL이 `guitar-chord-viewer` / 칼림바 카드 → 로그인 페이지(`next` 포함) / `/go/kalimba` 직접 접근 → 302 `/login`.
  2. **회원**: 로그인 → `next` 복귀 → 모든 카드 "시작" → `/admin` 접근 시 403 안내 → 로그아웃.
  3. **관리자**: 하단 탭에 "관리" 표시 → `/admin` 진입.
- 계정은 Supabase 로컬(`supabase start`) 또는 전용 테스트 프로젝트에 시드(`supabase/seed.sql`로 member/admin 2계정). CI에서는 `supabase start`를 서비스로 띄우거나, e2e는 `workflow_dispatch`로 분리.
- 시각 스냅샷: `expect(page).toHaveScreenshot()` 4장(홈/악기/게임/로그인, 390×844).

#### Step 6.5 접근성 자동 검사

- `@axe-core/playwright`로 각 화면 `violations.length === 0`(serious 이상).

#### Step 6.6 CSP enforce 전환

- Phase 1의 Report-Only 수집 결과 위반 0건이면 `Content-Security-Policy`로 전환. Next 인라인 스크립트 때문에 `script-src 'self' 'unsafe-inline'`이 필요하면 nonce 기반(`proxy.ts`에서 nonce 생성 → `headers`)으로 강화하거나 현 수준 유지 결정.

**Phase 6 완료 기준**
- [ ] 단위 테스트 ≥ 40케이스, `features/`·`app/auth`·`app/go` 라인 커버리지 ≥ 85%
- [ ] e2e 3시나리오 녹색, 스냅샷 기준선 커밋
- [ ] axe serious 위반 0

---

### Phase 7 — 저장소 · 에셋 정리 (0.5일)

#### Step 7.1 디자인 산출물 격리

```bash
mkdir -p design/exports design/mockups design/screenshots
git mv "Lesson Designer - "*.dc.html support.js design/exports/
git mv 1.png 2.png 3.png design/mockups/
git mv screenshots/* design/screenshots/ && rmdir screenshots
git mv "음악&악기 교육 앱 Vercel 링크.md" docs/app-links.md
git rm -r icons            # public/icons 와 바이트 단위 동일
git rm .thumbnail
```
- `아이콘/`(5.7MB, .ai 포함)은 저장소에서 제거하고 Google Drive 등 외부에 보관, `design/README.md`에 링크. (히스토리에서도 지우려면 `git filter-repo` — 선택.)
- `docs/superpowers/`는 `docs/history/`로 이동하고 README에 "초기 계획서, 현 코드와 불일치" 명시.

#### Step 7.2 아이콘 파이프라인 (E-7, I-2)

**변경 파일**: `scripts/optimize-icons.mjs`, `design/icons-src/` (원본 14종만)

```js
import sharp from "sharp";
import { readdirSync } from "node:fs";
const SRC = "design/icons-src", OUT = "public/icons", SIZE = 256;
for (const file of readdirSync(SRC)) {
  const name = file.replace(/\.(png|jpe?g)$/i, "");
  const base = sharp(`${SRC}/${file}`).resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await base.clone().webp({ quality: 88 }).toFile(`${OUT}/${name}.webp`);
  await base.clone().png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
}
```
- `drum`은 JPEG 원본이라 배경이 불투명 → 원본에서 배경 제거된 PNG(`아이콘/06 드럼…`가 아닌 별도 작업)로 교체 필요.
- 카탈로그 `icon`은 `/icons/<id>.webp`, `next/image`가 포맷 협상.

#### Step 7.3 `.gitignore`/`.gitattributes`

```
# .gitattributes
*.png binary
*.webp binary
*.dc.html -diff
```

**Phase 7 완료 기준**
- [ ] 저장소 루트에 소스·설정·docs·design·public·scripts·supabase 외 파일 없음
- [ ] `du -sh public/icons` ≤ 200KB, 모든 아이콘 256×256 정사각
- [ ] 클론 용량 < 2MB (히스토리 정리 시)

---

### Phase 8 — 확장 (선택, 2일+)

#### 8.1 실제 "이어서 학습하기" — 열람 기록

```sql
-- 202610xx0001_app_opens.sql
create table public.app_opens (
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id text not null,
  opened_at timestamptz not null default now(),
  open_count int not null default 1,
  primary key (user_id, app_id)
);
alter table public.app_opens enable row level security;
create policy "app_opens_own" on public.app_opens for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index app_opens_recent on public.app_opens (user_id, opened_at desc);
```
- `/go/[appId]`에서 로그인 사용자면 `upsert({ user_id, app_id, opened_at: now, open_count: open_count+1 })` (RPC `record_app_open(app_id)`로 원자적 증가).
- 홈 "이어서 학습하기" = 최근 `opened_at` 1건, 카드의 "진행률" 대신 "마지막 열람 n일 전 · n회".

#### 8.2 관리자 기능

- `/admin/members`: `profiles` 목록(Phase 3의 `profiles_select_admin` 정책) + 역할 변경 폼 → 서버 액션 → `rpc("set_profile_role")`.
- `/admin/apps`: 카탈로그를 DB(`apps` 테이블)로 옮길지 결정. 옮기면 `access` 토글·순서·노출 여부를 관리자가 편집, 코드 카탈로그는 시드로 전환.

#### 8.3 하위 앱 실제 보호 (A-2 근본 해결)

- 모든 하위 앱이 `*.vercel.app` 각기 다른 도메인이라 쿠키 공유 불가. 선택지:
  1. 커스텀 도메인 서브도메인 통일(`kalimba.lessondesigner.kr` 등) + Supabase 쿠키 도메인 `.lessondesigner.kr` → 하위 앱도 `@supabase/ssr`로 세션 확인.
  2. `/go`가 60초 유효 서명 토큰을 쿼리로 전달 → 하위 앱이 공개키로 검증 후 세션 쿠키 발급.
  3. 보호 가치가 낮다면(수업용 공개 도구) **회원 전용 표시를 "추천/정리" 의미로 재정의**하고 잠금 UX를 완화.
  → 제품 결정 사항. 결정 전까지는 `/go` 게이트가 "정책 선언" 역할.

#### 8.4 PWA

- `app/manifest.ts`(이름·아이콘·`display: standalone`), 설치 배너, 오프라인 셸(선택). `appleWebApp` 메타는 Phase 4에서 선반영.

---

## 7. 검증 체크리스트 및 수용 기준

### 7.1 보안·권한 (Phase 1·3 이후 매 릴리스)

| 검사 | 방법 | 기대 |
|---|---|---|
| 외부 앱 URL 미노출 | `npm run build && grep -rl "vercel.app" .next/server/app --include=*.html --include=*.rsc` | 매치 없음 |
| 게스트 잠긴 앱 | `curl -I localhost:3000/go/kalimba` | `302 Location: /login?next=…` |
| 회원 role 자기 변경 | SQL(회원 JWT) `update profiles set role='admin'` | permission denied |
| 오픈 리다이렉트 | `/login?next=https://evil.com` 로그인 | `/`로 이동 |
| 보안 헤더 | `curl -I` | nosniff / DENY / Referrer / Permissions / CSP |
| 프로필 조회 장애 | RLS 정책 일시 해제 후 로그인 | guest 표시 + 서버 로그 |

### 7.2 UX·모바일

- [ ] 390×844(iPhone), 360×800(Android), 768×1024(iPad), 1440×900(PC)에서 레이아웃 깨짐 없음
- [ ] 하단 탭 `aria-current` 정확, safe-area 반영
- [ ] 로그인 → `next` 복귀 1단계
- [ ] 404/에러/로딩 화면 셸 일관성
- [ ] 가짜 지표 0건

### 7.3 코드 품질

- [ ] `npm run verify` 통과 (typecheck · lint 0 warning · test · build)
- [ ] CSS ≤ 900줄, `:root` 1개, 모듈 외 hex 0
- [ ] 서버 액션 파일 ≤ 100줄, 함수 중복 0
- [ ] 미사용 export 0 (`npx knip` 권장)

### 7.4 성능 (Lighthouse 모바일, 4G 스로틀)

- [ ] Performance ≥ 90, LCP ≤ 2.0s, CLS < 0.05
- [ ] 페이지당 Supabase Auth 네트워크 호출 ≤ 1

---

## 8. 우선순위·의존관계·일정

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5 ──▶ Phase 6 ──▶ Phase 7
 (도구)      (핫픽스)     (인증)       (도메인)     (UI 셸)      (CSS)        (테스트)     (레포)
                 │                                     ▲
                 └──── 즉시 배포 가능 (독립) ──────────┘  Phase 8 은 3·4 이후 언제든
```

| Phase | 공수 | 배포 단위 | 전제 |
|---|---|---|---|
| 0 | 0.5일 | 즉시 | — |
| 1 | 0.5일 | **즉시(핫픽스 릴리스)** | 0 |
| 2 | 1일 | 2 단독 | 0, 1 |
| 3 | 1일 | 3 단독 (DB 마이그레이션 포함) | 2 |
| 4 | 1.5일 | 4+5 묶어서 권장 | 3 |
| 5 | 1.5일 | 4와 함께 | 4 |
| 6 | 1일 | 머지 전 필수 | 5 |
| 7 | 0.5일 | 언제든 | — |
| 8 | 2일+ | 기능 단위 | 3, 4 |

**리스크와 대응**

| 리스크 | 대응 |
|---|---|
| `getClaims()`가 프로젝트 키 설정상 왕복을 유발 | Step 2.1에서 키 유형 확인 후 결정. 측정: 서버 로그 타이밍 |
| 이메일 템플릿 변경 전에 Phase 2 배포 → 확인 링크 깨짐 | 템플릿 변경을 배포 **직전** 체크리스트에 포함, Redirect URL 등록 |
| Phase 5 중 디자인 회귀 | Step 5.1 전에 현 화면 스크린샷 기준선 저장, Vercel Preview로 비교 |
| 카탈로그 중복 통합으로 "앱 16개 → 14개" 문구 변화 | 의도된 정정임을 릴리스 노트에 명시 |
| 마이그레이션 파일 제자리 수정 이력으로 `db push` 충돌 | 새 파일로만 변경. 충돌 시 `supabase migration repair --status applied 202606170001` |

---

## 9. 부록

### 9.1 파일 변경 맵 (before → after)

| 현재 | 조치 | 목표 |
|---|---|---|
| `middleware.ts` | 삭제 | `proxy.ts` |
| `src/lib/supabase/middleware.ts` | 이동·수정 | `src/lib/supabase/proxy.ts` |
| `src/lib/auth.ts` | 대체 | `src/features/auth/service.ts` (cache, fail-closed) |
| `src/lib/auth-form-state.ts` | 삭제 | `src/features/auth/types.ts` |
| `src/lib/auth-validation.ts` | 이동·재작성 | `src/features/auth/validation.ts` |
| `src/lib/apps.ts` | 분할 | `src/features/catalog/{categories,apps,stats}.ts` |
| `src/lib/access.ts` | 이동·확장 | `src/features/catalog/access.ts` |
| `src/app/auth/actions.ts` | 재작성 | 동일 경로 (≤100줄) |
| `src/app/admin-login/page.tsx` | 삭제 | `/login?as=admin`(선택) |
| `src/app/page.tsx` 등 화면 | 이동 | `src/app/(app)/…` |
| `src/app/login`, `signup` | 이동 | `src/app/(auth)/…` |
| — | 신규 | `src/app/go/[appId]/route.ts`, `src/app/auth/confirm/route.ts` |
| — | 신규 | `src/app/(app)/loading.tsx`, `not-found.tsx`, `error.tsx` |
| `src/components/SiteHeader.tsx`, `SiteFooter.tsx` | 대체 | `components/shell/{AppShell,AppHeader,BottomNav}.tsx` |
| `src/components/CategoryButton.tsx` | 개명 | `components/catalog/CategoryCard.tsx` |
| `src/app/globals.css` (2,048줄) | 분해 | `styles/tokens.css` + `styles/base.css` + `*.module.css` |
| `src/lib/__tests__/ui-css.test.ts`, `motion-css.test.ts` | 삭제 | Playwright 스냅샷 |
| `src/components/__tests__/ui-upgrade.test.tsx` | 대체 | `BottomNav/AppCard/AuthForm.test.tsx` |
| `icons/`, `.thumbnail`, `1~3.png`, `screenshots/`, `*.dc.html`, `support.js` | 이동/삭제 | `design/**` |
| `아이콘/` | 저장소 외부 보관 | `design/README.md` 링크 |
| `supabase/migrations/202606170001_*.sql` | **불변** | + `202610210001_profiles_hardening.sql` |

### 9.2 삭제 대상 코드 요약

- CSS: v1 헤더(131-264), 히어로·오선지(279-480), v1 appCard(692-884), v1 푸터(1088-1111), v1 미디어쿼리 중 데드 부분, 상태바(1352-1367), 스트릭(1479-1543), 진행률(1935-1957), 키프레임 `staff-line-draw`/`playhead-sweep`/`note-pop`
- TS: `getCurrentRole`, `CATEGORY_LABELS`, `getCategoryLabel`, `adminLoginAction`, `LessonApp.categoryLabel`, `data-category`
- 테스트: CSS 문자열 테스트 2파일, "9:41"/"60%" 단언

### 9.3 명령어 모음

```bash
# Phase 0
npm ci && npm run verify
# Phase 2 (선택) Next codemod
npx @next/codemod@canary middleware-to-proxy .
# Phase 3
SUPABASE_PROJECT_ID=<ref> npm run db:types
supabase db push && supabase migration list
# Phase 5 검증
find src -name "*.css" | xargs wc -l | tail -1
grep -rn ":root" src --include=*.css
# Phase 6
npx playwright install --with-deps && npm run test:e2e
npx playwright test --update-snapshots      # 기준선 갱신(리뷰 후)
# 미사용 export 탐지
npx knip
```

### 9.4 결정이 필요한 항목 (리팩토링 전에 답을 정해야 하는 것)

1. **관리자 로그인 화면 유지 여부** — 권장: 삭제(단일 `/login`). 유지 시 `variant="admin"` 스타일만.
2. **데스크톱 베젤 유지 여부** — 권장: 제거(카드형 중앙 컬럼). 디자인 리뷰용 `?frame=1` 옵션.
3. **중복 앱(텅드럼·칼림바) 통합** — 권장: 통합(복수 카테고리). 분리 유지 시 별도 배포 URL 필요.
4. **하위 앱 보호 수준(8.3)** — 제품 결정. 결정 전까지 `/go` 게이트만.
5. **원본 아이콘(`아이콘/`) 보관처** — 저장소 밖(권장) vs Git LFS.

### 9.5 참고 자료

- Next.js 16 업그레이드 노트(필드 노트): https://dev.to/ahmed_mahmoud360/upgrading-to-nextjs-16-field-notes-from-two-production-apps-mj7 — `proxy.ts`, `next lint` 제거, Node ≥ 20.9, 이미지 `qualities` 변경
- Supabase SSR 세션 관리 가이드(2026): https://www.iloveblogs.blog/post/nextjs-supabase-ssr-session-management — `getClaims()` vs `getUser()`, `getAll/setAll` 쿠키 계약, Next 16 `proxy.ts`
- Supabase `getClaims` vs `getSession` 서버 측 주의: https://www.iloveblogs.blog/post/fix-supabase-getclaims-vs-getsession-server-auth
- 저장소: https://github.com/kimyounggaur/Lesson_Designer (커밋 `2374a98` 기준)
