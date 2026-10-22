# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: 0, 1, 2, 3, 4
- 진행 중 Phase: 5 (다음 세션)
- 현재 브랜치: refactor/phase-4-shell (base: refactor/phase-3-domain), 태그 `phase-4`
- 마지막 verify 결과: Phase 4 — typecheck ✓ lint ✓ test ✓(55) build ✓

## 사람 작업 대기 (Human TODO)
- [ ] **Phase 4**: `design/qa/phase4/*.png` 스크린샷과 Vercel Preview 로 디자인 검토(P-D 프롬프트 권장). 특히 ① 홈 히어로를 흰 카드로 둔 선택 ② 카테고리 화면에서 헤더(브랜드 블루) + 히어로(카테고리 톤) 조합 — 헤더 톤 전환은 Phase 5
- [ ] **Phase 4**: Lighthouse 모바일 Accessibility 측정(이 환경에서는 실행 불가 → 미측정). `npx lighthouse http://localhost:3000 --only-categories=accessibility`
- [ ] **Phase 3**: `supabase/migrations/202610220001_profiles_hardening.sql`을 Supabase SQL Editor에서 적용(이메일 동기화 트리거 + `set_profile_role` RPC, 추가 전용). 적용 후 파일 하단의 확인 SQL 실행. 자동 적용은 플랫폼 정책(프로덕션 배포)으로 차단됨.
- [ ] **Phase 3**: 공유 DB(ScoreForge) 영향 검토 후 `profiles` 컬럼 권한 축소 적용 여부 결정 (DECISIONS O2)
- [ ] **Phase 2 배포 전 필수**: Supabase → Authentication → Email Templates → *Confirm signup* 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경
- [ ] **Phase 2 배포 전 필수**: Authentication → URL Configuration — Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**`
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록

## 발견 사항 (범위 밖이라 보류한 문제)
- **Phase 5로 넘기는 레거시 CSS 범위** (`src/app/globals.css`, 2026-10-22 Phase 4 종료 시점 라인 기준 — 총 2,051줄. 1~3행은 `@import`+주석, 그 아래 전부 레거시):

  | 새 모듈 | 대체한 globals.css 규칙(라인) | 함께 버릴 규칙 |
  |---|---|---|
  | `components/shell/AppShell.module.css` | `.deviceStage`/`.phoneFrame` 1324-1341, `.homeShell.appMain`/`.pageShell.appMain` 1482-1488, 520px 미디어쿼리 2016-2036 | v1 `.homeShell/.pageShell/.authShell` 269-279, `body` 재정의 1317-1322 |
  | `components/shell/AppHeader.module.css` | `.siteHeader.appHeader` ~ `.iconLogoutButton` 1343-1440 (상태바 1363-1378 는 옮기지 않음) | v1 헤더 132-267, `.appQuickNav`/퀵탭 1442-1480 |
  | `components/shell/BottomNav.module.css` | `.bottomNav.siteFooter` ~ `.bottomNav a:first-child` 1979-2008 | v1 `.siteFooter` 1100-1123 |
  | `components/catalog/CategoryCard.module.css` | `.categoryStack`/`.categoryButton.appCategoryCard` 1653-1723 | v1 `.categoryButton*` 502-612 |
  | `components/catalog/AppCard.module.css` + `AppGrid.module.css` | `.appGrid`/`.appTile` ~ `.tileAction.lockedAction` 1839-1977 (진행률 1938-1960 제외) | v1 `.appGrid`/`.appCard` 687-885, `.emptyState` 886-902 |
  | `components/ui/Stat.module.css` | `.dashboardStats`/`.heroStatRow` 1725-1750, `.categoryHero .heroStatRow*` 1780-1793 | v1 `.permissionStrip` 651-685 |
  | `app/(app)/home.module.css` | `.progressHero`~`.continuePlay` 1490-1636 (가짜 지표), `.compactHeading` 1638-1651 | 히어로·오선지 280-480, 키프레임 `staff-line-draw`/`playhead-sweep`/`note-pop` |
  | `app/(app)/category/[category]/category.module.css` | `.categoryHero` 1752-1793, `.mobileTabBar`/`.featuredLesson`/`.appPermissionStrip`/`.appListSection`/`.appListHeading` 1795-1837, `.backLink` 618-625 + 2010-2014 | — |
  | `app/(auth)/auth-layout.module.css`, `app/status.module.css` | (신규) | — |
  | **Phase 5에서 만들 것**: `AuthForm.module.css` ← 904-1070 (`.authShell`~`.authSwitch a`, 44px 타깃 유지), `StatusBanner.module.css` ← 1072-1098 | `:root` 1~2벌(4-43, 1300-1315), `@keyframes ld-fade-up`, 760px/1040px 미디어쿼리 |

  Phase 5 완료 시 `globals.css` 는 `@import tokens.css` + `@import base.css` 두 줄만 남긴다. `.sr-only` 는 현재 각 모듈의 `.srOnly` 로 중복 정의되어 있으니 `base.css` 의 전역 `.sr-only` 로 통합.
- 레거시 `h1,h2,h3 { font-family: var(--font-display) }`·`h1 { font-size: 64px }`·`body { font-family: var(--font-body) }` 가 아직 전역에 살아 있어, 새 모듈은 루트(`.shell`/`.column`/`.screen`)에서 `font-family: var(--font-sans)` 와 `:is(h1,h2,h3) { font-family: inherit }` 로 막고 있다. Phase 5 `base.css` 로 흡수하면 이 방어 규칙은 지워도 된다.
- `(auth)/auth-layout.module.css` 의 `.column :global(.authShell)` 재정의는 AuthForm 모듈화(Phase 5) 와 함께 제거.
- `next/link` 가 `/go/[appId]` 를 프리페치하면 302 를 따라가 **외부 앱까지 미리 요청**한다(Phase 3 부터 있던 문제, Playwright 네트워크 로그로 발견) → 모든 `/go` 링크에 `prefetch={false}` 적용. Phase 8.1 열람 기록을 `/go` 에 넣을 때도 이 설정을 유지해야 한다(프리페치가 열람으로 기록되면 안 됨).
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

### 2026-10-22 Phase 4 — UI 셸 · 탐색 · 정직한 콘텐츠 (브랜치 refactor/phase-4-shell, 태그 phase-4)
- 완료 Step: 4.0, 4.0.5(tokens.css), 4.1(C-9, C-5 viewport, C-11 metadataBase), 4.2(라우트 그룹 + AppShell/AppHeader/BottomNav — C-2, C-3, C-4/D2, C-5, C-6, F-1), 4.3(홈 — C-1, F-2, F-3), 4.4(카테고리 — C-3, C-11, Suspense), 4.5(loading/not-found/error/AccessDenied/admin — C-8), 4.6(AppCard/AppGrid/CategoryCard/Stat 모듈 — F-5, C-10), 4.7(테스트 교체 — G-3)
- verify: typecheck ✓ lint ✓ test ✓(55 = 53 − 3 삭제 + 5 추가) build ✓
- 수용 기준(`next start -p 3100`): `/ /category/instrument-education /category/music-game /login /nope` → 200 200 200 200 404 / `/category/music-game` 의 `aria-current="page"` 1건('게임') / 홈·카테고리 HTML 에 `vercel.app` 0건 / `/go/kalimba` 게스트 → 302 `/login?next=%2Fgo%2Fkalimba&notice=required` / `/admin` 게스트 → 307 `/login?next=/admin` / grep: 가짜 데이터(9:41·XP·60%·0일 연속·10/50) 0, `font-weight: 9xx` 0, SiteHeader/SiteFooter/CategoryButton 참조 0
- 스크린샷(Playwright, Chromium headless, DPR 2): `design/qa/phase4/mobile-home.png`, `mobile-instrument-education.png`, `mobile-music-game.png`, `mobile-login.png`(390×844), `desktop-home.png`(1280×800, 베젤 없음·카드형 컬럼), `mobile-instrument-education-scrolled.png`(스크롤 끝에서도 하단 탭이 뷰포트 하단), `mobile-not-found.png`. 베젤·상태바·퀵탭 DOM 0건. 모든 페이지에서 가시 인터랙티브 요소(a/button/input) 최소 높이 **44px** (`getBoundingClientRect` 측정)
- Lighthouse Accessibility: **미측정**(환경에 Chrome/lighthouse 없음). 수동 확인: 모든 `<img>` alt 보유(장식 아이콘 `alt=""`), `<nav aria-label="주 메뉴">`, 헤딩 h1→h2→h3 계층, 상태바·진행률 가짜 요소 없음, 로딩은 `role="status"` 1회만 안내
- 가정/우회:
  - **체크포인트 커밋 순서 조정**: 홈·카테고리 재구성이 새 catalog 컴포넌트에 의존하므로 `refactor(catalog-ui)` 를 `feat(nav)` 다음, `refactor(home)` 앞에 커밋(메시지는 프롬프트북 그대로). 스크린샷 확인 후 `fix(ui)` 커밋 1개 추가
  - **목업(1~3.png) vs 설계문서**: 목업은 제목 + 카드 목록만 있는 최소 구성이고 설계 Step 4.3/4.4 는 히어로·바로 시작·Stat 까지 요구 → 설계문서 우선. 목업의 '카드 2열 + 이름' 리듬은 AppGrid 가 유지. 목업에 있는 리코더·카혼·젬베·텅드럼 리듬 게임은 카탈로그에 없는 앱이라 반영하지 않음
  - **레거시 globals.css 최소 수정**(삭제는 Phase 5): ① 1행 `@import tokens.css` ② 검증 grep 기준을 맞추기 위해 `font-weight: 950/900` 23건 → 800, 가짜 진행률 `.miniProgressTrack span { width: 60% }` 블록 삭제 ③ C-10 터치 타깃 — `.iconOnlyButton` 34→44px, `.authSwitch a` 44px 규칙 추가(AuthForm 이 아직 레거시 클래스를 쓰기 때문)
  - 헤더 톤 전환은 Phase 5 로 미루고(`AppShell` 은 `tone?` prop 만 받음, 레이아웃에서 전달하지 않음) 카테고리 페이지 루트·CategoryCard·AppCard 가 각자 `data-tone` 을 단다. 그래서 카테고리 화면은 '브랜드 블루 헤더 + 톤 색 히어로' 조합
  - `appOpenHref/appLoginHref` 를 `components/AppCard.tsx` 에서 `features/catalog/links.ts` 로 이동. 잠긴 앱 링크 형식을 `/login?required=1&next=…` → `/login?next=%2Fgo%2F<id>&notice=required` 로 통일(테스트 스펙·`/go` 게이트와 동일). 로그인 화면은 `required=1` 도 계속 인식
  - 홈 히어로는 가짜 지표 블록 대신 **흰 카드**(h1 'Lesson Designer' 작게 + 태그라인 + 역할별 안내 + CTA). 헤더(브랜드 블루) 바로 아래 또 블루 블록을 두지 않기 위한 선택 — 디자인 검토 대상
  - '바로 시작' = `LESSON_APPS.filter(canOpenApp).slice(0, 4)` (게스트는 공개 앱 2개). 카테고리 '이어 학습하기' 는 `firstOpenableApp` + '바로 열기'(진행률 없음), 게스트 음악 게임에는 열 수 있는 앱이 없어 섹션 숨김
  - `.sr-only` 전역 규칙이 레거시 시트에 없어 각 모듈에 `.srOnly` 를 두었다(Phase 5 base.css 로 통합)
  - AuthForm 하단의 '홈으로 돌아가기' 링크 삭제(레이아웃 상단 '← 홈' 과 중복). AuthForm 모듈화 자체는 Phase 5
  - `GridSkeleton` 추가(프롬프트 목록 밖 컴포넌트 — Suspense fallback 과 loading.tsx 가 공유)
  - 스크린샷은 `next start -p 3100` 프로덕션 서버 기준. 이 환경의 Playwright(1.64) 와 사전 설치 Chromium(r1194) 버전이 달라 `executablePath` 로 헤드리스 셸을 직접 지정
- 다음: Phase 5 (CSS 아키텍처 재구축). 위 '발견 사항' 의 라인 맵 참조

### 2026-10-22 Phase 3 — 도메인·데이터 계층 (브랜치 refactor/phase-3-domain)
- 완료 Step: 3.1(E-1~E-4, D3), 3.2(A-2 게이트), 3.3(E-5), 3.4(A-7 + RPC — 파일만, 적용은 Human TODO), 3.5(E-6, typedRoutes, README)
- verify: typecheck ✓ lint ✓ test ✓(53) build ✓
- 수용 기준(`next start`): 빌드 결과 HTML/RSC에 `vercel.app` 0건 / `/go/kalimba` 게스트 → 302 `/login?next=%2Fgo%2Fkalimba&notice=required` + `cache-control: no-store` / `/go/guitar-chord` → 302 외부 URL / `/go/nope` → 404 / 홈·카테고리 페이지 `vercel.app` 0건 / 카드 링크 `/go/<id>`, 잠김 `/login?required=1&next=%2Fgo%2F<id>`
- **중요 발견**: Supabase 프로젝트가 ScoreForge와 공유됨. `profiles` 실제 스키마·정책이 저장소 마이그레이션과 다름(DECISIONS O2에 기록). 설계의 권한 축소는 보류, 추가 전용 마이그레이션만 작성. `apply_migration` 시도는 플랫폼 정책으로 거부됨 → 사람 적용.
- 가정/우회: `typedRoutes` 활성화에 따라 계산된 href는 `as Route` 캐스팅(appOpenHref/appLoginHref/switchHref/redirect). DB 타입은 MCP로 생성해 커밋(`set_profile_role`은 마이그레이션 적용 후 재생성 필요).
- 다음: Phase 4

### 2026-10-22 Phase 2 — 인증·세션 계층 (브랜치 refactor/phase-2-auth)
- 완료 Step: 2.1(B-7), 2.2(B-8, B-10), 2.3(B-6, B-3), 2.4(B-3), 2.5(B-5, F-4), 2.6(B-9, D1)
- verify: typecheck ✓ lint ✓ test ✓(40) build ✓ (`next build` 출력에 middleware 경고 없음)
- 수용 기준(`next start`): `/admin-login` → 308 `/login` / `?notice=required|confirm-failed` 문구 렌더 / 가입↔로그인 교차 링크가 `next` 유지 / `/auth/confirm` 파라미터 없음 → 303 `/login?notice=confirm-failed` / StatusBanner `role="status"`
- 가정/우회:
  - D6 미확인 → 프록시는 `getUser()` 유지. Auth API 호출 수는 .env 없이 측정 불가(미측정) — 구조상 레이아웃·페이지가 `cache()`를 공유하므로 요청당 `getUser` 1회(프록시 1회 별도).
  - `@next/codemod middleware-to-proxy`가 루트 파일을 변환했고, lib 헬퍼는 수동 이동.
  - `npm run typecheck`를 `next typegen && tsc --noEmit`로 변경: `.next/types`가 삭제된 라우트를 참조해 stale 오류를 내는 문제 해결.
  - `verifyOtp` 성공 시 세션이 생기면 `next`로, 아니면 `/login?notice=confirmed`로 분기(설계 Step 2.4 보강).
  - `.next` 디렉터리는 라우트 삭제 후 stale manifest를 남기므로 로컬 확인 시 `rm -rf .next` 후 빌드 필요(배포 환경은 항상 클린 빌드).
- 다음: Phase 3

### 2026-10-22 Phase 1 — 긴급 수정 (브랜치 refactor/phase-1-hotfix)
- 완료 Step: 1.1(A-1), 1.2(B-1), 1.3(A-3), 1.4(A-4), 1.5(B-2), 1.6(A-5), 1.7(B-4)
- verify: typecheck ✓ lint ✓ test ✓(37, +16) build ✓
- 수용 기준(프로덕션 빌드 `next start`로 확인): music-game에 `nanta-play` 0건 / instrument-education에 공개 앱 URL 노출 / 보안 헤더 5종 / `/login?next=` hidden input 1개, `https://evil.com` → `/` 정규화 / 게스트 `/admin` → 307 `/login?next=/admin`
- 가정/우회:
  - `typedRoutes`는 Phase 3(`/go` 링크 정리 후)으로 미룸(설계 Step 1.6 허용 범위).
  - `/admin-login`과 `adminLoginAction`은 유지하되 비관리자 `signOut()`만 제거(Phase 2에서 삭제).
  - 새 유틸 `src/lib/auth-errors.ts`, `src/lib/safe-next.ts` (Phase 2에서 features/auth 로 이동).
