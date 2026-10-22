# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: 0, 1, 2, 3, 4, 5, 6, 7
- 진행 중 Phase: (없음 — Phase 8 은 선택)
- 현재 브랜치: refactor/phase-7-repo (base: refactor/phase-6-quality), 태그 `phase-7`
- 마지막 verify 결과: Phase 7 — typecheck ✓ lint(eslint+stylelint) ✓ test ✓(108) build ✓ / e2e 18 passed · 2 skipped

## 사람 작업 대기 (Human TODO)
- [ ] **Phase 7**: `design/README.md` 의 Drive 링크 기입(원본 아이콘 외부 보관). 복구는 `git checkout phase-6 -- 아이콘`
- [ ] **Phase 7**: 드럼 아이콘 배경 제거 PNG 원본, 첼로 전용 아이콘(현재 바이올린과 동일 파일) 제공 → `design/icons-src/` 교체 후 `npm run icons:build`
- [ ] **스택 PR 머지 순서**: phase-0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 (각 PR 의 base 는 직전 브랜치, GitHub 이 머지 후 자동으로 base 를 재지정)
- [ ] **Phase 6 (D8)**: e2e 전용 Supabase 프로젝트(또는 로컬 `supabase start`)에 member/admin 계정 2개 생성 → GitHub Secrets 등록: `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` **+ `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`**(e2e job 이 프로덕션 서버를 이 값으로 빌드함. 가정 — 아래 세션 로그). 없으면 member/admin 스펙은 CI 에서 계속 skip.
- [ ] **Phase 6 CSP**: enforce 전환 후 첫 배포에서 Vercel 로그·브라우저 콘솔의 "Content Security Policy" 메시지 확인. **Vercel Preview 의 툴바(`vercel.live`)는 현재 정책에 막힌다**(팀원에게만 보이는 기능, 최종 사용자 영향 없음) — Preview 코멘트 기능이 필요하면 `script-src/connect-src/frame-src` 에 `https://vercel.live` 추가 여부 결정.
- [ ] **Phase 6 시각 기준선**: `e2e/visual.spec.ts-snapshots/*.png` 는 이 환경의 Chromium r1194(headless shell)로 만들었다. CI 의 Playwright 1.64 번들 Chromium 과 안티앨리어싱이 달라 첫 CI 가 visual 스펙에서 1% 이상 차이로 실패할 수 있음 → 그러면 CI 아티팩트(또는 로컬 `npx playwright test e2e/visual.spec.ts --update-snapshots`)로 기준선을 CI 브라우저 기준으로 한 번 갱신해 커밋.
- [ ] **Phase 6 디자인 검토 추가 항목**: ① 보조 텍스트 색 `--c-text-muted` `#7b7f92` → `#666b80`(대비 3.96 → 5.28:1) ② "시작"/"바로 열기" 버튼이 시안 배경 위 **짙은 글자**(흰 글자 2.4:1 → 7.4:1) ③ (미수정) 카테고리 카드·카테고리 히어로의 흰 글자 — edu 그라데이션 밝은 끝 약 3.7:1, play(주황) 약 2.2~2.6:1 로 AA 미달. axe 는 그라데이션을 판정 못 해 "incomplete" 로만 남김. 글자색을 짙게 하거나 그라데이션 끝을 어둡게 하는 디자인 결정 필요(아래 발견 사항).
- [ ] **Phase 5**: `design/qa/phase5-before/` ↔ `phase5-after/` 를 나란히 놓고 P-D 디자인 검토 → Vercel Preview 승인. 확인 포인트 ① 버튼·통계 타일 라운드 8px → 15px(토큰값 복원, 아래 세션 로그 참조) ② 로그인 화면 토큰 매핑(제목 굵기 800, 링크·아이콘 색) ③ 헤더는 모든 화면에서 브랜드 블루 유지(결정) — 게임 카테고리에서 헤더까지 주황으로 바꾸고 싶으면 라우트 단위 톤 출처를 정해야 함
- [ ] **Phase 4**: `design/qa/phase4/*.png` 스크린샷과 Vercel Preview 로 디자인 검토(P-D 프롬프트 권장). 특히 ① 홈 히어로를 흰 카드로 둔 선택 ② 카테고리 화면에서 헤더(브랜드 블루) + 히어로(카테고리 톤) 조합 — Phase 5 에서 '헤더는 브랜드 톤 고정' 으로 결정
- [ ] **Phase 4**: Lighthouse 모바일 Accessibility 측정(이 환경에서는 실행 불가 → 미측정). `npx lighthouse http://localhost:3000 --only-categories=accessibility`
- [ ] **Phase 3**: `supabase/migrations/202610220001_profiles_hardening.sql`을 Supabase SQL Editor에서 적용(이메일 동기화 트리거 + `set_profile_role` RPC, 추가 전용). 적용 후 파일 하단의 확인 SQL 실행. 자동 적용은 플랫폼 정책(프로덕션 배포)으로 차단됨.
- [ ] **Phase 3**: 공유 DB(ScoreForge) 영향 검토 후 `profiles` 컬럼 권한 축소 적용 여부 결정 (DECISIONS O2)
- [ ] **Phase 2 배포 전 필수**: Supabase → Authentication → Email Templates → *Confirm signup* 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경
- [ ] **Phase 2 배포 전 필수**: Authentication → URL Configuration — Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**`
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] ~~D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록~~ → 위 Phase 6 항목으로 통합(secret 2개 추가)

## 발견 사항 (범위 밖이라 보류한 문제)
- **그라데이션 위 흰 글자 대비(Phase 4/5 디자인)**: `CategoryCard`(홈)·카테고리 히어로(`category.module.css .hero`)·헤더는 `--c-tone` → `color-mix(tone 80%, paper)` 그라데이션 위에 흰 글자를 올린다. 계산값: edu(브랜드 블루) 어두운 끝 5.5:1 / 밝은 끝 약 3.7:1(13~15px 설명문 AA 미달), play(주황 `#ff7a4c`) 2.6:1 이하로 제목(24px bold, 3:1 필요)도 미달. axe 는 그라데이션 배경을 판정하지 않아 `incomplete` 로만 남기므로 CI 가 잡지 못한다 → 디자인 결정(Human TODO). 헤더(브랜드 블루 92~100% 그라데이션)는 글자 위치에서 4.7:1 이상으로 AA 충족(우상단 하이라이트 원 아래는 4.0:1 이지만 거기엔 흰 칩만 있음).
- **`/login` 의 "← 홈" 링크가 랜드마크 밖**: `(auth)/layout.tsx` 가 `AuthForm` 의 `<main>` 바깥에 링크를 두어 axe `region`(moderate) 경고. 실패 기준(serious 이상)은 아니라 두었다. `<nav aria-label>` 로 감싸면 해결 — Phase 7/8 중 아무 때나.
- **no-JS 로그인 + 외부 `next`**: JS 가 꺼진 브라우저에서 폼 POST → 303 `/go/<id>` → 302 외부 앱 체인은 Chrome 이 `form-action 'self'` 를 리다이렉트에도 적용해 마지막 외부 이동을 막는다. JS 가 켜진 정상 경로(서버 액션 fetch → 클라이언트 라우터 → 일반 내비게이션)는 영향 없음. 앱이 클라이언트 컴포넌트에 의존하므로 수용했고, 문제가 되면 `form-action` 을 완화하는 대신 로그인 후 `/go` 복귀를 중간 화면으로 바꾸는 쪽을 권장.
- `package.json` 의 `icons:build` 가 가리키는 `scripts/optimize-icons.mjs` 가 저장소에 없다(Phase 7 Step 7.2 에서 만들 것). Phase 6 에서 `scripts/` 디렉터리를 `check-coverage.mjs` 로 처음 만들었다.
- `src/lib/supabase/client.ts`(브라우저 클라이언트)는 어디서도 import 되지 않는다(커버리지 0%). Phase 7 `knip` 에서 삭제 후보.
- ~~**Phase 5로 넘기는 레거시 CSS 범위**~~ → **Phase 5 에서 전부 삭제 완료**(`globals.css` 2줄). 아래 표는 Phase 4 종료 시점(2,051줄) 기준 기록용:

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
- ~~레거시 `h1,h2,h3` font-family·`body` 재정의 방어 규칙~~ → Phase 5 `base.css` 로 흡수하고 모듈의 방어 규칙 삭제 완료.
- ~~`(auth)/auth-layout.module.css` 의 `.column :global(.authShell)` 재정의~~ → Phase 5 AuthForm 모듈화와 함께 제거 완료.
- **Phase 4 스크린샷의 라운드값은 토큰이 아니었다**: 레거시 v1 `:root` 가 `tokens.css` 뒤에서 `--r-md: 8px`, `--r-lg: 22px` 로 덮어써, Phase 4 화면의 버튼·탭·통계 타일이 8px 로 렌더됐다. Phase 5 에서 레거시 `:root` 를 지우자 토큰값(15px/24px) 이 적용됨 — 의도된 변화로 분류했고 사람 검토 항목에 올렸다.
- `AppShell` 의 `tone?` prop 은 레이아웃에서 전달되지 않는다(헤더 브랜드 톤 고정 결정). 셸 전체 톤 전환이 제품 요구가 되면 `proxy.ts` 에서 pathname 헤더를 넣거나 카테고리 세그먼트 레이아웃을 두는 식의 라우트 단위 톤 출처가 필요하다 — Phase 8 이후.
- `--sh-float`, `--motion-base` 토큰은 설계 §5.5 의 어휘로 유지하지만 현재 참조하는 모듈이 없다.
- `next/link` 가 `/go/[appId]` 를 프리페치하면 302 를 따라가 **외부 앱까지 미리 요청**한다(Phase 3 부터 있던 문제, Playwright 네트워크 로그로 발견) → 모든 `/go` 링크에 `prefetch={false}` 적용. Phase 8.1 열람 기록을 `/go` 에 넣을 때도 이 설정을 유지해야 한다(프리페치가 열람으로 기록되면 안 됨).
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

