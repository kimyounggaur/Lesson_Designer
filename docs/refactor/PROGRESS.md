# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: 0
- 진행 중 Phase: 1
- 현재 브랜치: refactor/phase-1-hotfix (base: refactor/phase-0-tooling)
- 마지막 verify 결과: Phase 0 — typecheck ✓ lint ✓(0 warnings) test ✓(21) build ✓

## 사람 작업 대기 (Human TODO)
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록

## 발견 사항 (범위 밖이라 보류한 문제)
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

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