- 사람 작업: PR 생성 → Vercel Preview에서 위 curl 재확인 → **프로덕션 배포(핫픽스)**.
- 다음: Phase 2

### 2026-10-22 Phase 0 — 안전망 구축 (브랜치 refactor/phase-0-tooling)
- 완료 Step: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6
- verify: typecheck ✓ lint ✓ test ✓(21) build ✓
- 가정/우회:
  - npm 10.9.4 arborist가 vitest ≥4.1.11의 optional peer 집합에서 크래시(`edgesOut` null) → `.npmrc legacy-peer-deps=true` + `@testing-library/dom` 명시. `@vitejs/plugin-react`는 같은 이유로 제외(테스트는 tsconfig `jsx: react-jsx`로 이미 동작).
  - `npm audit`: next 16.2.9의 critical 권고(프록시 우회·RCE 등) → 같은 메이저 내 16.4.2로 상향(설계는 메이저 고정만 요구). postcss override 8.5.15 → ^8.5.31. 남은 경고는 stylelint 개발 도구 체인(braces/micromatch ReDoS)뿐.
  - `vitest.config.ts` → `.mts` (Vite native config loader ESM 경고 제거).
  - TS 6: `baseUrl` 제거, `paths`를 tsconfig 상대 경로로.
  - 이 환경에서는 `npm install --ignore-scripts`로 설치(샌드박스). sharp는 prebuilt 바이너리(@img/*)가 optional dep으로 들어와 postinstall 없이 동작 예정.
- 발견 사항: 없음(범위 밖 문제는 설계문서에 이미 수록)
- 다음: Phase 1

### 2026-10-22 P-00 / P-01 설치
- 완료: CLAUDE.md, PROGRESS.md, DECISIONS.md 생성. 설계문서·프롬프트북을 `docs/refactor/`에 배치.
- 환경: Node 22.22, npm 10.9, Next 16.2.9, React 19.2.7, TS 6.0.3. push 권한 있는 클론 `/home/claude/lesson_designer`.
- Supabase MCP: 프로젝트 `lesson-designer`(cgoafcjvnbzozxbbyfle) 확인. DB 쿼리는 연결 타임아웃 → Phase 3에서 재시도.
- 다음: Phase 0.
