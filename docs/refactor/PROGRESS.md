# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: 0, 1, 2, 3
- 진행 중 Phase: 4
- 현재 브랜치: refactor/phase-4-shell (base: refactor/phase-3-domain)
- 마지막 verify 결과: Phase 3 — typecheck ✓ lint ✓ test ✓(53) build ✓

## 사람 작업 대기 (Human TODO)
- [ ] **Phase 3**: `supabase/migrations/202610220001_profiles_hardening.sql`을 Supabase SQL Editor에서 적용(이메일 동기화 트리거 + `set_profile_role` RPC, 추가 전용). 적용 후 파일 하단의 확인 SQL 실행. 자동 적용은 플랫폼 정책(프로덕션 배포)으로 차단됨.
- [ ] **Phase 3**: 공유 DB(ScoreForge) 영향 검토 후 `profiles` 컬럼 권한 축소 적용 여부 결정 (DECISIONS O2)
- [ ] **Phase 2 배포 전 필수**: Supabase → Authentication → Email Templates → *Confirm signup* 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경
- [ ] **Phase 2 배포 전 필수**: Authentication → URL Configuration — Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**`
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록

## 발견 사항 (범위 밖이라 보류한 문제)
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

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