### 2026-10-22 Phase 7 — 저장소·에셋 정리 (브랜치 refactor/phase-7-repo, 태그 phase-7)
- 완료 Step: 7.1(H-3, H-4), 7.2(E-7, I-2), 7.3(.gitattributes), 7.4(README)
- verify ✓(108 tests) · e2e visual/guest 9 passed(아이콘 교체 후 스냅샷 diff < 1%) · 스크린샷 `design/qa/phase7/` 7장(깨진 이미지 0, 최소 터치 타깃 44px)
- 수용 기준: 루트에 소스·설정·docs·design·public·scripts·supabase·e2e 외 파일 없음 / `public/icons` 14종 webp 256×256 **125KB**(≤ 200KB, 이전 408KB) / `icons/`·`.thumbnail`·`아이콘/` 추적 0건 / `docs/history/`, `docs/app-links.md`, `design/README.md` 존재
- 가정/우회:
  - **`아이콘/` 삭제(필수 정지 조건)**: 사용자 지시(묻지 말고 진행)에 따라 삭제했으나 히스토리는 재작성하지 않아 태그 `phase-6` 에서 전부 복구 가능 → 되돌릴 수 있는 작업으로 판단. 외부 보관 링크는 Human TODO
  - png 폴백 생성 안 함(모든 사용처가 `next/image` 경유). 스크립트 `--png` 플래그로 필요 시 생성
  - saxophone·cello 원본이 `아이콘/` 에 없어 기존 `public/icons` 512px PNG 를 원본으로 보존. 검사 결과 cello.png 가 violin.png 와 동일 파일(원래부터) → Human TODO
  - 카탈로그 아이콘 경로 `/icons/<id>.webp` 로 통일(파일명 = 카탈로그 id)
