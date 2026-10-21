# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: 0, 1, 2
- 진행 중 Phase: 3
- 현재 브랜치: refactor/phase-3-domain (base: refactor/phase-2-auth)
- 마지막 verify 결과: Phase 2 — typecheck ✓ lint ✓ test ✓(40) build ✓

## 사람 작업 대기 (Human TODO)
- [ ] **Phase 2 배포 전 필수**: Supabase → Authentication → Email Templates → *Confirm signup* 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경
- [ ] **Phase 2 배포 전 필수**: Authentication → URL Configuration — Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**`
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록

## 발견 사항 (범위 밖이라 보류한 문제)
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

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