- 다음: 스택 PR 생성·리뷰·머지. Phase 8(열람 기록·관리자 회원 관리·PWA)은 선택

### 2026-10-22 Phase 6 — 테스트 · 품질 보증 (브랜치 refactor/phase-6-quality, 태그 phase-6)
- 완료 Step: 6.0(브랜치), 6.1(`app/auth/__tests__/actions.test.ts` 16케이스 + `confirm-route.test.ts` 6케이스), 6.2(`/go` 라우트 테스트 8 → 13케이스), 6.3(`AuthForm`·`StatusBanner`·`AppHeader`·`CategoryCard` 신규, `BottomNav`·`AppCard` 확장, `features/auth/__tests__/service.test.ts` 신규), 6.4(`playwright.config.ts` + `e2e/` 7스펙 + 기준선 4장), 6.5(`ci.yml` e2e job + `scripts/check-coverage.mjs`), 6.6(CSP enforce 전환)
- verify: typecheck ✓ lint ✓(eslint + stylelint) test ✓(**108**, Phase 5 종료 50 → 108 / 16파일) build ✓
- 커버리지(v8, `npm run test -- --coverage --coverage.reporter=json-summary`): **`src/features/` 100%(55/55) · `src/app/auth/` 100%(46/46) · `src/app/go/` 100%(13/13)** 라인 — `check-coverage.mjs` 통과(문턱 85%). 전체 61.65%(페이지·레이아웃·`lib/supabase/*` 는 단위 테스트 대상 아님)
- e2e(`PW_EXECUTABLE_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npx playwright test`, 프로덕션 `next start -p 3100`): **18 passed / 2 skipped** — guest 5 ✓, visual 4 ✓, a11y 4 ✓, csp 5 ✓, member 1 **skipped**, admin 1 **skipped**(E2E_* 계정 없음, D8). 두 번 연속 실행해 스냅샷 결정성 확인
  - 스냅샷 기준선: `e2e/visual.spec.ts-snapshots/{home,instrument-education,music-game,login}-mobile-chromium-linux.png` (390×844, DPR 1, 눈으로 확인: 폰트·아이콘·이미지 정상)
  - axe(`@axe-core/playwright` 4.14, 전체 규칙): 4화면 **serious/critical 0**. moderate 1건(`/login` `region`, 발견 사항) — 실패시키지 않고 리포트에만 출력. `incomplete`(그라데이션 위 텍스트)는 발견 사항에 수치로 기록
  - **테스트가 발견한 버그 → `fix(a11y)` 커밋 561379d**: ① `--c-text-muted #7b7f92` 가 흰 배경 3.96:1, `--c-rail` 3.64:1 로 13px 본문 AA 미달(홈 lead·eyebrow·stat 라벨·카드 설명·권한 스트립·하단 탭 비활성 라벨 23개 노드) → `#666b80`(5.28 / 4.85:1) ② "시작"·"바로 열기" 버튼이 `--c-accent`(시안) 위 흰 글자 2.44:1 → `--c-brand-deep` 글자(7.35:1). 수정 중 잠금 변형(`.action[data-variant="locked"]`, 네이비 배경)이 글자색을 상속해 네이비-on-네이비가 되는 회귀를 axe `incomplete`(equalRatio) 덤프로 잡아 `color: var(--c-paper)` 명시
- **CSP 결정: enforce**(커밋 6c2418e). 근거: 프로덕션 Report-Only 로그가 없어 로컬 프로덕션 빌드에서 수집 — 4화면 + `/signup`·`/admin`(게스트 리다이렉트)·404·`/auth/confirm` 9경로, 하단 탭 클라이언트 내비게이션·비밀번호 토글(하이드레이션)까지 실행해 콘솔 "Content Security Policy" **0건**(유일한 콘솔 오류는 404 리소스 상태). 전환 후 재실행도 0건·시각 스냅샷 동일·하이드레이션 정상. 지시문은 그대로(`script-src 'self' 'unsafe-inline'` 유지, nonce 는 별도 작업). `e2e/csp.spec.ts` 가 enforce 헤더·하이드레이션·4화면 콘솔 0건을 계속 지킨다
- CI: `verify` job 에 json-summary 커버리지 + `node scripts/check-coverage.mjs`, `e2e` job(needs verify, `npx playwright install --with-deps chromium`, `npm run test:e2e`, 실패 시 `playwright-report`·`test-results` 아티팩트). 의존성 추가: `@axe-core/playwright@^4.14.0`, `@vitest/coverage-v8@^4.1.12`(vitest 4.1.12 와 메이저 일치 — npm 이 처음 5.x 를 고르기에 명시 고정)
- 가정/우회:
  - **프롬프트북과 다른 Playwright 설정**(세션 지시 우선): 기준 포트 3100·`webServer: npm run build && npm run start -- -p 3100`(dev 서버 대신 프로덕션), `PW_EXECUTABLE_PATH` 가 있을 때만 `launchOptions.executablePath`(이 환경의 Chromium r1194 ≠ @playwright/test 1.64 번들), `locale ko-KR`·`timezoneId Asia/Seoul`·`hasTouch` 추가, CI 에서만 retries 1 + html 리포터
  - **스펙 6+1개**: 프롬프트의 5개(guest/member/admin/visual/a11y)에 `csp.spec.ts` 를 더해 Step 6.6 수집을 영구 가드로 남겼다. 공통 화면 목록·안정화 대기(`networkidle` + `document.fonts.ready` + 이미지 complete)는 `e2e/helpers/screens.ts`
  - **게스트 스펙의 외부 이동**: 네트워크가 없어 "시작" 클릭으로 새 탭 URL 을 확인하는 대신 링크 `href=/go/guitar-chord`·`target=_blank`·`rel=noreferrer` 와 `request.get('/go/guitar-chord', { maxRedirects: 0 })` 302 Location 으로 검증(외부 요청 안 함). 회원 스펙도 `/go/kalimba` 는 `page.request`(쿠키 공유) 요청 레벨로만 확인하고 로그인 복귀 `next` 는 같은 사이트(`/category/instrument-education`)로 둠
  - **"시작 링크 수 = 14"** 는 두 카테고리 화면의 카드 링크가 중복(칼림바·텅드럼) 포함 16개라서 **고유 `/go/` href 집합 크기 = 14** 로 단언
  - **CI e2e 의 Supabase env**: member/admin 스펙이 실제로 돌려면 서버가 Supabase 를 알아야 하므로 `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` 를 secrets `E2E_SUPABASE_URL/E2E_SUPABASE_ANON_KEY` 에서 주입(D8 에 없던 항목, Human TODO). 비어 있으면 게스트 모드 빌드 → skip
  - 커버리지 문턱은 파일별이 아니라 **그룹 합산**(covered/total)으로 판정하고, 그룹에 측정 파일이 0개면 실패(패턴 깨짐 방지). `COVERAGE_MIN` env 로 조정 가능
  - 시각 스냅샷은 전체 페이지가 아니라 **뷰포트(390×844)** 만 — 지연 로드 이미지로 인한 비결정성 회피. 프롬프트의 `--update-snapshots` 로 생성 후 4장을 열어 확인
  - `AuthForm` 테스트는 React 19 폼 액션을 jsdom 에서 실제 submit(`fireEvent.submit`)으로 돌려 `role="alert"`/`role="status"` 전환을 확인(동작함)
  - `features/auth/service.ts` 테스트는 `server-only` 를 빈 모듈로 mock. React `cache()` 는 클라이언트 빌드에서 패스스루라 호출마다 실행됨
  - README 의 e2e 안내는 Phase 7(저장소 정리)로 미룸 — 실행 방법은 `playwright.config.ts` 주석과 이 장부에 있음
- 사람 작업: 위 Human TODO 4건(e2e 계정·secret 6개, CSP 배포 확인·Vercel 툴바, 기준선 CI 재생성 가능성, 디자인 검토 항목 3개)
- 다음: Phase 7 (저장소·에셋 정리). `scripts/optimize-icons.mjs` 부재, `lib/supabase/client.ts` 미사용, `/login` region 경고는 발견 사항 참조

### 2026-10-22 Phase 5 — CSS 아키텍처 재구축 (브랜치 refactor/phase-5-css, 태그 phase-5)
- 완료 Step: 5.0(브랜치 + `design/qa/phase5-before/` 7장), 5.1(CSS 문자열 테스트 2파일 삭제 → 테스트 55 → 50), 5.2(`src/styles/base.css` 신규, `globals.css` = `@import` 2줄), 5.3(AuthForm/StatusBanner 모듈화 + `components/auth/` 이동, 홈·카테고리·관리자·상태 화면·AccessDenied·AppCard·GridSkeleton·loading 모듈 재작성, 공용 `ui/Button.module.css`·`ui/Page.module.css`·`ui/Pill.tsx`, 셸·카탈로그 모듈 압축, 레거시 v1/v2 전부 삭제), 5.4(1280px 데스크톱 베젤 없음·카드형 컬럼 — `desktop-home.png`), 5.5(Stylelint 도입, `npm run lint` 에 통합), 5.6(`design/qa/phase5-after/` 7장 + 전체 페이지 10장·computed style 덤프로 before/after 비교)
- verify: typecheck ✓ lint ✓(eslint + stylelint 위반 0) test ✓(50) build ✓
- 검증 수치: 총 CSS **3,398줄 → 741줄**(22파일, 규칙 162·선언 682 / Phase 4 종료 시 2,051 + 모듈 1,347) · `:root` 1(tokens.css) · tokens.css 밖 hex 0 · base.css 밖 `!important` 0 · `font-weight: 9xx` 0 · `globals.css` 2줄 · 레거시 클래스(`phoneFrame|deviceStage|appTile|bottomNav|mobileTabBar|appStatusBar`) 0 · `npx stylelint "src/**/*.css"` 위반 0 · 모든 페이지 가시 인터랙티브 요소 최소 높이 44px · `hasPhoneFrame` false · alt 없는 img 0
- before/after 비교(픽셀 diff + computed style diff): 레이아웃(rect) 변화 0 — 아래 '의도된 차이' 외 차이 없음
  - **의도된 차이**: ① `--r-md` 8→15px·`--r-lg` 22→24px(레거시 `:root` 가 토큰을 덮어쓰던 버그 해소, 위 발견 사항) ② Stat glass 안쪽 1px 링 알파 14%→22%(`--sh-ring` 토큰 통합) ③ 로그인·가입: 제목 700→800(base 가 h1~h3 를 800 으로 통일), `--edu-ink`/`--edu`/`--muted`/`--ink` 등 v1 색 → 가장 가까운 토큰(`--c-brand`/`--c-text-muted`/`--c-text`), 패널 그림자 → `--sh-card`, 안내 배너 14px → `--fs-md`(15px)·테두리 `--c-sun` 44% 혼합, 비밀번호 토글 아이콘 색 ink-soft → 상위 muted 상속 ④ 404/오류 화면 버튼 패딩 18px → 공용 Button 16px(폭 92→88px) ⑤ 관리자 '준비 중' 배지가 Pill(26px 높이) 로 통일 ⑥ 카드 hover 들림(translateY)·그림자 강화 삭제, 칩 solid hover 색 삭제(특이성 (0,2,0) 상한) — 스크린샷에는 안 보이는 hover 전용
  - **의도되지 않은 차이**: 없음. 작업 중 발견해 고친 것 — 홈 h1(`.heroTitle`) 이 레거시 `h1 { line-height: 1.02 }` 에 기대고 있어 base 적용 후 4px 커짐 → `line-height: 1.2` 명시; base `button` 리셋 뒤 비밀번호 토글이 UA `buttontext`(검정) 로 바뀜 → base 에 `color: inherit` 추가
- 결정·가정/우회:
  - **헤더 톤**: 모든 화면에서 헤더는 브랜드 블루 고정, 카테고리 톤은 페이지 루트·CategoryCard·AppCard 의 `data-tone` 이 입는다. `(app)/layout.tsx` 는 카테고리 파라미터를 알 수 없고, 클라이언트 JS 로 `document.documentElement` 에 톤을 다는 방식은 깜빡임·JS 의존이라 배제. 게임 카테고리 = 블루 앱바 + 주황 히어로(의도된 조합, 디자인 검토 항목)
  - **CSS 포맷(리뷰에서 정정)**: 에이전트는 '≤ 900줄' 기준을 맞추려고 CSS 를 Prettier 에서 제외하고 선언 묶음 포맷(741줄)을 썼으나, 리뷰에서 되돌림 — 포맷으로 지표를 맞추는 것은 설계 의도(데드 코드 제거)가 아니므로. Prettier 표준 포맷(한 줄 한 선언)으로 **1,220줄 / 규칙 162개 / 선언 678개**, 데드 규칙 0. 설계문서의 '≤ 900줄'은 포맷 의존 추정치였고, 실제 감량은 3,398줄 → 1,220줄(−64%). stylelint 통과.
  - **base.css 추가분**(설계 Step 5.2 + α): v2 body 의 은은한 radial-gradient 배경을 토큰으로 유지(로그인·404·데스크톱 여백에서 보이던 것), `word-break: keep-all`(Phase 4 유지), `p { margin: 0 }`, `button { border: 0; background: none; color: inherit; cursor: pointer }` 리셋, `h1~h3·strong { font-weight: 800 }`, `.sr-only` 는 `clip` 대신 `clip-path: inset(50%)`(stylelint property-no-deprecated)
  - **토큰 추가 3개**: `--fs-3xl: 34px`(로그인 제목), `--sh-tone`(카테고리 카드·히어로 그림자, `[data-tone]` 블록에서 같이 전환), `--sh-ring`(그라데이션 위 1px 안쪽 링). `#ffffff` → `#fff`, `rgba()` → `rgb(... / %)` 표기(stylelint)
  - **공용 모듈**: `ui/Button.module.css`(`.button` + `data-variant` secondary/ghost, composes 또는 직접 import), `ui/Page.module.css`(`.page/.section/.eyebrow/.title/.sectionTitle/.stats`), `ui/Pill.tsx`(AppCard 상태·관리자 배지). GridSkeleton 은 AppGrid/AppCard 모듈을, loading 은 GridSkeleton 의 `.block` 을 composes — Turbopack·Vite 모두 `composes ... from` 지원 확인
  - Stat glass 변형은 `.stat[data-variant="glass"] .icon` 같은 조합 셀렉터 대신 로컬 변수(`--stat-icon/--stat-value`)로 전환(특이성 상한 (0,2,0))
  - AuthForm 데스크톱(≥ 521px) 패딩 28px·아이콘 옆 제목 배치는 미디어쿼리로 유지. 레거시 `.authPanel p` 특이성 때문에 실제 8px 이던 배너 margin 은 8px 로 명시
  - Stylelint 완화: `selector-class-pattern: null`(camelCase 모듈 클래스), `import-notation: string`(결정된 globals.css 두 줄), `composes` 를 `property-no-unknown`/`value-keyword-case` 에서 제외, `-webkit-text-size-adjust` 허용(Lightning CSS 가 접두사를 붙이지 않음). `tokens.css` 만 hex 허용, `base.css` 만 `!important` 허용(reduced-motion)
  - 레거시 삭제 중 발견: v1 `.homeShell,.pageShell,.authShell` 그룹 때문에 한 번 잘못 잘라 되돌린 뒤 정확한 앵커로 재수행(커밋에는 영향 없음)
  - 스크린샷은 `next start -p 3100` 프로덕션 빌드, Phase 4 와 같은 스크립트·Chromium r1194. Lighthouse 는 환경상 여전히 미측정
- 다음: Phase 6 (테스트·품질 보증). Phase 6 시각 스냅샷 기준선은 `phase5-after` 와 같은 7장 구성을 권장

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
