# Lesson Designer 리팩토링 — 바이브코딩 프롬프트북

| 항목 | 내용 |
|---|---|
| 기반 문서 | `Lesson_Designer_리팩토링_설계문서.md` (2026-10-21, 커밋 `2374a98` 기준, 문제 62건 · Phase 0~8) |
| 대상 도구 | Claude Code (터미널/데스크톱). 동급 에이전트(Cursor Agent, Codex CLI 등)에도 그대로 쓸 수 있음 |
| 구성 | 설치 프롬프트 2개 + Phase 프롬프트 11개(P-P0~P-P7, P-P8a/b/c) + 보조 프롬프트 4개 |
| 사용 원칙 | **한 세션 = 한 Phase**, 프롬프트는 **수정 없이 그대로** 붙이고 `[ ]` 안만 채움, Phase 뒤에는 **새 세션에서 리뷰** |
| 작성일 | 2026-10-21 |

> 설계문서가 "무엇을·왜·어떻게"를 담은 지도라면, 이 문서는 그 지도를 에이전트에게 **한 번에 한 구간씩** 건네는 운전 지시서입니다. 프롬프트마다 역할 → 목표 → 먼저 읽을 것 → 이미 결정된 것 → 작업 → 범위 밖 → 검증 → 완료 기준 → 멈출 조건 → 보고 형식이 들어 있어, 에이전트가 질문 루프에 빠지거나 범위를 벗어나거나 "다 됐다"고 거짓 선언하는 세 가지 실패를 막도록 설계했습니다.

---

## 목차

- [0. 사용법](#0-사용법)
- [1. 설치 프롬프트](#1-설치-프롬프트) — P-00 프로젝트 메모리, P-01 결정 고정
- [2. Phase 프롬프트](#2-phase-프롬프트) — P-P0 ~ P-P7, P-P8a, P-P8b, P-P8c
- [3. 보조 프롬프트](#3-보조-프롬프트) — P-R 리뷰, P-F 수정 루프, P-D 디자인 QA, P-H 인계
- [4. 부록](#4-부록) — 템플릿, 설계 원칙, 트러블슈팅

---

## 0. 사용법

### 0.1 전제 조건

- Node **22** (`nvm use 22`), npm 10+. Next.js 16은 Node ≥ 20.9 필요.
- 저장소 클론: `git clone https://github.com/kimyounggaur/Lesson_Designer && cd Lesson_Designer`
- Supabase 프로젝트 대시보드 접근 권한 (Phase 2·3·6에서 사람 작업이 있음)
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (Phase 1부터 로그인 흐름 확인용. 없어도 Phase 0은 진행 가능)
- Claude Code를 **저장소 루트**에서 실행

### 0.2 설계문서 배치 (가장 먼저)

```bash
mkdir -p docs/refactor
cp ~/Downloads/Lesson_Designer_리팩토링_설계문서.md docs/refactor/DESIGN.md
git add docs/refactor/DESIGN.md && git commit -m "docs: add refactoring design document"
```

모든 프롬프트는 `docs/refactor/DESIGN.md`를 참조합니다. **파일명을 바꾸지 마세요.**

### 0.3 실행 순서

| # | 프롬프트 | 목적 | 새 세션 | 사람 작업 | 예상 시간 |
|---|---|---|---|---|---|
| 1 | **P-00** | `CLAUDE.md`·`PROGRESS.md` 설치 | ✓ | — | 5분 |
| 2 | **P-01** | 결정 사항 고정 → `DECISIONS.md` | 같은 세션 | ✓ 질문 8개 답 채우기 | 10분 |
| 3 | **P-P0** | Phase 0 — 도구 체인·CI | ✓ | — | 0.5일 |
| 4 | P-R | Phase 0 리뷰 | ✓ | — | 10분 |
| 5 | **P-P1** | Phase 1 — 긴급 보안·UX 핫픽스 | ✓ | — | 0.5일 |
| 6 | P-R | Phase 1 리뷰 → **즉시 배포 가능** | ✓ | 배포 | 10분 |
| 7 | **P-P2** | Phase 2 — 인증·세션 계층 | ✓ | ✓ 이메일 템플릿·Redirect URL | 1일 |
| 8 | P-R | 리뷰 | ✓ | | |
| 9 | **P-P3** | Phase 3 — 도메인·`/go` 게이트·DB | ✓ | ✓ 마이그레이션 적용 승인 | 1일 |
| 10 | P-R | 리뷰 | ✓ | | |
| 11 | **P-P4** | Phase 4 — UI 셸·탐색·가짜 데이터 제거 | ✓ | — | 1.5일 |
| 12 | P-D | 디자인 QA(스크린샷) | 같은 세션 가능 | 디자인 검토 | 20분 |
| 13 | **P-P5** | Phase 5 — CSS 재구축 | ✓ | — | 1.5일 |
| 14 | P-D, P-R | QA + 리뷰 | ✓ | | |
| 15 | **P-P6** | Phase 6 — 테스트·e2e·a11y·CSP | ✓ | ✓ 테스트 계정 | 1일 |
| 16 | **P-P7** | Phase 7 — 저장소·에셋 정리 | ✓ | ✓ 원본 아이콘 보관 | 0.5일 |
| 17 | P-P8a/8b/8c | (선택) 열람 기록·관리자 기능·PWA | ✓ | ✓ 마이그레이션 승인, 앱 아이콘 | 2일+ |

### 0.4 운영 규칙 (사람 쪽에서 지킬 것)

1. **한 세션 = 한 Phase.** Phase가 끝나면 `/clear` 또는 새 세션을 연다. 긴 컨텍스트는 범위 이탈과 환각의 원인이다.
2. 프롬프트는 **그대로** 붙인다. `[ ]` 표시 부분만 채운다. 문구를 "요약"해서 넣으면 안전장치가 빠진다.
3. Phase 프롬프트 다음에는 **반드시 새 세션에서 P-R(리뷰)**를 돌린다. 작업한 세션이 자기 결과를 채점하게 두지 않는다.
4. 에이전트가 "완료"라고 해도 `npm run verify`를 **직접 한 번** 돌려본다. 빨간데 완료라 하면 P-F(수정 루프).
5. Phase마다 브랜치 → PR → Vercel Preview 확인 → `main` 머지. Phase 1은 머지 즉시 프로덕션 배포.
6. 되돌릴 수 없는 작업(DB 마이그레이션 적용, git 히스토리 재작성, 대량 삭제)은 에이전트가 **멈추고 묻게** 되어 있다. 직접 확인한 뒤 "진행"이라고 답한다.
7. 에이전트가 질문하면, 답을 `docs/refactor/DECISIONS.md`에도 적어 두라고 함께 지시한다. 같은 질문이 다음 세션에서 반복되지 않는다.

### 0.5 사람이 직접 해야 하는 일 (대시보드 작업 체크리스트)

| 시점 | 작업 | 위치 |
|---|---|---|
| P-01 전 | JWT 서명 키 타입 확인 (ECC/RSA 비대칭인지, 레거시 HS256인지) | Supabase → Project Settings → JWT Keys |
| P-01 전 | 배포 도메인 확정 (`NEXT_PUBLIC_SITE_URL`) | Vercel |
| Phase 2 배포 직전 | **Confirm signup 이메일 템플릿** 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경 | Supabase → Authentication → Email Templates |
| Phase 2 배포 직전 | Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<도메인>/**` 추가 | Supabase → Authentication → URL Configuration |
| Phase 3 | `supabase db push` 또는 SQL Editor로 `202610210001_profiles_hardening.sql` 적용 (에이전트가 멈추고 요청함) | Supabase |
| Phase 3 | `SUPABASE_PROJECT_ID` 제공 (DB 타입 생성용) | Supabase → Project Settings → General |
| Phase 6 전 | e2e 테스트 계정 2개(member, admin) 생성 + admin 승격 SQL | Supabase |
| Phase 7 | 원본 아이콘(`아이콘/`, 5.7MB) Google Drive 등으로 이전, 링크 확보 | — |
| 매 Phase | Vercel Preview에서 모바일(390×844) 육안 확인 | Vercel |

---

## 1. 설치 프롬프트

### P-00 — 프로젝트 메모리(CLAUDE.md) 설치

> 새 세션에서 실행. 이후 모든 세션이 자동으로 읽는 규칙 파일을 만든다. `docs/refactor/DESIGN.md`가 커밋되어 있어야 한다.

````markdown
# [설치] 프로젝트 메모리와 진행 장부 생성

## 역할
너는 이 저장소(Lesson Designer, Next.js 16 + Supabase 모바일 웹앱)의 리팩토링을 여러 세션에 걸쳐 수행할 시니어 엔지니어다. 이 세션에서는 코드를 바꾸지 않고, 이후 세션이 따를 규칙 파일과 진행 장부만 만든다.

## 먼저 할 것
1. `docs/refactor/DESIGN.md`가 존재하는지 확인한다. 없으면 즉시 멈추고 "설계문서를 docs/refactor/DESIGN.md 에 넣어주세요"라고 요청한다.
2. `docs/refactor/DESIGN.md`의 §1(요약), §4(목표와 원칙), §6의 Phase 제목만 읽어 전체 구조를 파악한다. 전체를 다 읽지는 않는다.
3. `package.json`, `src/` 트리(`find src -type f`)를 훑어 현재 구조를 확인한다.

## 작업 1 — 저장소 루트에 `CLAUDE.md` 생성 (아래 내용 그대로)

```markdown
# Lesson Designer — 작업 규칙 (Claude Code용)

## 프로젝트
- Next.js 16 App Router + React 19 + TypeScript + Supabase(Auth/Postgres, @supabase/ssr) + 순수 CSS(CSS Modules). Vercel 배포. 모바일 퍼스트 웹앱.
- 설계문서: `docs/refactor/DESIGN.md` — 문제 ID(A-1…I-4), Phase 0~8, Step 번호. 모든 작업은 이 문서의 Step을 참조한다.
- 결정 사항: `docs/refactor/DECISIONS.md` — 여기 적힌 것은 다시 묻지 않는다.
- 진행 장부: `docs/refactor/PROGRESS.md` — 세션 시작 시 읽고, 끝날 때 갱신한다.

## 절대 규칙
1. 한 세션 = 한 Phase. 프롬프트가 지정한 Phase 밖의 작업은 하지 않는다. 발견한 다른 문제는 PROGRESS.md "발견 사항"에만 적는다.
2. 외부 앱 URL(`*.vercel.app`)을 컴포넌트/페이지에 직접 렌더하지 않는다. 항상 `/go/[appId]`를 경유한다. (Phase 3 이후 강제)
3. 권한 판정은 서버에서만 한다. 조회 실패·행 없음은 `guest`로 처리한다(fail-closed).
4. 실데이터가 없는 숫자·지표(진행률, XP, 스트릭, 시계, 배터리)를 UI에 넣지 않는다.
5. 이미 커밋된 `supabase/migrations/*.sql`은 수정하지 않는다. 변경은 새 파일로만 추가한다.
6. CSS 파일 내용을 문자열로 단언하는 테스트를 작성하지 않는다.
7. `package.json`에 `"latest"` 버전 범위를 쓰지 않는다.
8. 서버 액션에서 Supabase 에러 원문(`error.message`)을 UI 상태로 반환하지 않는다. 한국어 매핑(`toUserMessage`)을 거친다. 원문은 `console.error`로 서버 로그에만 남긴다.
9. 비밀값(`.env.local`, service_role 키)을 커밋하지 않는다. 클라이언트 번들에 `NEXT_PUBLIC_` 이외의 env를 쓰지 않는다.
10. 테스트를 통과시키기 위해 테스트를 지우거나 단언을 약화하지 않는다. 단, 설계문서가 "삭제"로 명시한 테스트(CSS 문자열 테스트, 가짜 데이터 단언)는 예외다.

## 검증
- `npm run verify` (= typecheck → lint → test → build)가 통과해야 Phase 완료다.
- 변경 후 반드시 실행한다. 실패를 "다음에 고치겠다"고 넘기지 않는다.
- 빌드 확인에는 `.env.local`이 없어도 된다(미설정 시 게스트 모드로 렌더됨).

## 코드 스타일
- TypeScript strict. `any` 금지(불가피하면 `unknown` + 좁히기).
- 서버 전용 모듈 상단에 `import "server-only"`.
- 컴포넌트는 함수 선언 `export function X()`. 파일당 컴포넌트 1개.
- CSS는 CSS Modules(`X.module.css`) + `src/styles/tokens.css` 토큰만 사용. 모듈 밖에서 hex 색상 금지.
- 문구는 한국어. 사용자에게 보이는 영어 에러 금지.

## 커밋
- 작은 단위로 자주. 메시지: `<type>(<scope>): <요약>` — type ∈ feat/fix/refactor/test/chore/docs/style/perf
- Phase 완료 커밋: `refactor(phase-N): <Phase 이름> 완료`
- `git add -A` 금지. 변경한 파일만 명시해서 add.

## 멈추고 물어볼 조건
- 되돌릴 수 없는 작업 직전: DB 마이그레이션 적용, git 히스토리 재작성, 10개 이상 파일 삭제, 외부 서비스 설정 변경
- 설계문서와 실제 코드가 달라 Step을 그대로 적용할 수 없을 때(차이를 먼저 보고)
- `DECISIONS.md`에 없는 제품 결정이 필요할 때
- 그 외에는 묻지 말고 설계문서의 권장안으로 진행하고, PROGRESS.md에 "가정"으로 기록한다.

## 세션 종료 보고 형식
1. 완료한 Step (설계문서 번호) / 미완료 Step과 사유
2. 검증 결과: 실행한 명령과 결과 요약(통과/실패 수치)
3. 가정·우회한 것
4. 다음 세션에 넘길 것
5. 사람이 해야 할 작업(대시보드 설정 등)
```

## 작업 2 — `docs/refactor/PROGRESS.md` 생성 (아래 템플릿 그대로)

```markdown
# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: (없음)
- 진행 중 Phase: (없음)
- 현재 브랜치: main
- 마지막 verify 결과: (미실행)

## 사람 작업 대기 (Human TODO)
- [ ] (없음)

## 발견 사항 (범위 밖이라 보류한 문제)
- (없음)

## 세션 로그

### [날짜] P-00 설치
- 완료: CLAUDE.md, PROGRESS.md 생성
- 다음: P-01로 DECISIONS.md 작성
```

## 작업 3 — 커밋
```bash
git add CLAUDE.md docs/refactor/PROGRESS.md
git commit -m "chore: add agent working rules and progress ledger"
```

## 하지 말 것
- `src/` 아래 어떤 파일도 수정하지 않는다.
- `package.json`을 수정하지 않는다.

## 종료 시
CLAUDE.md의 "세션 종료 보고 형식"으로 보고한다. 이번 세션은 코드 변경이 없으므로 검증 항목은 "해당 없음"으로 적는다.
````

---

### P-01 — 결정 사항 고정 (DECISIONS.md)

> P-00과 같은 세션에서 이어서 실행. **붙이기 전에 `[ ]` 8곳을 채운다.** 비워 두면 에이전트가 기본값(설계문서 권장안)을 쓴다.

````markdown
# [설치] 결정 사항 고정

## 역할
리팩토링 중 반복해서 질문이 나올 제품·운영 결정을 지금 한 번에 확정해 `docs/refactor/DECISIONS.md`에 기록한다. 코드는 바꾸지 않는다.

## 결정 값 (사람이 채운 값. `[ ]`가 비어 있으면 "기본값"을 쓴다)

| # | 결정 | 사람이 채운 값 | 기본값(설계문서 §9.4 권장) |
|---|---|---|---|
| D1 | 관리자 로그인 화면 | [ ] | **삭제**. `/login` 하나로 통일. `/admin-login` 요청은 `next.config.mjs` redirects로 `/login`에 301. |
| D2 | 데스크톱 폰 베젤 | [ ] | **제거**. 600px 이상에서는 카드형 중앙 컬럼(max 480px). `?frame=1` 옵션은 구현하지 않음. |
| D3 | 중복 앱(텅드럼·칼림바) | [ ] | **통합**. `categories: [...]` 복수 카테고리. 전체 앱 수 16 → 14(의도된 정정, 릴리스 노트 명시). |
| D4 | 하위 앱 실제 보호(설계 8.3) | [ ] | **보류**. `/go/[appId]` 서버 게이트만 구현. 잠금 문구는 "회원용". |
| D5 | 원본 아이콘 `아이콘/` 보관처 | [ ] | **저장소 밖**(Google Drive). git 히스토리 재작성은 하지 않음(별도 결정). |
| D6 | Supabase JWT 서명 키 타입 | [ ] ← 대시보드 Project Settings → JWT Keys 에서 확인: "ECC(P-256)" / "RSA" / "HS256(레거시)" | 확인 안 됐으면 **`getUser()` 유지**(안전). 비대칭이면 `getClaims()`. |
| D7 | 배포 도메인 (`NEXT_PUBLIC_SITE_URL`) | [ ] | `https://lesson-designer.vercel.app` (실제 값으로 교체 필요) |
| D8 | e2e 테스트 계정 | [ ] 예: `e2e-member@example.com` / `e2e-admin@example.com` (비밀번호는 env로) | Phase 6 전까지 사람이 생성. 환경변수 `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` |

## 작업
1. 위 표의 값을 `docs/refactor/DECISIONS.md`에 다음 형식으로 기록한다:
   - 제목, 날짜
   - 결정 표(번호·결정·값·근거 한 줄·영향 받는 Phase)
   - "미결 사항" 섹션: 사람이 비워 둔 항목은 기본값을 적고 `(기본값 적용 — 확인 필요)` 표시
   - "변경 이력" 섹션(빈 상태)
2. 각 결정이 설계문서의 어느 Step에 영향을 주는지 `DESIGN.md §6`에서 찾아 "영향 Phase" 열에 적는다(예: D1 → Phase 2 Step 2.3, 2.6 / D3 → Phase 3 Step 3.1).
3. `PROGRESS.md` "현재 상태"에 `결정 파일 작성 완료`를 추가하고, D6·D7·D8 중 기본값이 적용된 항목은 "사람 작업 대기"에 체크박스로 올린다.
4. 커밋: `docs: record refactoring decisions`

## 하지 말 것
- 결정 값을 "더 좋아 보이는" 쪽으로 바꾸지 않는다. 사람이 채운 값이 최우선, 비어 있으면 기본값.
- 코드 수정 금지.

## 종료 시
작성한 DECISIONS.md 전문을 보여 주고, 기본값이 적용된 항목을 따로 나열한다.
````

---

## 2. Phase 프롬프트

> 공통 구조: 역할 → 목표 → 먼저 읽을 것 → 이미 결정됨 → 작업(설계문서 Step 매핑) → 범위 밖 → 검증 → 완료 기준 → 멈출 조건 → 종료 보고.
> 각 프롬프트는 **새 세션** 첫 메시지로 붙인다. CLAUDE.md는 자동으로 로드된다.

### P-P0 — Phase 0: 안전망 구축 (도구 체인 · CI)

````markdown
# [Phase 0] 안전망 구축 — 의존성 고정, ESLint, Vitest, CI, README

## 역할
CLAUDE.md 규칙을 따르는 시니어 Next.js/TypeScript 엔지니어. 이 세션은 **Phase 0만** 수행한다.

## 이번 세션의 목표
이후 모든 Phase가 같은 기준(`npm run verify`)으로 검증될 수 있는 도구 체인을 만든다. **애플리케이션 동작은 바꾸지 않는다.**

## 시작 전에 읽을 것 (요약하지 말고 실제로 열어라)
1. `CLAUDE.md`
2. `docs/refactor/PROGRESS.md`, `docs/refactor/DECISIONS.md`
3. `docs/refactor/DESIGN.md` §6 **Phase 0 전체**(Step 0.1~0.6), §3 섹션 G·H(테스트·의존성 문제 G-5, H-1, H-2, H-4, H-5)
4. `package.json`, `package-lock.json`(설치된 실제 버전 확인: `node -e "const l=require('./package-lock.json');for(const n of ['next','react','react-dom','@supabase/ssr','@supabase/supabase-js','lucide-react','typescript','vitest','jsdom','@testing-library/react','@testing-library/jest-dom','@types/react','@types/react-dom','@types/node'])console.log(n,l.packages['node_modules/'+n]?.version)"`)
5. `vitest.config.ts`, `tsconfig.json`, `.gitignore`

## 이미 결정됨 (묻지 말 것)
- 버전 범위는 lock 파일의 **현재 설치 버전**을 기준으로 `^` 고정(메이저 잠금). 업그레이드는 하지 않는다.
- ESLint는 flat config(`eslint.config.mjs`) + `eslint-config-next` 16. `.eslintrc` 금지.
- Prettier 설정: `printWidth 110`, `trailingComma none`, 더블쿼트.
- CI는 GitHub Actions, Node 버전은 `.nvmrc`(=22)에서 읽는다.
- `overrides.next.postcss`는 `npm audit`에서 postcss 관련 취약점이 더 이상 보고되지 않으면 삭제, 보고되면 유지하고 README에 사유 기록.

## 작업 (순서대로)

### Step 0.1 브랜치
```bash
git checkout -b refactor/phase-0-tooling
```

### Step 0.2 `package.json` 재작성 + `.nvmrc`
- `DESIGN.md Step 0.2`의 package.json을 기준으로 작성한다. 단, 버전은 lock의 실제 버전에서 `^`로 시작하게 **직접 계산**한다(설계문서의 숫자를 그대로 복사하지 말고 lock과 대조).
- 추가 devDependencies: `eslint`, `eslint-config-next`, `prettier`, `@vitejs/plugin-react`, `@playwright/test`, `sharp`. 추가 dependencies: `pretendard`, `server-only`.
- scripts: `lint`, `format`, `format:check`, `typecheck`, `verify`, `test:e2e`, `icons:build`, `db:types` 를 설계문서대로 추가. `"lint": "next lint"`는 **삭제**(Next 16에서 제거됨).
- `engines.node = ">=20.9.0"`, `.nvmrc` 내용 `22`.
- `npm install` 실행 후 `npm ls --depth=0`로 설치 확인. peer 경고가 나면 기록만 하고 진행.

### Step 0.3 ESLint + Prettier
- `eslint.config.mjs`: `DESIGN.md Step 0.3` 코드. 생성 후 `npx eslint --print-config src/app/page.tsx > /dev/null`로 로드 확인. `eslint-config-next`의 flat export 경로가 다르면 `node_modules/eslint-config-next/README.md`를 읽고 맞춘다.
- `.prettierrc`, `.prettierignore`(`.next`, `node_modules`, `design`, `support.js`, `*.dc.html`, `package-lock.json`).
- `npm run lint`를 실행한다. **기존 코드에서 오류가 나면** 동작을 바꾸지 않는 범위(미사용 import 제거, `_` 접두어 등)에서 고친다. 규칙을 끄거나 `eslint-disable`로 덮지 않는다. 10건을 넘으면 목록을 보고하고 계속 고친다.
- `npm run format` 1회 실행 → 포매팅 커밋을 **별도**로 만든다(`style: apply prettier`). 리뷰 diff를 깨끗하게 유지하기 위함.

### Step 0.4 Vitest
- `vitest.config.ts`를 `DESIGN.md Step 0.4`대로 교체(`@vitejs/plugin-react`, `setupFiles`, `coverage`).
- `vitest.setup.ts` 생성(`import "@testing-library/jest-dom/vitest";`).
- 기존 테스트 파일 상단의 `import "@testing-library/jest-dom/vitest";`는 제거(setup으로 이동).
- `npm test` 통과 확인(현재 21 케이스). `npm run typecheck`에서 jest-dom 매처 타입 오류가 나면 `tsconfig.json` include에 `vitest.setup.ts`가 들어가는지 확인한다.

### Step 0.5 CI
- `.github/workflows/ci.yml`: `DESIGN.md Step 0.5` 그대로. build 단계 env는 placeholder.

### Step 0.6 README + .gitignore
- `README.md` 신규: 프로젝트 목적 / 로컬 실행(`.env.local` 작성법, `.env.example` 참조) / Supabase 설정 개요 / 스크립트 표 / 배포(Vercel env 3개) / 폴더 구조 / "리팩토링 진행 중 — docs/refactor 참조" 안내. 한국어로.
- `.gitignore`에 `coverage/`, `playwright-report/`, `test-results/`, `.DS_Store`, `*.ai` 추가.

### 체크포인트 커밋 (각 Step 뒤)
- `chore(deps): pin dependency versions and add tooling`
- `chore(lint): add eslint flat config and prettier`
- `style: apply prettier`
- `test(config): add vitest setup and react plugin`
- `ci: add verify workflow`
- `docs: add README and extend gitignore`

## 범위 밖 (하지 말 것)
- `src/` 아래 코드의 **동작** 변경. 리팩토링·버그 수정은 Phase 1 이후.
- 의존성 메이저 업그레이드.
- `middleware.ts` → `proxy.ts` 변경(Phase 2).
- Playwright 설정 파일 작성(Phase 6). 패키지 설치만.

## 검증
```bash
rm -rf node_modules && npm ci
npm run verify
grep -c '"latest"' package.json          # 기대: 0
node -v                                  # 기대: v22.x
```
기대 결과: `verify` 4단계 모두 통과. `npm run build` 출력에 `middleware` deprecation 경고가 있어도 이 Phase에서는 무시(Phase 2에서 처리).

## 완료 기준 (전부 ✓)
- [ ] `npm ci && npm run verify` 통과
- [ ] `package.json`에 `latest` 0개, `engines.node` 존재, `.nvmrc` 존재
- [ ] `eslint.config.mjs` 로드됨, `npm run lint` 경고 0
- [ ] `.github/workflows/ci.yml` 존재(푸시 후 녹색은 사람이 확인)
- [ ] README.md 존재, 스크립트 표 포함
- [ ] 애플리케이션 코드 diff가 lint 수정·포매팅 외에 없음(`git diff main --stat -- src/`로 확인하고 보고에 첨부)

## 멈추고 물어볼 조건
- `npm install`이 네트워크/권한 오류로 실패
- `eslint-config-next`의 flat config export를 README에서도 찾을 수 없을 때
- 기존 코드 lint 오류 수정에 동작 변경이 필요할 때(그 항목은 건너뛰고 보고)

## 종료 시
1. `PROGRESS.md` 갱신: 현재 상태(완료 Phase: 0, 브랜치, verify 결과), 세션 로그 추가, 발견 사항(범위 밖 문제) 기록
2. 최종 커밋 `refactor(phase-0): 안전망 구축 완료`
3. CLAUDE.md 보고 형식으로 보고. 특히 "사람이 해야 할 작업"에 **CI 녹색 확인, PR 생성**을 넣는다.
````

---

### P-P1 — Phase 1: 긴급 수정 (보안·UX 핫픽스)

````markdown
# [Phase 1] 긴급 수정 — 접근 우회, 로그아웃 트랩, fail-open, 에러 메시지, 복귀 경로, 보안 헤더

## 역할
CLAUDE.md 규칙을 따르는 시니어 Next.js 엔지니어. 이 세션은 **Phase 1만** 수행한다. 이 Phase는 단독으로 프로덕션에 배포되는 핫픽스이므로 **최소 diff**가 원칙이다.

## 이번 세션의 목표
구조를 바꾸지 않고 🔴 치명 결함 3건(A-1, B-1, A-3)과 🟠 4건(A-4, B-2, A-5, B-4)을 제거한다.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `docs/refactor/PROGRESS.md`, `docs/refactor/DECISIONS.md`
2. `docs/refactor/DESIGN.md` §3-A(A-1, A-3, A-4, A-5), §3-B(B-1, B-2, B-4), §6 **Phase 1 전체**(Step 1.1~1.7)
3. 소스: `src/app/category/[category]/page.tsx`, `src/components/SiteHeader.tsx`, `src/app/admin/page.tsx`, `src/app/auth/actions.ts`, `src/lib/auth.ts`, `src/lib/access.ts`, `src/components/AppCard.tsx`, `src/components/AuthForm.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `next.config.mjs`

## 이미 결정됨
- 이 Phase에서는 파일 이동·개명·모듈 분리를 하지 않는다. Phase 2~3에서 재작성될 코드이므로 "임시 조치"라고 주석 대신 PROGRESS.md에 적는다.
- `/admin-login`은 아직 삭제하지 않는다(Phase 2). 단, 비관리자 로그인 시 `signOut()`하는 동작만 제거한다.
- 새 유틸은 `src/lib/` 아래에 둔다(`auth-errors.ts`, `safe-next.ts`). Phase 2에서 `features/`로 이동한다.

## 작업 (TDD 순서: 테스트 → 구현 → 통과)

### Step 1.0 브랜치
```bash
git checkout main && git pull && git checkout -b refactor/phase-1-hotfix
```

### Step 1.1 잠긴 앱 우회 차단 (A-1) — `src/app/category/[category]/page.tsx`
- 테스트 먼저: `src/lib/__tests__/access.test.ts`에 "게스트에게 보여줄 첫 앱은 `canOpenApp`을 만족해야 한다" 성격의 헬퍼 테스트를 추가하려면 헬퍼가 필요하다. 간단히 `src/lib/access.ts`에 `export function firstOpenableApp(apps: LessonApp[], role: UserRole) { return apps.find((a) => canOpenApp(a, role)) ?? null; }`를 추가하고 테스트 3개(guest/음악게임 → null, guest/악기 → guitar-chord, member → 첫 앱).
- 페이지: `const featuredApp = apps[0];` → `const featuredApp = firstOpenableApp(apps, role);`

### Step 1.2 로그아웃 트랩 제거 (B-1)
- `SiteHeader.tsx:32`: 계정 칩 목적지를 역할별로. 게스트 `/login`, 회원 `/category/instrument-education`, 관리자 `/admin`.
- `admin/page.tsx`: 비로그인 → `redirect("/login?next=/admin")`, 회원 → **리다이렉트 대신 403 안내 JSX** 렌더(제목 "관리자 전용 화면입니다", 본문 "회원 계정으로는 들어갈 수 없어요.", 홈으로 링크). 인라인 JSX 허용(Phase 4에서 컴포넌트화).
- `actions.ts adminLoginAction`: `await supabase.auth.signOut();` 줄 **삭제**. 메시지는 "관리자 권한이 없는 계정입니다." 유지.

### Step 1.3 fail-closed 역할 판정 (A-3) — `src/lib/auth.ts`
- `DESIGN.md Step 1.3` 코드로 교체: `{ data, error }` 구조분해, `error` → `console.error` + guest, `!data` → `console.warn` + guest, 정상 → `normalizeRole(data.role)`. **`?? "member"` 기본값 제거.**
- `getCurrentRole()` 삭제. 사용처 없음(`grep -rn getCurrentRole src`로 확인).
- 테스트: `access.test.ts`에 `normalizeRole(undefined) === "guest"`, `normalizeRole("superuser") === "guest"` 추가.

### Step 1.4 에러 메시지 한국어 매핑 (A-4)
- `src/lib/auth-errors.ts` 신규: `DESIGN.md Step 1.4` 코드(`MESSAGES` 7개 + `toUserMessage`).
- 테스트 `src/lib/__tests__/auth-errors.test.ts`: 알려진 코드 → 한국어, 모르는 코드 → fallback, null → fallback.
- `actions.ts`의 `error.message` 반환 3곳 → `toUserMessage(error)`. 각 위치 바로 위에 `console.error("[auth:<action>]", error.code, error.message);`.
- 회원가입 성공/`user_already_exists` 모두 같은 문구: "입력한 주소로 안내 메일을 보냈습니다. 메일함을 확인해주세요." (계정 열거 방지)

### Step 1.5 로그인 후 복귀 경로 (B-2)
- `src/lib/safe-next.ts` 신규 + 테스트(`/a` 통과, `//evil` 차단, `https://x` 차단, 빈 문자열 → `/`).
- `AuthForm`에 `next?: string` prop과 `<input type="hidden" name="next" value={next ?? "/"} />`.
- `login/page.tsx`: `searchParams`에서 `next`를 읽어 `AuthForm`에 전달. 기존 `required` 파라미터도 유지.
- `AppCard.tsx:47` 잠긴 카드 링크: `/login?required=1` → `` `/login?required=1&next=${encodeURIComponent(`/category/${app.category}`)}` ``.
- `loginAction` 끝: `redirect(safeNext(getString(formData, "next")));`

### Step 1.6 보안 헤더 (A-5) — `next.config.mjs`
- `DESIGN.md Step 1.6` 코드. CSP는 **Report-Only**. `typedRoutes: true` 추가 시 타입 오류가 나는 href가 있으면 고친다(동적 문자열 href는 `as Route` 대신 템플릿 리터럴 타입을 쓰거나, 이 Phase에서는 `typedRoutes`를 넣지 않고 Phase 3에서 넣는다 — 오류가 3곳 이상이면 후자).

### Step 1.7 가입 폼 autocomplete (B-4)
- `AuthForm`에 `passwordAutoComplete?: "current-password" | "new-password"`(기본 `current-password`). `signup/page.tsx`에서 `"new-password"` 전달.

### 체크포인트 커밋
- `fix(category): hide locked apps from guests in featured card (A-1)`
- `fix(auth): stop logging members out via admin flow (B-1)`
- `fix(auth): fail closed when profile lookup fails (A-3)`
- `fix(auth): map supabase errors to korean messages (A-4)`
- `feat(auth): return to requested page after login (B-2)`
- `feat(security): add response security headers (A-5)`
- `fix(signup): use new-password autocomplete (B-4)`

## 범위 밖 (하지 말 것)
- `middleware.ts` 변경, `proxy.ts` 생성(Phase 2)
- `/admin-login` 삭제, 서버 액션 통합·이동(Phase 2)
- 카탈로그 구조 변경, `/go` 라우트(Phase 3)
- 가짜 데이터("9:41", "60%") 제거·CSS 변경(Phase 4~5). 이 Phase에서 `ui-upgrade.test.tsx`는 그대로 통과해야 한다.

## 검증
```bash
npm run verify
npm run dev &            # .env.local 없어도 게스트로 렌더됨
sleep 8
curl -s localhost:3000/category/music-game | grep -c "nanta-play"        # 기대: 0
curl -s localhost:3000/category/instrument-education | grep -c "guitar-chord-viewer"   # 기대: ≥1 (공개 앱은 보여야 함)
curl -sI localhost:3000/ | grep -iE "x-content-type-options|x-frame-options|referrer-policy|permissions-policy|content-security-policy-report-only" | wc -l   # 기대: 5
curl -s "localhost:3000/login?next=/admin" | grep -c 'name="next"'       # 기대: 1
kill %1
```
`.env.local`이 있으면 추가로: 회원 계정 로그인 → 헤더 계정 칩 클릭 → 로그아웃되지 않고 악기 카테고리로 이동하는지, `/admin` 접근 시 403 안내가 나오는지 브라우저로 확인한다(Playwright가 설치돼 있으니 `npx playwright screenshot` 또는 간단한 스크립트로 캡처해도 좋다).

## 완료 기준
- [ ] 위 curl 5개 기대값 일치
- [ ] 새 테스트 ≥ 9개 추가(firstOpenableApp 3, normalizeRole 2, toUserMessage 3, safeNext 4 중 최소 9), 전체 통과
- [ ] `grep -rn "error.message" src/app/auth/actions.ts`가 `console.error` 줄에만 존재
- [ ] `grep -rn '?? "member"' src` 결과 없음
- [ ] `grep -rn "signOut" src/app/auth/actions.ts`가 `logoutAction` 안 1곳만
- [ ] `npm run verify` 통과, 기존 21 테스트 유지

## 멈추고 물어볼 조건
- `typedRoutes` 활성화가 3곳 이상 타입 오류를 낼 때(→ Phase 3으로 미루고 보고)
- `.env.local`이 없어 로그인 흐름을 확인할 수 없을 때는 멈추지 말고 "미확인"으로 보고

## 종료 시
1. `PROGRESS.md` 갱신. "발견 사항"에 이 Phase에서 본 범위 밖 문제를 적는다.
2. `refactor(phase-1): 긴급 수정 완료`
3. 보고. "사람이 해야 할 작업": PR 생성 → Vercel Preview에서 curl 5개 재확인 → **프로덕션 배포**.
````

---

### P-P2 — Phase 2: 인증·세션 계층 정리

````markdown
# [Phase 2] 인증·세션 계층 — proxy.ts, cache(), 액션 통합, 이메일 확인, 단일 로그인

## 역할
CLAUDE.md 규칙을 따르는 시니어 Next.js/Supabase 엔지니어. 이 세션은 **Phase 2만** 수행한다.

## 이번 세션의 목표
Next 16 규약(`proxy.ts`) 준수, 요청당 인증 왕복 최소화, 서버 액션 중복 제거, 가입→이메일 확인→로그인 흐름 완성, 로그인 화면 단일화.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md` — 특히 **D1(관리자 로그인 삭제), D6(JWT 키 타입), D7(도메인)**
2. `DESIGN.md` §2.3(현재 요청 흐름), §5.2(목표 요청 흐름), §3-B 전체, §6 **Phase 2 전체**(Step 2.1~2.6)
3. 소스: `middleware.ts`, `src/lib/supabase/*.ts`, `src/lib/auth.ts`, `src/lib/env.ts`, `src/app/auth/actions.ts`, `src/components/AuthForm.tsx`, `src/components/StatusBanner.tsx`, `src/app/{login,signup,admin-login,admin}/page.tsx`, `src/lib/auth-errors.ts`, `src/lib/safe-next.ts`
4. `node_modules/@supabase/ssr/README.md`와 `node_modules/@supabase/supabase-js/dist/module/lib/types.d.ts`에서 `getClaims` 시그니처 확인

## 이미 결정됨
- D1: `/admin-login` 삭제, `adminLoginAction` 삭제. `next.config.mjs` `redirects()`에 `/admin-login → /login` (permanent). 관리자는 `/login`으로 로그인 후 `/admin` 진입. `AuthForm`은 `variant: "login" | "signup"` 두 가지만.
- D6에 따라: 비대칭 키면 프록시에서 `getClaims()`, HS256/미확인이면 `getUser()`. 어느 쪽이든 서버 컴포넌트의 `getCurrentUserProfile`는 `getUser()`를 쓴다(DB 조회 전 신뢰 가능한 사용자 확인).
- 새 코드는 `src/features/auth/` 아래. `src/lib/auth.ts`, `auth-form-state.ts`, `auth-validation.ts`, `auth-errors.ts`, `safe-next.ts` 중 인증 관련은 `features/auth/`로 이동(`safe-next.ts`는 `src/lib/`에 둔다).
- 테스트 파일은 소스 옆 `__tests__/`로 함께 이동한다.

## 작업

### Step 2.0 브랜치 `refactor/phase-2-auth`

### Step 2.1 `middleware.ts` → `proxy.ts`
- `npx @next/codemod@canary middleware-to-proxy .`를 시도한다. 없거나 실패하면 수동으로: 루트 `proxy.ts`(`export async function proxy`), `src/lib/supabase/middleware.ts` → `src/lib/supabase/proxy.ts`로 `git mv`. matcher는 `DESIGN.md Step 2.1` 값(`icons/`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml` 제외 추가).
- `updateSession` 내부 호출: D6에 따라 `await supabase.auth.getClaims()` 또는 `await supabase.auth.getUser()`. 선택 이유를 함수 위 주석 한 줄로.
- `middleware.ts` 삭제. `grep -rn "middleware" --include=*.ts --include=*.tsx --include=*.mjs . | grep -v node_modules` 결과 0.

### Step 2.2 인증 서비스 + `cache()`
- `src/features/auth/types.ts`(`CurrentUserProfile`, `AuthState`, `initialAuthState`), `src/features/auth/service.ts`(`import "server-only"`, `cache(getCurrentUserProfile)`, fail-closed 로직은 Phase 1 것을 유지) — `DESIGN.md Step 2.2`.
- `src/features/auth/errors.ts` ← `src/lib/auth-errors.ts` 이동(테스트 포함).
- `src/features/auth/validation.ts`: `DESIGN.md Step 2.3`의 `credentialsFromForm` (이메일 정규식, 소문자 정규화, `PASSWORD_MIN`). 기존 `validateCredentials/getString` 삭제. 테스트 재작성(`src/features/auth/__tests__/validation.test.ts`: 유효/무효 이메일 4, 짧은 비번, 공백 트림, 대문자 이메일 소문자화).
- 모든 import 경로 갱신. `src/lib/auth.ts`, `src/lib/auth-form-state.ts`, `src/lib/auth-validation.ts`, `src/lib/auth-errors.ts` 삭제.

### Step 2.3 서버 액션 통합 — `src/app/auth/actions.ts` 재작성
- `DESIGN.md Step 2.3` 코드: `parse()` 공통 → `signUpAction`(`emailRedirectTo` = `${siteUrl}/auth/confirm?next=…`), `loginAction`(`redirect(p.next)`), `logoutAction`. `adminLoginAction` 삭제.
- `siteUrl`은 `getPublicEnv().siteUrl`. `.env.example`의 `NEXT_PUBLIC_SITE_URL` 주석에 "이메일 확인 링크 생성에 사용. 배포 도메인과 일치해야 함" 추가.
- 파일 길이 ≤ 100줄.

### Step 2.4 이메일 확인 콜백 — `src/app/auth/confirm/route.ts`
- `DESIGN.md Step 2.4` 코드. 실패 시 `/login?notice=confirm-failed`.
- `login/page.tsx`: `notice` 값별 안내 문구 — `required` → "이 앱은 회원 로그인 후 이용할 수 있습니다.", `confirm-failed` → "인증 링크가 만료되었거나 올바르지 않습니다. 다시 가입하거나 로그인해주세요.", `confirmed` → "이메일 인증이 완료되었습니다. 로그인해주세요." (confirm 성공 시 `next`가 `/`면 `/login?notice=confirmed`로 보내는 것이 더 명확하다 — `verifyOtp` 성공은 세션을 만들므로 바로 `next`로 보내도 된다. **세션이 생기면 `next`로, 아니면 `/login?notice=confirmed`**로 분기.)

### Step 2.5 `AuthForm` 정리
- props: `variant`, `next?`, `notice?`. 제목·설명·버튼 문구·autocomplete는 variant 테이블(`src/content/ko.ts` 신규, `auth.login.title` 식 키).
- `StatusBanner`: `role={tone === "error" ? "alert" : "status"}`, `aria-live="polite"`.
- 하단 교차 링크(login ↔ signup), `next`를 쿼리로 넘겨 유지.
- `title.includes("관리자")` 로직 삭제.

### Step 2.6 파일 정리 + 리다이렉트
- `src/app/admin-login/` 삭제. `next.config.mjs`에 `redirects()`: `{ source: "/admin-login", destination: "/login", permanent: true }`.
- `src/app/admin/page.tsx`의 `redirect("/admin-login")` 흔적 제거(Phase 1에서 이미 `/login?next=/admin`).
- `SiteHeader.tsx`가 `getCurrentUserProfile` 타입을 `features/auth/types`에서 가져오도록 수정.

### 체크포인트 커밋
- `refactor(auth): migrate middleware to proxy.ts`
- `refactor(auth): add cached auth service under features/auth`
- `refactor(auth): consolidate server actions`
- `feat(auth): add email confirmation callback route`
- `refactor(auth): simplify AuthForm variants and notices`
- `refactor(auth): remove admin-login route`

## 범위 밖
- 카탈로그·`/go` 라우트(Phase 3). `AppCard` 링크는 아직 외부 URL 그대로.
- UI 셸·CSS(Phase 4~5). `AuthForm` 마크업 구조는 유지하고 props/문구만 바꾼다.
- DB 마이그레이션(Phase 3).

## 검증
```bash
npm run verify
grep -rn "middleware" --include=*.ts --include=*.tsx --include=*.mjs . | grep -v node_modules | wc -l   # 기대: 0
wc -l src/app/auth/actions.ts                                                                        # 기대: ≤ 100
ls src/app/admin-login 2>&1 | grep -c "No such"                                                      # 기대: 1
grep -rn "adminLoginAction\|getCurrentRole\|validateCredentials" src | wc -l                         # 기대: 0
npm run dev & sleep 8
curl -sI localhost:3000/admin-login | grep -i "^location"      # 기대: /login
curl -s "localhost:3000/login?notice=required" | grep -c "회원 로그인 후"    # 기대: 1
kill %1
```
`.env.local`이 있고 D6이 비대칭 키라면: 서버 로그에 요청 1회당 Auth API 호출이 `getUser` 1회만인지 확인(프록시는 로컬 검증). 확인 방법: `src/lib/supabase/server.ts`의 `createServerClient`에 임시로 `global: { fetch: (…args) => { console.log("[supabase fetch]", args[0]); return fetch(…args); } }`를 넣어 홈 1회 로드 시 로그 줄 수를 세고, 확인 후 **제거**한다.

## 완료 기준
- [ ] 위 grep/curl 기대값 일치
- [ ] `features/auth/__tests__/` 테스트 ≥ 12개 통과(validation 7+, errors 3+, 기타)
- [ ] 홈 1회 렌더 시 Supabase Auth 네트워크 호출 ≤ 1회(비대칭 키) 또는 ≤ 2회(HS256) — 측정값을 보고에 적는다
- [ ] `npm run build` 출력에 middleware deprecation 경고 없음

## 멈추고 물어볼 조건
- codemod가 예상치 못한 파일을 바꿀 때(diff 보고 후 진행 여부)
- D6이 비어 있어 키 타입을 모를 때 → `getUser()`로 진행하고 Human TODO에 기록(멈추지 않음)

## 종료 시
1. `PROGRESS.md` 갱신. **Human TODO에 반드시 추가**:
   - [ ] Supabase Email Templates → Confirm signup 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`로 변경
   - [ ] URL Configuration: Site URL = D7 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<D7 도메인>/**`
   - [ ] 위 두 작업 **완료 후** Phase 2 배포(순서 바뀌면 확인 메일 링크가 깨짐)
2. `refactor(phase-2): 인증·세션 계층 정리 완료`
3. 보고.
````

---

### P-P3 — Phase 3: 도메인·데이터 계층

````markdown
# [Phase 3] 도메인·데이터 계층 — 카탈로그 정규화, /go 서버 게이트, DB 타입, 프로필 하드닝

## 역할
CLAUDE.md 규칙을 따르는 시니어 TypeScript/Postgres 엔지니어. 이 세션은 **Phase 3만** 수행한다.

## 이번 세션의 목표
외부 앱 URL이 HTML에 단 한 번도 나타나지 않게 `/go/[appId]` 서버 게이트를 세우고, 카탈로그를 정규화(중복 통합, 접근 등급 타입화)하고, DB 권한을 컬럼 단위로 조이며, Supabase 타입을 도입한다.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md` — **D3(중복 앱 통합), D4(보호 수준: /go 게이트만)**
2. `DESIGN.md` §3-A(A-2, A-6, A-7, A-8), §3-E 전체, §5.3(접근 제어 모델), §6 **Phase 3 전체**(Step 3.1~3.4), §7.1(보안 검증 표)
3. 소스: `src/lib/apps.ts`, `src/lib/access.ts`, `src/lib/__tests__/{apps,access}.test.ts`, `src/components/{AppCard,AppGrid,CategoryButton}.tsx`, `src/app/page.tsx`, `src/app/category/[category]/page.tsx`, `src/app/admin/page.tsx`, `src/features/auth/service.ts`, `supabase/migrations/202606170001_create_profiles.sql`
4. `public/icons/` 파일 목록(`ls public/icons`)

## 이미 결정됨
- D3: `tongue-drum-edu`+`tongue-drum-game` → `tongue-drum`, `kalimba-edu`+`kalimba-game` → `kalimba`. `categories` 배열. 앱 14개. 이름은 "텅드럼", "칼림바"(설명은 교육·게임 양쪽을 포괄하게 1문장).
- `access: "public" | "member"`. 현재 `publicAccess: true`인 2개(guitar-chord, ukulele-chord)만 `public`.
- `icon` 경로는 이 Phase에서는 기존 `.png` 유지(Phase 7에서 `.webp`).
- 기존 마이그레이션 파일은 **절대 수정하지 않음**. 새 파일 `supabase/migrations/202610210001_profiles_hardening.sql`.
- 마이그레이션 **적용**은 사람 승인 후. Supabase MCP 도구(`apply_migration`)가 연결되어 있어도 적용 전에 반드시 멈추고 SQL 전문을 보여 준 뒤 "진행" 답을 받는다.
- `typedRoutes: true`가 아직 꺼져 있으면 이 Phase에서 켠다.

## 작업

### Step 3.0 브랜치 `refactor/phase-3-domain`

### Step 3.1 카탈로그 재모델링 — `src/features/catalog/`
- 파일: `categories.ts`, `apps.ts`, `access.ts`, `stats.ts` — `DESIGN.md Step 3.1` 코드 기준. `src/lib/apps.ts`, `src/lib/access.ts` 삭제.
- `LessonApp.categoryLabel` 제거, `CATEGORY_LABELS`/`getCategoryLabel` 제거. 카드의 카테고리 필 문구는 `CATEGORY_META[c].shortLabel`에서.
- `access.ts`: `UserRole`, `normalizeRole`, `canOpenApp`, `canAccessAdminPage`, `roleLabel`, Phase 1의 `firstOpenableApp`.
- 카탈로그 무결성 테스트 `src/features/catalog/__tests__/apps.test.ts`:
  - id 유일, id는 `^[a-z0-9-]+$`
  - url `https://`로 시작, 끝에 `/`
  - `icon` 파일이 `public/`에 실제 존재(`fs.existsSync(path.join(process.cwd(), "public", icon))`)
  - `categories.length ≥ 1`, 모두 `APP_CATEGORIES`에 포함
  - `description.length ≥ 12`
  - 전체 14개, public 2개
  - 같은 url을 가진 앱이 2개 이상 없음(중복 통합 회귀 방지)
- 기존 `access.test.ts`를 `features/catalog/__tests__/access.test.ts`로 옮기고 `publicAccess` → `access` 픽스처 갱신.

### Step 3.2 `/go/[appId]` 서버 게이트 — TDD
1. **테스트 먼저** `src/app/go/__tests__/route.test.ts`: `getCurrentUserProfile`를 `vi.mock`하고 `GET(request, { params: Promise.resolve({ appId }) })` 호출.
   - 알 수 없는 id → 404
   - guest × public → 302, `Location` = 앱 url, `Cache-Control: no-store`
   - guest × member → 302, `Location`이 `/login?next=%2Fgo%2F<id>&notice=required`로 시작
   - member × member → 302 앱 url
   - admin × member → 302 앱 url
   - 프로필 조회가 `null`(비로그인) → guest로 취급
2. 구현 `src/app/go/[appId]/route.ts`: `DESIGN.md Step 3.2`. `export const dynamic = "force-dynamic"`.
3. 모든 외부 링크 교체:
   - `AppCard` "시작": `href={`/go/${app.id}`}` (`target="_blank" rel="noreferrer"` 유지). 잠김: `href={`/login?next=${encodeURIComponent(`/go/${app.id}`)}&notice=required`}`.
   - 홈·카테고리 "이어 학습하기" 카드: `/go/${featuredApp.id}`.
   - `grep -rn "\.url" src/components src/app` 결과가 `go/[appId]/route.ts`에만 남아야 한다.

### Step 3.3 Supabase DB 타입
- `SUPABASE_PROJECT_ID`가 env나 DECISIONS에 있고 `npx supabase --version`이 동작하면 `npm run db:types` 실행 → `src/lib/supabase/database.types.ts`.
- 불가능하면 **수동 최소 타입** 작성(`profiles` Row/Insert/Update, `set_profile_role` Function)하고 파일 상단에 `// TODO: npm run db:types 로 재생성` + PROGRESS Human TODO 등록. 멈추지 않는다.
- `src/lib/supabase/server.ts`, `client.ts`, `proxy.ts`: `createServerClient<Database>` / `createBrowserClient<Database>`. `features/auth/service.ts`의 `select("id,email,role")` 결과가 타입 추론되는지 `tsc`로 확인(일부러 `select("rol")` 오타를 넣어 에러가 나는지 보고 되돌린다).

### Step 3.4 DB 하드닝 마이그레이션 — 파일만 작성
- `supabase/migrations/202610210001_profiles_hardening.sql`: `DESIGN.md Step 3.4` SQL 전문(컬럼 권한, `private.is_admin()`, admin select 정책, 이메일 동기화 트리거, `set_profile_role` RPC, `updated_at`).
- 파일 작성 후 **멈추고** SQL 전문과 다음 안내를 출력한다:
  - 적용 명령: `supabase db push` 또는 SQL Editor 붙이기
  - 적용 후 확인: `supabase migration list`에 두 파일 모두 applied
  - 회원 토큰 검증 SQL: `update public.profiles set role='admin' where id = auth.uid();` → `permission denied for column role` 기대
  - 사람이 "진행" 또는 "적용 완료"라고 답하면 다음 Step으로.

### Step 3.5 마무리
- `AppGrid` 빈 상태 문구 "관리자 페이지에서 앱 구성을 다시 확인해 주세요." → "표시할 앱이 없습니다." 한 줄로(존재하지 않는 기능 안내 제거, E-6).
- `next.config.mjs`에 `typedRoutes: true`(아직 없으면). 타입 오류 수정.
- README "앱 카탈로그" 절: 앱 추가 방법(`features/catalog/apps.ts`에 항목 추가 + 아이콘), 중복 통합으로 16→14가 된 사유.

### 체크포인트 커밋
- `refactor(catalog): normalize catalog with access tiers and multi-category apps`
- `feat(go): add server-side access gate route`
- `refactor(ui): route all app links through /go`
- `chore(db): add generated supabase types`
- `feat(db): add profiles hardening migration`

## 범위 밖
- UI 레이아웃·CSS·가짜 데이터(Phase 4~5). 카드 마크업은 href만 바꾼다.
- `app_opens` 테이블·열람 기록(Phase 8).
- 하위 앱 자체의 보호(D4 보류).

## 검증
```bash
npm run verify
grep -rn "vercel.app" src --include=*.ts --include=*.tsx | grep -v __tests__ | cut -d: -f1 | sort -u
# 기대: src/features/catalog/apps.ts 만 (route.ts는 app.url 변수를 쓰므로 문자열이 없음)
npm run build && grep -rl "vercel.app" .next/server/app --include=*.html --include=*.rsc 2>/dev/null | wc -l   # 기대: 0
npm run dev & sleep 8
curl -sI localhost:3000/go/kalimba | grep -iE "^(HTTP|location)"          # 기대: 302, /login?next=%2Fgo%2Fkalimba&notice=required
curl -sI localhost:3000/go/guitar-chord | grep -iE "^(HTTP|location)"     # 기대: 302, https://guitar-chord-viewer.vercel.app/
curl -sI localhost:3000/go/nope | grep "^HTTP"                           # 기대: 404
curl -s localhost:3000/category/music-game | grep -c "vercel.app"        # 기대: 0
kill %1
```

## 완료 기준
- [ ] 위 검증 전부 기대값 일치
- [ ] 라우트 테스트 6개 + 카탈로그 무결성 테스트 7개 통과
- [ ] `LESSON_APPS.length === 14`
- [ ] `database.types.ts` 존재, Supabase 클라이언트 3곳에 제네릭 적용
- [ ] 마이그레이션 파일 존재, 기존 파일 diff 없음(`git diff main -- supabase/migrations/202606170001_create_profiles.sql` 비어 있음)
- [ ] (사람 확인) 마이그레이션 적용됨, 회원 role 변경 SQL이 거부됨

## 멈추고 물어볼 조건
- **마이그레이션 적용 직전(필수 정지)**
- 카탈로그 통합 시 두 항목의 설명/이름을 합치는 방식이 애매할 때 → 교육 쪽 설명을 기본으로 쓰고 보고(멈추지 않음)

## 종료 시
1. `PROGRESS.md` 갱신. Human TODO: 마이그레이션 적용·검증 SQL, `db:types` 재생성(수동 타입을 썼다면).
2. `refactor(phase-3): 도메인·데이터 계층 완료`
3. 보고에 "앱 16 → 14 정정" 릴리스 노트 문구 초안 포함.
````

---

### P-P4 — Phase 4: UI 셸 · 탐색 · 정직한 콘텐츠

````markdown
# [Phase 4] UI 셸 — 라우트 그룹, AppShell/BottomNav, 가짜 데이터 제거, 폰트·viewport, 상태 화면

## 역할
CLAUDE.md 규칙을 따르는 시니어 프론트엔드 엔지니어(모바일 웹 UX 중시). 이 세션은 **Phase 4만** 수행한다.

## 이번 세션의 목표
모든 화면이 같은 셸(헤더 + 본문 + 하단 탭)을 쓰고, 하단 탭이 현재 위치를 정확히 표시하고, 가짜 데이터·장식이 사라지고, 로딩/404/에러 화면이 생기며, 지정 폰트와 모바일 viewport가 적용된다.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md` — **D2(베젤 제거)**
2. `DESIGN.md` §2.4(화면 인벤토리), §3-C 전체, §3-F 전체, §5.1(목표 디렉터리), §5.4(탐색 모델), §5.5(디자인 토큰), §6 **Phase 4 전체**(Step 4.1~4.6), §6 Phase 5 Step 5.2의 `tokens.css`
3. 소스: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/category/[category]/page.tsx`, `src/app/admin/page.tsx`, `src/components/*.tsx`, `src/components/__tests__/ui-upgrade.test.tsx`, `src/app/globals.css` 1287~2048줄(v2 모바일 레이어 — 새 모듈로 옮길 규칙의 원본)
4. `design/mockups/` 또는 루트 `1.png 2.png 3.png`(모바일 목업) — 이미지를 **열어서** 의도된 레이아웃을 본다

## 이미 결정됨
- D2: 폰 베젤·노치·가짜 상태바 제거. `AppShell`은 `max-width: var(--shell-max)`(480px) 중앙 컬럼, 600px 이상에서 카드형(라운드+그림자).
- **설계문서 조정**: `src/styles/tokens.css`(§5.5)는 Phase 5가 아니라 **이 Phase에서 먼저 만든다**. 새 컴포넌트가 토큰을 써야 하기 때문. `globals.css` 최상단에 `@import "../styles/tokens.css";`를 추가하고, 기존 2,048줄은 **아직 삭제하지 않는다**(Phase 5). 새 컴포넌트는 CSS Modules + 새 토큰만 사용한다.
- 이 Phase에서 새로 만드는 컴포넌트: `components/shell/{AppShell,AppHeader,BottomNav}`, `components/catalog/{AppCard,AppGrid,CategoryCard}`, `components/ui/{Stat,AccessDenied}`. 각자 `*.module.css`.
- 기존 `SiteHeader.tsx`, `SiteFooter.tsx`, `CategoryButton.tsx`, `components/AppCard.tsx`, `AppGrid.tsx`는 새 컴포넌트로 교체 후 **삭제**.
- `ui-upgrade.test.tsx`는 가짜 데이터("9:41", "60%")를 단언하므로 **삭제**하고 최소 테스트 2개로 대체(`BottomNav.test.tsx`, `AppCard.test.tsx`). 확장은 Phase 6.
- 하단 탭 항목: 홈 / 악기 / 게임 / (관리자만) 관리. `usePathname`으로 활성, `aria-current="page"`.
- 헤더: 브랜드(작게) + 인사 문구(역할별) + 계정 칩(게스트→`/login`, 회원→로그아웃 버튼 노출, 관리자→`/admin`). 퀵탭 삭제.
- 홈 `<h1>`은 "Lesson Designer". 카테고리 `<h1>`은 카테고리명. 카드 제목은 `<h3>`.
- 색만으로 상태를 구분하지 않는다(아이콘+텍스트 병기).

## 작업

### Step 4.0 브랜치 `refactor/phase-4-shell`

### Step 4.0.5 토큰 파일 (설계문서 §5.5)
- `src/styles/tokens.css` 생성. `globals.css` 1행에 `@import "../styles/tokens.css";`. 빌드 확인.

### Step 4.1 루트 레이아웃 — `src/app/layout.tsx`
- `DESIGN.md Step 4.1`: `next/font/local`로 Pretendard Variable(`node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`), `metadata`(title template, metadataBase=D7), `viewport`(`viewportFit: "cover"`, `themeColor`). `<html lang="ko" className={pretendard.variable}>`.
- `tokens.css`의 `--font-sans`가 `var(--font-pretendard)`를 먼저 참조하는지 확인.

### Step 4.2 라우트 그룹 + 셸
- `git mv`로 이동: `src/app/page.tsx` → `src/app/(app)/page.tsx`, `category/` → `(app)/category/`, `admin/` → `(app)/admin/`, `login/`·`signup/` → `(auth)/…`. `auth/actions.ts`, `auth/confirm/`, `go/`는 그대로.
- `src/app/(app)/layout.tsx`: `getCurrentUserProfile()` → `<AppShell profile>`.
- `src/app/(auth)/layout.tsx`: 셸 없이 같은 폭 컬럼 + 상단 "← 홈" 링크.
- `AppShell.tsx`(server) / `AppShell.module.css`: `DESIGN.md Step 5.3` 셸 CSS를 **이 Phase에서** 적용(베젤 제거는 D2 결정이므로 미루지 않음).
- `AppHeader.tsx`(server): 그라데이션 헤더(`globals.css 1332-1345` 규칙을 모듈로 옮기고 토큰으로 치환), 상태바 블록·퀵탭 **없음**. 로그아웃은 `<form action={logoutAction}>` 유지.
- `BottomNav.tsx`("use client") + 모듈: `DESIGN.md Step 4.2` 코드. `position: sticky; bottom: 0; padding-bottom: calc(12px + var(--safe-b))`.
- 카테고리 톤: `(app)/category/[category]/page.tsx`가 셸 루트에 톤을 전달해야 한다. 서버 컴포넌트 간 전달이 번거로우면 `AppShell`이 `tone?: CategoryTone` prop을 받고, 카테고리 페이지는 자신의 섹션 루트에 `data-tone`을 단다. 레이아웃 전체 톤 전환은 Phase 5에서 정리(기록만).

### Step 4.3 홈 재구성 — `src/app/(app)/page.tsx`
- `DESIGN.md Step 4.3` 구성: (1) 인사 히어로(역할별 문구 + CTA) (2) `CategoryCard` ×2 (3) "바로 시작" 가로 스크롤(게스트: public 앱 / 회원: `firstOpenableApp` 기반 상위 4개 — 열람 기록은 Phase 8) (4) `Stat` ×3(전체/공개/회원용, 카탈로그 계산).
- 삭제: 스트릭/XP/`10/50`/22% 진행바/`60%`/"LD 수업 허브" 타일.

### Step 4.4 카테고리 화면
- `generateMetadata` → `{ title: meta.label, description: meta.description }`.
- 본문 탭바(`mobileTabBar`) 삭제. 상단 "← 홈" 유지.
- 히어로(카테고리명·설명·`Stat` 3개) → "이어 학습하기"(`firstOpenableApp`, 진행률 없음, "바로 열기") → 권한 요약 스트립(전체 N개 · 현재 상태: 게스트/회원/관리자 아이콘+텍스트) → `AppGrid`.
- `Suspense`: 역할 의존 부분(`RoleAwareGrid` 서버 컴포넌트)을 `<Suspense fallback={<GridSkeleton />}>`로 감싼다. 카탈로그 히어로는 즉시 렌더.

### Step 4.5 상태 화면
- `src/app/(app)/loading.tsx`(셸 안 스켈레톤), `src/app/not-found.tsx`(셸 폭 컬럼, "찾을 수 없는 화면입니다" + 홈 버튼), `src/app/error.tsx`("use client", `reset()` 버튼, `error.digest`만 표시).
- `(app)/admin/page.tsx`: 비로그인 → `redirect("/login?next=/admin")`, 회원 → `<AccessDenied />`(components/ui), 관리자 → 카탈로그 요약 `Stat` + "회원 관리(준비 중)" 안내 섹션.

### Step 4.6 `AppCard`/`AppGrid`/`CategoryCard`
- `components/catalog/AppCard.tsx`: `DESIGN.md Step 4.6` 마크업(`data-tone`, `data-locked`, 상태 배지 아이콘+텍스트, `h3`, 진행률 없음, `/go/` 링크, `sr-only "(새 창에서 열림)"`). 모듈 CSS는 `globals.css 1841-1933` 규칙을 토큰으로 치환해 옮긴다(진행률 규칙 제외).
- `CategoryCard.tsx`: 기존 `CategoryButton` 마크업 + `globals.css 1655-1720`을 모듈로. `aria-label` 대신 보이는 텍스트로 충분하게.
- 모든 터치 타깃 ≥ 44px(`--tap`). `font-weight` 950 사용 금지(800 상한).

### Step 4.7 테스트 교체
- `src/components/__tests__/ui-upgrade.test.tsx` 삭제.
- `components/shell/__tests__/BottomNav.test.tsx`: `vi.mock("next/navigation", () => ({ usePathname: () => "/category/music-game" }))` → "게임" 링크에 `aria-current="page"`, 다른 링크엔 없음; `role="guest"`면 "관리" 없음, `"admin"`이면 있음.
- `components/catalog/__tests__/AppCard.test.tsx`: public+guest → `href="/go/guitar-chord"`; member 앱+guest → `href`가 `/login?next=%2Fgo%2F`로 시작, 텍스트 "회원용"; DOM에 `vercel.app` 문자열 없음(`container.innerHTML`).

### 체크포인트 커밋
- `style(tokens): add single design token file`
- `feat(layout): add pretendard font, viewport and metadata`
- `refactor(app): introduce route groups and AppShell`
- `feat(nav): add client BottomNav with active state`
- `refactor(home): remove placeholder metrics and rebuild sections`
- `refactor(category): remove duplicate tabs, add suspense and metadata`
- `feat(app): add loading, not-found, error and access-denied screens`
- `refactor(catalog-ui): rebuild AppCard/CategoryCard with css modules`
- `test(ui): replace prototype assertions with nav and card tests`

## 범위 밖
- `globals.css`의 레거시 규칙 삭제, `base.css`, AuthForm/StatusBanner 모듈화(Phase 5). 단, 새 컴포넌트가 레거시 클래스명(`appTile`, `bottomNav` 등)을 **쓰지는 않는다** — 충돌 방지.
- e2e·스냅샷(Phase 6).
- 열람 기록·실제 진행률(Phase 8).

## 검증
```bash
npm run verify
grep -rn "9:41\|XP\|60%\|0일 연속\|10/50" src | wc -l                 # 기대: 0
grep -rn "font-weight: 9[0-9][0-9]" src --include=*.css | wc -l       # 기대: 0
grep -rn "SiteHeader\|SiteFooter\|CategoryButton" src | wc -l         # 기대: 0
ls src/app/\(app\)/loading.tsx src/app/not-found.tsx src/app/error.tsx
npm run dev & sleep 8
for p in / /category/instrument-education /category/music-game /login /nope; do printf "%s -> " $p; curl -s -o /dev/null -w "%{http_code}\n" localhost:3000$p; done   # 기대: 200 200 200 200 404
curl -s localhost:3000/category/music-game | grep -o 'aria-current="page"' | wc -l   # 기대: 1
kill %1
```
그리고 Playwright로 스크린샷 4장(390×844: `/`, `/category/instrument-education`, `/category/music-game`, `/login`)과 데스크톱 1장(1280×800: `/`)을 `design/qa/phase4/`에 저장한다(간단한 Node 스크립트 또는 `npx playwright screenshot --viewport-size=390,844 <url> <file>`). 저장 경로를 보고에 적는다. 베젤·상태바가 보이면 실패다.

## 완료 기준
- [ ] 위 검증 전부 기대값 일치
- [ ] 스크린샷 5장 저장, 데스크톱에서 베젤 없음, 모바일에서 하단 탭이 뷰포트 하단에 고정
- [ ] 모든 인터랙티브 요소 높이 ≥ 44px(스크린샷 또는 `getBoundingClientRect` 스크립트로 확인)
- [ ] `BottomNav`/`AppCard` 테스트 통과, 삭제된 `ui-upgrade.test.tsx` 없음
- [ ] Lighthouse 모바일 Accessibility ≥ 95(`npx lighthouse http://localhost:3000 --only-categories=accessibility --preset=desktop=false --quiet --chrome-flags="--headless"` 또는 Chrome DevTools) — 실행 불가 환경이면 "미측정"으로 보고

## 멈추고 물어볼 조건
- 목업(1~3.png)과 설계문서 Step 4.3의 섹션 구성이 충돌해 어느 쪽을 따를지 애매할 때 → **설계문서 우선**, 차이는 보고(멈추지 않음)
- 라우트 그룹 이동으로 `auth/actions.ts` import 경로가 10곳 이상 깨질 때(→ 정상, 계속)

## 종료 시
1. `PROGRESS.md` 갱신. "발견 사항"에 Phase 5로 넘길 레거시 CSS 범위를 적는다(어느 모듈이 어느 globals 라인을 대체했는지).
2. `refactor(phase-4): UI 셸·탐색·콘텐츠 정리 완료`
3. 보고에 스크린샷 경로 포함. "사람이 해야 할 작업": 스크린샷·Vercel Preview 디자인 검토(P-D 프롬프트 사용 권장).
````

---

### P-P5 — Phase 5: CSS 아키텍처 재구축

````markdown
# [Phase 5] CSS 재구축 — 레거시 삭제, base.css, 남은 모듈화, 토큰 1벌

## 역할
CLAUDE.md 규칙을 따르는 CSS 아키텍처에 능한 프론트엔드 엔지니어. 이 세션은 **Phase 5만** 수행한다.

## 이번 세션의 목표
`globals.css` 2,048줄을 `@import` 2줄로 줄이고, 모든 스타일을 `tokens.css` + `base.css` + CSS Modules로 옮긴다. 총 CSS ≤ 900줄, `:root` 1개, 모듈 밖 hex 0.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`(Phase 4가 남긴 "어느 모듈이 어느 globals 라인을 대체했는지"), `DECISIONS.md`
2. `DESIGN.md` §2.5(CSS 레이어 구조), §3-D 전체, §5.5, §6 **Phase 5 전체**(Step 5.1~5.5), §9.2(삭제 대상)
3. `src/app/globals.css` 전체(2,048줄 — 삭제 대상이므로 끝까지 읽는다), `src/styles/tokens.css`, 모든 `*.module.css`
4. `src/components/auth/AuthForm.tsx`, `StatusBanner.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(app)/page.tsx`, `category/[category]/page.tsx`, `admin/page.tsx`, `not-found.tsx`, `error.tsx`, `loading.tsx`

## 이미 결정됨
- `globals.css` 최종 내용은 정확히 두 줄: `@import "../styles/tokens.css";` `@import "../styles/base.css";`
- `base.css`는 `DESIGN.md Step 5.2` 내용(리셋, 타이포 기본, `.sr-only`, 전역 `:focus-visible`, reduced-motion).
- 카테고리 톤 전환은 `[data-tone="play"] { --c-tone: …; --c-tone-soft: …; }` 하나로. 조합 셀렉터(`.a.b .c`) 금지. 셀렉터 특이성 상한 (0,2,0).
- `font-weight`는 400/600/700/800만. 그림자·라운드·색은 토큰만.
- CSS 문자열 테스트 2파일(`ui-css.test.ts`, `motion-css.test.ts`) **삭제**.
- Stylelint는 **도입한다**(Step 5.5 "선택" → 이 프로젝트에서는 필수): `stylelint`, `stylelint-config-standard`, 규칙 `color-no-hex`(tokens.css 제외), `selector-max-specificity: "0,2,0"`, `declaration-no-important`. `npm run lint`에 `stylelint "src/**/*.css"` 추가.

## 작업

### Step 5.0 브랜치 `refactor/phase-5-css` + 기준선 스크린샷
- 작업 **전에** Phase 4와 같은 5장을 `design/qa/phase5-before/`에 저장한다(회귀 비교용).

### Step 5.1 문자열 테스트 삭제
- `src/lib/__tests__/ui-css.test.ts`, `src/lib/__tests__/motion-css.test.ts` 삭제. `npm test` 통과 확인.

### Step 5.2 `base.css` + `globals.css` 축소
- `src/styles/base.css` 작성. `globals.css`를 두 줄로 바꾸되, **한 번에 바꾸지 말고** 아래 Step 5.3의 모듈을 하나 완성할 때마다 해당 레거시 블록을 지우는 방식으로 진행한다. 마지막에 남는 것이 두 줄이어야 한다.

### Step 5.3 남은 모듈화 (순서대로, 각 항목 뒤 `npm run build` + 해당 화면 스크린샷 1장)
| 순서 | 모듈 | 옮길 원본(globals.css) | 지울 레거시 |
|---|---|---|---|
| 1 | `components/auth/AuthForm.module.css` | 904-1058 | 동일 범위 |
| 2 | `components/auth/StatusBanner.module.css` | 1060-1086 | 동일 범위 |
| 3 | `app/(auth)/auth-layout.module.css` | 신규(셸 폭 컬럼) | — |
| 4 | `app/(app)/home.module.css` | 1545-1633 중 유지분 | 1479-1543, 1545-1633 |
| 5 | `app/(app)/category/category.module.css` | 1749-1834 중 유지분 | 동일 + 1792-1799 |
| 6 | `components/ui/Stat.module.css` 보강 | 1722-1747 | 650-684 |
| 7 | 상태 화면 `app/status.module.css`(loading/not-found/error 공용) | 886-902 | 동일 |
| 8 | 레거시 일괄 삭제 | — | 1-1286 전부(v1 레이어), 1287-2048 잔여 |
- 각 모듈은 토큰만 참조. 원본의 hex/rgba는 가장 가까운 토큰으로 매핑하고, 매핑 불가한 색이 나오면 `tokens.css`에 토큰을 **추가**(이름은 역할 기반 `--c-*`, `--sh-*`).
- `.pill`, `.eyebrow` 같은 공용 유틸은 `components/ui/Pill.tsx` + 모듈로 승격(전역 클래스 금지).

### Step 5.4 데스크톱 셸 점검
- `AppShell.module.css`의 600px 이상 카드형 레이아웃이 D2대로인지, 1280px에서 좌우 여백·그림자가 어색하지 않은지 스크린샷으로 확인. 폰 베젤 흔적(`phoneFrame`, `deviceStage`) 완전 삭제.

### Step 5.5 Stylelint
- 설정 `.stylelintrc.json`, 규칙 위와 같음. `tokens.css`는 `color-no-hex` 예외(`overrides`). `npm run lint`에 통합. 위반 0까지 수정.

### Step 5.6 after 스크린샷
- `design/qa/phase5-after/` 5장. before/after를 나란히 보고 **의도되지 않은** 차이(간격·폰트 크기·색 변화)를 목록화. 의도된 차이(베젤 제거 등)는 제외.

### 체크포인트 커밋
- `test(css): remove string-based css tests`
- `style(base): add base stylesheet and shrink globals`
- `style(auth): move auth styles to css modules`
- `style(pages): move home/category/status styles to css modules`
- `style: delete legacy v1/v2 global stylesheet rules`
- `chore(lint): add stylelint with token-only color rule`

## 범위 밖
- 컴포넌트 구조·마크업 변경(클래스명 교체 외). 레이아웃 재설계는 하지 않는다.
- 새 기능, 테스트 추가(삭제 2개 외). e2e·스냅샷은 Phase 6.

## 검증
```bash
npm run verify
find src -name "*.css" | xargs wc -l | tail -1                      # 기대: total ≤ 900
grep -rn ":root" src --include=*.css | wc -l                        # 기대: 1 (tokens.css)
grep -rn "#[0-9a-fA-F]\{3,8\}\b" src --include=*.css | grep -v tokens.css | wc -l   # 기대: 0
grep -rn "!important" src --include=*.css | grep -v base.css | wc -l # 기대: 0 (reduced-motion 블록만 허용)
grep -rn "font-weight: 9" src --include=*.css | wc -l               # 기대: 0
wc -l src/app/globals.css                                           # 기대: 2
grep -rn "phoneFrame\|deviceStage\|appTile\|bottomNav\|mobileTabBar\|appStatusBar" src | wc -l   # 기대: 0
npx stylelint "src/**/*.css"                                        # 기대: 위반 0
```

## 완료 기준
- [ ] 위 수치 전부 충족
- [ ] before/after 스크린샷 10장 저장, 의도되지 않은 차이 목록이 비어 있거나 전부 수정됨
- [ ] 1280px 데스크톱에서 베젤 없음, 중앙 카드형 컬럼
- [ ] `npm run lint`에 stylelint 포함되어 통과

## 멈추고 물어볼 조건
- 레거시 블록을 지웠을 때 Phase 4가 만든 모듈이 아직 덮지 않은 화면 요소가 깨질 때 → 해당 요소를 모듈에 추가하고 계속(멈추지 않음). 단, 어느 화면의 무엇인지 보고.
- 토큰 추가가 8개를 넘어갈 때(토큰 인플레이션 신호 → 목록 보고 후 계속)

## 종료 시
1. `PROGRESS.md` 갱신(CSS 줄 수 before/after 수치 기록).
2. `refactor(phase-5): CSS 아키텍처 재구축 완료`
3. 보고에 스크린샷 비교 경로. "사람이 해야 할 작업": P-D로 디자인 검토 → Vercel Preview 승인.
````

---

### P-P6 — Phase 6: 테스트 · 품질 보증

````markdown
# [Phase 6] 테스트·품질 — 액션/라우트 단위 테스트, Playwright e2e, 시각 스냅샷, axe, CSP enforce

## 역할
CLAUDE.md 규칙을 따르는 테스트 엔지니어 성향의 시니어 개발자. 이 세션은 **Phase 6만** 수행한다.

## 이번 세션의 목표
위험 영역(서버 액션, `/go` 게이트, 역할 게이팅, 리다이렉트)을 단위 테스트로 덮고, 게스트/회원/관리자 e2e 3시나리오 + 시각 스냅샷 + 접근성 자동 검사를 CI에 올리고, CSP를 enforce로 전환할지 판단한다.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md` — **D8(테스트 계정)**
2. `DESIGN.md` §3-G 전체, §6 **Phase 6 전체**(Step 6.1~6.6), §7(검증 체크리스트 전체)
3. `src/app/auth/actions.ts`, `src/app/go/[appId]/route.ts`, `src/features/auth/*`, `src/components/**/__tests__/*`, `vitest.config.ts`, `.github/workflows/ci.yml`, `next.config.mjs`(CSP Report-Only)
4. `node_modules/@playwright/test/package.json`(설치 버전), `npx playwright --version`

## 이미 결정됨
- e2e는 **배포 전 Supabase 테스트 프로젝트 또는 로컬 `supabase start`** 중 D8/PROGRESS에 적힌 쪽. 둘 다 없으면 e2e 스펙은 작성하되 `test.skip(!process.env.E2E_MEMBER_EMAIL, "e2e 계정 없음")`으로 건너뛰게 하고 Human TODO 등록.
- 시각 스냅샷은 Chromium 390×844 고정, `maxDiffPixelRatio: 0.01`. 기준선은 이 Phase에서 생성해 커밋.
- 접근성: `@axe-core/playwright`, `serious`·`critical` 위반 0.
- CSP: Report-Only 수집 결과(Vercel 로그 또는 브라우저 콘솔)에 위반이 없으면 enforce. Next 인라인 스크립트 때문에 `'unsafe-inline'`이 필요하면 **nonce 방식으로 전환하지 않고** 현 수준(script-src 'self' 'unsafe-inline')으로 enforce — nonce는 별도 작업으로 기록.
- 커버리지 목표: `src/features/**`, `src/app/auth/**`, `src/app/go/**` 라인 ≥ 85%.

## 작업

### Step 6.0 브랜치 `refactor/phase-6-quality`

### Step 6.1 서버 액션 단위 테스트 — `src/app/auth/__tests__/actions.test.ts`
- `DESIGN.md Step 6.1` 코드 기준. 케이스:
  - login: 잘못된 이메일 → supabase 미호출 / 에러 코드 → 한국어 / 성공 → `next` 리다이렉트 / 오픈 리다이렉트 차단 / env 미설정 → 설정 안내 메시지
  - signup: `emailRedirectTo`가 `${siteUrl}/auth/confirm?next=…` 형태 / `user_already_exists` → 성공과 동일 문구 / 기타 에러 → 한국어
  - logout: `signOut` 호출 후 `/` 리다이렉트
- `redirect`는 throw하는 mock으로 처리(`REDIRECT:<to>`).

### Step 6.2 `/go` 라우트 테스트 보강
- Phase 3의 6케이스에 추가: `Cache-Control: no-store` 헤더, `Location`의 `next` 인코딩 정확성, id 대소문자/공백 처리(`/go/Kalimba` → 404).

### Step 6.3 컴포넌트 테스트 보강
- `AuthForm.test.tsx`: variant별 제목·autocomplete(`new-password`/`current-password`), hidden `next` 값, `StatusBanner`가 error면 `role="alert"`.
- `AppHeader.test.tsx`: 게스트→`/login` 칩, 회원→로그아웃 폼 존재, 관리자→`/admin` 칩.
- `CategoryCard.test.tsx`: 통계 문구에 `getCategoryStats` 값 반영.

### Step 6.4 Playwright
- `playwright.config.ts`: `testDir: "e2e"`, `baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000"`, `webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true }`, projects: `mobile-chromium`(390×844, `isMobile: true`). `use.screenshot: "only-on-failure"`.
- `e2e/guest.spec.ts`: 홈 로드 → 악기 탭 → 기타 코드 "시작" 클릭 → 새 페이지 URL에 `guitar-chord-viewer` 포함 → 칼림바 카드 "로그인하고 열기" → URL에 `/login?next=%2Fgo%2Fkalimba` → 직접 `/go/kalimba` 요청(`request.get`, `maxRedirects: 0`) → 302 + Location `/login…`.
- `e2e/member.spec.ts`: 로그인(D8 계정) → `/go/kalimba`로 복귀 302 외부 URL(요청 레벨 확인) → 전체 카드 "시작" 링크 수 = 14(전체 앱) → `/admin` → "관리자 전용" 텍스트 → 로그아웃 → 홈 게스트 상태.
- `e2e/admin.spec.ts`: 로그인 → 하단 탭 "관리" 존재 → `/admin` 200.
- `e2e/visual.spec.ts`: 홈/악기/게임/로그인 4장 `toHaveScreenshot()`.
- `e2e/a11y.spec.ts`: 4화면 axe, `impact ∈ {serious, critical}` 0.
- 로그인 헬퍼 `e2e/helpers/login.ts`(env에서 계정 읽기). 계정 없으면 `test.skip`.
- 스냅샷 기준선: `npx playwright test e2e/visual.spec.ts --update-snapshots`. 결과 이미지를 열어 비정상(빈 화면·폰트 미적용)이 없는지 확인 후 커밋.

### Step 6.5 CI 확장
- `ci.yml`에 `e2e` job 추가: `npx playwright install --with-deps chromium` → `npm run test:e2e`. e2e 계정 secret(`E2E_*`)이 없으면 visual/a11y/guest만 돌아가도록 spec의 `skip` 로직으로 처리. 단위 테스트 job에 `--coverage` + `coverage-summary.json`에서 features/auth/go 라인 커버리지가 85 미만이면 실패하는 짧은 node 스크립트(`scripts/check-coverage.mjs`).

### Step 6.6 CSP enforce 판단
- PROGRESS/사람 보고에 CSP 위반 로그가 있으면 반영해 정책 수정 후 `Content-Security-Policy`로 전환. 정보가 없으면 로컬에서 4화면을 열어 브라우저 콘솔 CSP 위반이 0인지 Playwright로 수집(`page.on("console")`에서 "Content Security Policy" 포함 메시지). 0이면 enforce, 아니면 Report-Only 유지하고 위반 목록 보고.

### 체크포인트 커밋
- `test(auth): cover server actions with unit tests`
- `test(go): extend access gate route tests`
- `test(ui): add header, auth form and category card tests`
- `test(e2e): add playwright guest/member/admin, visual and a11y specs`
- `ci: run e2e and enforce coverage threshold`
- `feat(security): enforce content security policy` (또는 `docs(security): record csp report-only findings`)

## 범위 밖
- 프로덕션 코드의 기능 변경. 테스트가 드러낸 버그는 **고치되** 어떤 버그였는지 보고에 분리 기재(`fix(...)` 커밋 분리).
- nonce 기반 CSP.
- 저장소 정리(Phase 7).

## 검증
```bash
npm run verify
npm run test -- --coverage 2>&1 | tail -30          # features/auth, app/auth, app/go ≥ 85%
npx playwright test --reporter=line                 # 기대: 통과 (계정 없으면 member/admin skipped 표시)
ls e2e/__snapshots__ 2>/dev/null || ls e2e/*-snapshots   # 기준선 4장 존재
grep -c "Content-Security-Policy\"" next.config.mjs  # enforce면 1
```

## 완료 기준
- [ ] 단위 테스트 총 ≥ 40케이스, 전부 통과, 커버리지 목표 충족
- [ ] e2e 5스펙 작성, 게스트/visual/a11y는 계정 없이도 통과
- [ ] axe serious/critical 0
- [ ] 스냅샷 기준선 커밋
- [ ] CI 워크플로에 e2e job 존재
- [ ] CSP 결정(enforce 또는 유지 사유) PROGRESS에 기록

## 멈추고 물어볼 조건
- 테스트가 **프로덕션 보안 버그**를 드러냈을 때(예: `/go`가 잠긴 앱을 통과시킴) → 즉시 보고 후 수정 진행
- e2e가 실제 Supabase 프로젝트에 계정을 **생성**해야 할 때(가입 플로우 e2e) → 이 Phase에서는 가입 e2e를 작성하지 않는다(로그인만)

## 종료 시
1. `PROGRESS.md` 갱신. Human TODO: e2e 계정 생성(미완이면), GitHub Secrets `E2E_*` 등록, CSP 위반 로그 확인.
2. `refactor(phase-6): 테스트·품질 보증 완료`
3. 보고에 커버리지 수치, 스킵된 스펙, 테스트가 발견한 버그 목록.
````

---

### P-P7 — Phase 7: 저장소 · 에셋 정리

````markdown
# [Phase 7] 저장소·에셋 — 디자인 산출물 격리, 중복 제거, 아이콘 파이프라인

## 역할
CLAUDE.md 규칙을 따르는 엔지니어. 이 세션은 **Phase 7만** 수행한다. 파일 이동이 많으므로 **`git mv`를 쓰고 한 Step마다 커밋**한다.

## 이번 세션의 목표
저장소 루트에 소스·설정·docs·design·public·scripts·supabase·e2e만 남기고, 아이콘을 256×256 webp(+png)로 재생성해 `public/icons`를 200KB 이하로 만든다.

## 시작 전에 읽을 것
1. `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md` — **D5(원본 아이콘 저장소 밖, 히스토리 재작성 안 함)**
2. `DESIGN.md` §3-E(E-7), §3-H(H-3, H-5), §3-I(I-2), §6 **Phase 7 전체**(Step 7.1~7.3)
3. `ls -la` 루트, `du -sh 아이콘 icons public/icons screenshots docs design 2>/dev/null`, `file public/icons/*`(drum.png이 실제 JPEG인지 확인), `src/features/catalog/apps.ts`의 icon 경로

## 이미 결정됨
- D5: `아이콘/` 폴더는 저장소에서 `git rm -r`. 삭제 전 **사람이 Drive 등으로 복사했는지 확인**(멈추고 묻는 조건). 히스토리 재작성(`git filter-repo`)은 하지 않는다.
- `design/` 구조: `design/exports/`(`*.dc.html`, `support.js`), `design/mockups/`(`1~3.png`), `design/screenshots/`(기존 `screenshots/`), `design/qa/`(Phase 4~5 스크린샷은 이미 여기), `design/icons-src/`(파이프라인 입력 14종만, `아이콘/`에서 선별 복사), `design/README.md`.
- `docs/superpowers/` → `docs/history/`로 이동. README에 "초기 계획서, 현 코드와 불일치" 명시.
- `음악&악기 교육 앱 Vercel 링크.md` → `docs/app-links.md`.
- `icons/`(루트)는 `public/icons`와 바이트 단위 동일 → 삭제. `.thumbnail` 삭제.
- 아이콘 출력: `public/icons/<id>.webp` + `<id>.png`, 256×256, 투명 배경, `fit: contain`. 카탈로그 `icon`은 `.webp`로.
- `drum`은 원본이 JPEG(불투명)이라 자동 변환으로는 투명 배경을 만들 수 없다 → `sharp`로 흰 배경 근사 제거(`flatten` 반대인 `removeAlpha` 아님 — 단순 임계값 제거는 품질이 나쁨). **이 Phase에서는 변환 결과를 그대로 쓰고 Human TODO로 "드럼 아이콘 배경 제거된 PNG 원본 제공"을 올린다.**

## 작업

### Step 7.0 브랜치 `refactor/phase-7-repo`

### Step 7.1 디자인 산출물 격리 (`DESIGN.md Step 7.1` 명령 기준)
- `git mv`로 이동 후 각 그룹 커밋. `design/README.md`에 각 폴더 설명 + 원본 아이콘 외부 링크 자리(`[Drive 링크 — 사람이 채움]`).
- `아이콘/` 삭제 **직전에 멈춘다**(아래 조건).

### Step 7.2 아이콘 파이프라인
- `design/icons-src/`에 현재 `public/icons` 14종의 **원본**을 `아이콘/`에서 찾아 `<id>.<ext>`로 복사(설계문서 `docs/history/.../implementation.md` Task 7 Step 1의 매핑표 참고: guitar ← `04-1 기타…`, ukulele ← `05 우쿨렐레…`, tongue-drum ← `02 텅드럼…`, kalimba ← `21키 칼림바…`, miniharp ← `03 미니하프…`, ocarina ← `ocarina_1027415.png`, panflute ← `pan-flute.png`, violin ← `Violin Icon.png`, flute ← `Flute Icon.png`, nanta ← `08 난타…`, drum ← `06 드럼…jpg`; saxophone/cello/metronome은 `public/icons`의 현재 파일을 원본으로 사용).
- `scripts/optimize-icons.mjs`: `DESIGN.md Step 7.2` 코드. `npm run icons:build` 실행.
- 카탈로그 `icon` 경로 `.png` → `.webp`. 카탈로그 무결성 테스트(아이콘 존재)는 webp 기준으로 통과해야 한다.
- 결과 확인: `file public/icons/*.webp | grep -c "256 x 256"` = 14, `du -sh public/icons`.

### Step 7.3 `.gitattributes` + `.gitignore` 최종
- `.gitattributes`: `*.png binary`, `*.webp binary`, `*.dc.html -diff`, `support.js -diff linguist-generated`.
- `.gitignore`에 `design/qa/**/*.png`는 **커밋 유지**(QA 증적) — 제외하지 않는다. 단 `test-results/`, `playwright-report/` 제외 확인.

### Step 7.4 README 최종
- 폴더 구조 트리를 현재 상태로 갱신, "디자인 자산" 절 추가, 아이콘 추가 절차(원본을 `design/icons-src/<id>.png`에 넣고 `npm run icons:build`).

### 체크포인트 커밋
- `chore(repo): move design exports, mockups and screenshots under design/`
- `chore(repo): remove duplicate icons dir and thumbnail`
- `chore(docs): move legacy plans to docs/history and app links to docs/`
- `feat(icons): add sharp pipeline and regenerate 256px webp icons`
- `chore(repo): add gitattributes`
- `docs: update README structure and asset workflow`
- `chore(repo): remove raw icon sources from repository` (사람 확인 후)

## 범위 밖
- 소스 코드 변경(카탈로그 icon 경로 외).
- git 히스토리 재작성.
- 아이콘 디자인 자체 수정.

## 검증
```bash
npm run verify
ls -A | sort                                # 기대: .github .gitattributes .gitignore .nvmrc .prettierrc .prettierignore .stylelintrc.json CLAUDE.md README.md design docs e2e eslint.config.mjs next-env.d.ts next.config.mjs package-lock.json package.json playwright.config.ts proxy.ts public scripts src supabase tsconfig.json vitest.config.ts vitest.setup.ts (±env.example)
du -sh public/icons                         # 기대: ≤ 200K
file public/icons/*.webp | grep -c "256 x 256"   # 기대: 14
git ls-files | grep -c "^아이콘/"            # 기대: 0 (삭제 승인 후)
git ls-files | grep -c "^icons/"            # 기대: 0
du -sh .git                                 # 참고 수치(히스토리는 그대로)
```

## 완료 기준
- [ ] 루트 파일 목록이 기대 집합과 일치(추가 파일 없음)
- [ ] `public/icons` ≤ 200KB, 14종 webp+png, 전부 256×256
- [ ] 카탈로그 테스트(아이콘 존재) 통과, 화면에서 아이콘 정상 표시(스크린샷 1장 `design/qa/phase7/`)
- [ ] `design/README.md`, `docs/history/` 존재, README 갱신

## 멈추고 물어볼 조건
- **`아이콘/` 삭제 직전(필수 정지)**: "원본을 외부에 보관했는지 확인해 주세요. 보관 링크를 알려 주시면 design/README.md에 적고 삭제를 진행합니다."
- 원본 매핑에서 어느 파일이 어느 아이콘인지 확신이 없을 때(2개 이상) → 후보를 보여 주고 선택 요청

## 종료 시
1. `PROGRESS.md` 갱신. Human TODO: 드럼 아이콘 투명 PNG 제공, Drive 링크 기입(미완이면).
2. `refactor(phase-7): 저장소·에셋 정리 완료`
3. 보고에 저장소 용량 before/after.
````

---

### P-P8a — Phase 8.1 (선택): 실제 "이어서 학습하기" — 열람 기록

````markdown
# [Phase 8.1] 열람 기록 — app_opens 테이블, /go 기록, 홈 "이어서 학습하기" 실데이터

## 역할
CLAUDE.md 규칙을 따르는 풀스택 엔지니어. 이 세션은 **Phase 8.1만** 수행한다. Phase 3·4가 완료되어 있어야 한다.

## 목표
로그인 사용자가 `/go/[appId]`로 앱을 열 때 기록을 남기고, 홈과 카테고리의 "이어서 학습하기"를 **실제 최근 열람**으로 바꾼다. 가짜 진행률은 끝까지 넣지 않는다.

## 먼저 읽을 것
`CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, `DESIGN.md` §6 Phase 8.1, `src/app/go/[appId]/route.ts`, `src/app/(app)/page.tsx`, `category/[category]/page.tsx`, `src/features/auth/service.ts`, `src/lib/supabase/database.types.ts`

## 이미 결정됨
- 테이블 `public.app_opens(user_id, app_id, opened_at, open_count)` PK `(user_id, app_id)`, RLS 본인만. RPC `record_app_open(app_id text)`가 upsert + `open_count + 1`을 원자적으로.
- 게스트는 기록하지 않는다(쿠키 기반 추적 없음).
- 표시: "마지막 열람 n일 전 · n회". 진행률 바 없음.
- 마이그레이션 적용은 사람 승인 후(필수 정지).

## 작업
1. 브랜치 `feat/app-opens`.
2. `supabase/migrations/2026xxxx0001_app_opens.sql`: `DESIGN.md 8.1` SQL + RPC:
   ```sql
   create or replace function public.record_app_open(p_app_id text)
   returns void language sql security invoker as $$
     insert into public.app_opens (user_id, app_id)
     values ((select auth.uid()), p_app_id)
     on conflict (user_id, app_id)
     do update set opened_at = now(), open_count = public.app_opens.open_count + 1;
   $$;
   grant execute on function public.record_app_open(text) to authenticated;
   ```
3. `features/history/service.ts`(`server-only`): `recordAppOpen(appId)`(실패해도 리다이렉트는 진행, 오류는 로그), `getRecentOpens(limit)`(cache).
4. `/go/[appId]/route.ts`: 허용 분기에서 `profile`이 있으면 `await recordAppOpen(app.id)` — **리다이렉트 지연을 막기 위해** 실패를 삼키고 `console.error`.
5. 홈 "이어서 학습하기": `getRecentOpens(1)` → 있으면 그 앱(+ "n일 전 · n회"), 없으면 기존 `firstOpenableApp` + "처음 시작해 보세요". 카테고리는 해당 카테고리 내 최근 1건.
6. `relativeDays(date)` 유틸 + 테스트(오늘/1일/7일/30일 이상 → "오늘", "1일 전", "7일 전", "한 달 이상 전").
7. 테스트: route가 member일 때 `recordAppOpen` 호출, guest일 때 미호출(mock). `getRecentOpens` 매핑(알 수 없는 app_id는 제외).
8. `db:types` 재생성(가능하면).
9. 멈춤: 마이그레이션 적용 요청 → 승인 후 로컬 확인(로그인 → 앱 열기 → 홈에 반영).

## 검증
`npm run verify`, 회원 로그인 후 `/go/kalimba` 2회 → 홈에 "칼림바 · 오늘 · 2회".

## 완료 기준
- [ ] 마이그레이션 적용, RLS로 타인 기록 조회 불가(SQL 확인)
- [ ] `/go` 리다이렉트 지연 체감 없음(기록 실패 시에도 302)
- [ ] 테스트 ≥ 6개 추가

## 종료 시
PROGRESS 갱신, `feat(history): record app opens and show real continue card`, 보고.
````

---

### P-P8b — Phase 8.2 (선택): 관리자 기능 — 회원 역할 관리

````markdown
# [Phase 8.2] 관리자 — 회원 목록·역할 변경

## 역할
CLAUDE.md 규칙을 따르는 풀스택 엔지니어. 이 세션은 **Phase 8.2만** 수행한다. Phase 3의 `profiles_hardening` 마이그레이션(`profiles_select_admin` 정책, `set_profile_role` RPC)이 적용되어 있어야 한다.

## 목표
`/admin/members`에서 관리자가 회원 목록을 보고 역할을 member ↔ admin으로 바꿀 수 있다. 자기 자신은 강등 불가(RPC가 막음).

## 먼저 읽을 것
`CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, `DESIGN.md` §6 Phase 8.2, `supabase/migrations/202610210001_profiles_hardening.sql`, `src/app/(app)/admin/page.tsx`, `src/features/auth/service.ts`

## 이미 결정됨
- 서버 액션 `setRoleAction(formData)` → `supabase.rpc("set_profile_role", { target_id, new_role })`. 권한 검사는 **RPC 안**(DB)과 **액션 진입부**(`canAccessAdminPage`) 둘 다.
- 목록은 서버 컴포넌트에서 `from("profiles").select("id,email,role,created_at").order("created_at", { ascending: false }).limit(200)`. 검색/페이지네이션은 범위 밖.
- 역할 변경 UI는 각 행에 `<form>` + 셀렉트 + "변경" 버튼(JS 없이 동작). 변경 결과는 `?notice=` 쿼리로 표시.
- 카탈로그 DB 이전(8.2 후반)은 **하지 않는다**(별도 결정).

## 작업
1. 브랜치 `feat/admin-members`.
2. `features/admin/service.ts`(`server-only`): `listProfiles()`, 테스트 가능하게 supabase 클라이언트 주입.
3. `app/(app)/admin/members/page.tsx` + 모듈 CSS: 테이블(모바일에서는 카드형 리스트로 전환, 600px 기준).
4. `app/(app)/admin/actions.ts`: `setRoleAction` — 입력 검증(uuid, role enum), 관리자 아니면 `redirect("/admin?notice=forbidden")`, RPC 오류 메시지 매핑(`forbidden`, `cannot demote self`, `invalid role`).
5. `/admin` 홈에 "회원 관리" 링크. 하단 탭 "관리"는 그대로.
6. 테스트: 액션(비관리자 차단, 잘못된 uuid, RPC 성공/실패 매핑) ≥ 5개.
7. e2e(`admin.spec.ts` 보강): 관리자 로그인 → `/admin/members` 200 → 목록에 e2e 회원 이메일 존재. 역할 변경은 e2e에서 **실행하지 않는다**(테스트 계정 오염 방지).

## 검증
`npm run verify`, 회원 계정으로 `/admin/members` → 403 안내, 관리자로 접근 → 목록.

## 완료 기준
- [ ] 비관리자 접근 차단(서버), RPC 레벨 차단 SQL 확인
- [ ] 자기 자신 강등 시 안내 메시지
- [ ] 테스트 ≥ 5개, e2e 보강 통과

## 종료 시
PROGRESS 갱신, `feat(admin): add member list and role management`, 보고.
````

---

### P-P8c — Phase 8.4 (선택): PWA 설치 지원

````markdown
# [Phase 8.4] PWA — manifest, 설치 가능, 아이콘

## 역할
CLAUDE.md 규칙을 따르는 프론트엔드 엔지니어. 이 세션은 **Phase 8.4만** 수행한다. Phase 4(viewport·appleWebApp 메타)와 Phase 7(아이콘 파이프라인)이 완료되어 있어야 한다.

## 목표
홈 화면에 설치할 수 있는 최소 PWA. 오프라인 캐시(서비스 워커)는 **하지 않는다** — 모든 앱이 외부 링크이므로 오프라인 가치가 없고, 캐시 버그 위험만 늘어난다.

## 먼저 읽을 것
`CLAUDE.md`, `PROGRESS.md`, `DESIGN.md` §6 Phase 8.4, `src/app/layout.tsx`, `proxy.ts`(matcher에 `manifest.webmanifest` 제외가 있는지), `scripts/optimize-icons.mjs`

## 이미 결정됨
- `src/app/manifest.ts`(Next `MetadataRoute.Manifest`): `name "Lesson Designer"`, `short_name "레슨디자이너"`, `display "standalone"`, `start_url "/"`, `background_color` = `--c-canvas`, `theme_color` = `--c-brand`, `lang "ko"`.
- 앱 아이콘은 `public/app-icon-192.png`, `public/app-icon-512.png`, `public/app-icon-maskable-512.png`(여백 20%). 원본은 브랜드 마크 1장(`design/icons-src/app-icon.png`, 사람이 제공 — 없으면 임시로 텍스트 "LD" SVG를 sharp로 래스터화하고 Human TODO).
- `apple-touch-icon`은 `src/app/apple-icon.png`(180×180)로 Next 규약 사용.
- 설치 유도 배너·`beforeinstallprompt` 처리는 범위 밖.

## 작업
1. 브랜치 `feat/pwa`.
2. `scripts/optimize-icons.mjs`에 앱 아이콘 생성 분기 추가(`--app` 플래그) → 192/512/maskable/apple 4장.
3. `src/app/manifest.ts` 작성. `layout.tsx` metadata에 `manifest: "/manifest.webmanifest"`가 자동 연결되는지 빌드 결과 `<link rel="manifest">`로 확인.
4. `proxy.ts` matcher가 `manifest.webmanifest`·`app-icon-*.png`를 제외하는지 확인/수정.
5. Lighthouse PWA 항목 또는 Chrome DevTools → Application → Manifest에서 "설치 가능" 확인(Playwright로 `/manifest.webmanifest` 200 + JSON 파싱 + 아이콘 URL 200 확인하는 테스트 1개).

## 검증
`npm run verify`, `curl -s localhost:3000/manifest.webmanifest | node -e "const m=JSON.parse(require('fs').readFileSync(0));console.log(m.display,m.icons.length)"` → `standalone 3`

## 완료 기준
- [ ] manifest 200, 아이콘 4장 존재, `<link rel="manifest">` 렌더
- [ ] iOS Safari "홈 화면에 추가" 시 아이콘·이름 정상(사람 확인)
- [ ] 서비스 워커 없음(의도)

## 종료 시
PROGRESS 갱신, `feat(pwa): add web app manifest and icons`, 보고.
````

> **Phase 8.3(하위 앱 실제 보호)에는 프롬프트가 없다.** 결정 D4에 따라 보류 상태이며, 커스텀 도메인 통일·서명 토큰·보호 수준 재정의 중 무엇을 택할지는 제품 결정이다. 결정이 내려지면 `DECISIONS.md`에 D4를 갱신한 뒤 이 프롬프트북의 Phase 프롬프트 형식(역할/목표/읽을 것/결정됨/작업/범위 밖/검증/완료 기준/멈출 조건/종료)으로 새 프롬프트를 작성한다.

---

## 3. 보조 프롬프트

### P-R — Phase 리뷰 (새 세션에서, 작업 세션과 분리)

> 작업한 에이전트가 자기 결과를 채점하지 못하게 **반드시 새 세션**에서 실행. `[N]`을 채운다.

````markdown
# [리뷰] Phase [N] 결과 감사

## 역할
너는 이 변경을 **작성하지 않은** 리뷰어다. 작성자의 보고를 믿지 말고 코드·명령 결과만 본다. 수정하지 않는다 — 발견만 한다.

## 읽을 것
1. `CLAUDE.md`, `docs/refactor/DECISIONS.md`
2. `docs/refactor/DESIGN.md` §6 **Phase [N]**의 "완료 기준"과 §7 검증 체크리스트 중 해당 항목
3. `docs/refactor/PROGRESS.md`의 Phase [N] 세션 로그(작성자가 주장한 것)
4. `git log main..HEAD --oneline`, `git diff main...HEAD --stat`, 그리고 변경된 파일 전체 diff

## 절차
1. **완료 기준 재검증**: 설계문서 Phase [N] "완료 기준"의 각 항목을 **직접 명령을 실행해서** ✓/✗ 판정한다. `npm run verify`는 반드시 직접 돌린다. 작성자의 수치는 참고만.
2. **범위 이탈 검사**: diff에 Phase [N] 범위 밖 변경이 있는가(다른 Phase의 작업, 설계에 없는 리팩토링, 무관한 포매팅)?
3. **CLAUDE.md 절대 규칙 10개 위반 검사**: 특히 2(외부 URL 직접 렌더), 3(fail-open), 4(가짜 지표), 5(마이그레이션 수정), 6(CSS 문자열 테스트), 8(에러 원문 노출), 10(테스트 약화).
4. **설계문서와 실제 코드 불일치**: Step을 다르게 구현했으면 왜인지 PROGRESS "가정"에 기록되어 있는가? 기록 없는 이탈은 발견 사항.
5. **회귀 가능성**: 삭제·개명된 export의 사용처가 남아 있는가(`grep`), 라우트 이동 후 깨진 링크가 있는가(모든 `href` 수집 → dev 서버에 curl)?
6. **보안 한 바퀴**(Phase 1·2·3·6이면 필수): `DESIGN.md §7.1` 표의 명령을 전부 실행.

## 보고 형식 (이 형식만, 수정 제안은 코드가 아니라 문장으로)
```
## 판정: 머지 가능 / 조건부(아래 Must 수정 후) / 반려

## Must (머지 전 필수)
- [파일:라인] 문제 — 근거(실행한 명령/출력) — 설계문서 어느 항목 위반

## Should (다음 Phase 전까지)
- ...

## Nit
- ...

## 완료 기준 체크 결과
| 항목 | 판정 | 근거 |

## 범위 이탈
- (없음 / 목록)
```
Must가 하나라도 있으면 "머지 가능"이라고 쓰지 않는다. 결과를 `docs/refactor/REVIEW-phase-[N].md`로 저장하고 커밋한다(`docs(review): phase [N] review`).
````

---

### P-F — 검증 실패 수정 루프

> `npm run verify`나 리뷰 Must가 떴을 때. `[ ]`에 실패 출력을 그대로 붙인다.

````markdown
# [수정] Phase [N] 검증 실패 처리

## 상황
아래는 실패 출력(또는 리뷰 Must 목록)이다. 원문 그대로:
```
[여기에 npm run verify 출력 / REVIEW-phase-N.md 의 Must 항목을 붙인다]
```

## 규칙
1. **근본 원인**을 고친다. 증상을 숨기는 수정(테스트 삭제·skip, `eslint-disable`, `as any`, `!important`, 규칙 완화, 임계값 하향)은 금지. 꼭 필요하면 왜 그것만이 답인지 먼저 설명하고 승인을 받는다.
2. 실패 하나당 수정 하나, 커밋 하나(`fix(<scope>): <무엇>`). 한꺼번에 고치지 않는다.
3. 각 수정 뒤 실패했던 **그 명령**을 다시 돌려 통과를 확인하고, 마지막에 `npm run verify` 전체를 돌린다.
4. 수정이 Phase [N] 범위를 벗어나야만 가능하면 멈추고 보고한다.
5. 같은 실패를 3번 고쳐도 통과하지 않으면 멈추고, 시도한 것·관찰한 것·가설을 정리해 보고한다. 네 번째 시도는 하지 않는다.

## 절차
1. 실패를 종류별로 분류(타입/린트/테스트/빌드/리뷰 Must)하고 각 원인을 한 줄로 가설.
2. 영향 범위가 작은 것부터 수정.
3. `PROGRESS.md` 세션 로그에 "수정 루프" 항목 추가(무엇이 왜 실패했고 어떻게 고쳤는지).

## 보고
- 실패 → 원인 → 수정 → 재검증 결과 표
- 남은 실패(있으면)와 다음 가설
````

---

### P-D — 디자인 QA (스크린샷 기반)

> Phase 4·5 뒤. 같은 세션에서 바로 실행해도 된다.

````markdown
# [디자인 QA] 스크린샷 비교와 모바일 UX 점검

## 역할
모바일 웹 UX 리뷰어. 코드를 고치지 않고 **보이는 것**을 평가한다.

## 작업
1. `npm run dev`를 띄우고 Playwright로 다음을 캡처해 `design/qa/[phase]-qa/`에 저장:
   - 390×844(iPhone), 360×800(Android), 768×1024(iPad 세로), 1280×800(PC) × 화면 `/`, `/category/instrument-education`, `/category/music-game`, `/login` = 16장
   - 각 화면에서 **스크롤 끝까지 내린 상태** 1장 추가(하단 탭 고정 확인) = 4장
2. `design/mockups/1~3.png`(원 목업)와 390×844 결과를 나란히 보고 평가한다.
3. 아래 체크리스트를 ✓/✗/해당없음으로 채운다:
   - 하단 탭이 뷰포트 하단에 고정되고 현재 위치가 강조됨
   - 가짜 상태바·베젤·진행률·XP 없음
   - 폰트가 Pretendard로 렌더됨(시스템 폰트 폴백 아님 — 글자 모양으로 판단, 필요하면 `document.fonts.check` 실행)
   - 모든 버튼·링크 높이 ≥ 44px(`document.querySelectorAll('a,button')`의 `getBoundingClientRect().height` 최소값 출력)
   - 텍스트가 잘리거나(ellipsis 외) 겹치는 곳 없음
   - 1280px에서 콘텐츠가 중앙 컬럼에 있고 좌우가 비어 보이지 않게 배경 처리됨
   - 카테고리 톤(edu 파랑 / play 주황)이 헤더·카드·강조에 일관 적용
   - 색만으로 상태를 구분하는 요소 없음(아이콘/텍스트 병기)
   - 로그인 화면이 앱 화면과 같은 폭·폰트·토큰
   - 다크 모드는 지원 범위 밖 — `prefers-color-scheme: dark`에서 깨지지 않는지만 확인
4. 목업과의 차이를 "의도된(설계문서 결정) / 의도되지 않은" 두 목록으로 나눈다.

## 보고
- 스크린샷 경로 표(뷰포트 × 화면)
- 체크리스트 결과
- 의도되지 않은 차이 → 각각 **어느 CSS 모듈/컴포넌트**를 고치면 되는지 한 줄 제안(코드 아님)
- 결과를 `design/qa/[phase]-qa/REPORT.md`로 저장, 커밋 `docs(qa): [phase] design qa report`
````

---

### P-H — 세션 중단 인계

> 토큰·시간 부족, 혹은 사람이 중단해야 할 때. 작업 중인 세션에 붙인다.

````markdown
# [인계] 지금 상태로 안전하게 중단

## 작업
1. 진행 중인 편집을 **컴파일 가능한 상태**로 마무리한다(절반 쓴 함수는 완성하거나 되돌린다). `npm run typecheck`가 통과해야 한다. 통과 못 하면 어느 파일이 왜인지 PROGRESS에 적는다.
2. 변경을 WIP 커밋한다: `wip(phase-[N]): <어디까지 했는지 한 줄>` — 현재 브랜치에만.
3. `docs/refactor/PROGRESS.md`의 "세션 로그" 맨 위에 다음을 **정확히** 적는다:
   - 완료한 Step 번호 / 진행 중이던 Step 번호와 **다음에 할 구체 행동 1~3개**(파일명 포함)
   - 지금 `npm run verify` 결과(어느 단계가 실패하는지)
   - 임시로 넣어 둔 것(디버그 로그, 임시 주석, skip된 테스트)의 위치 — 다음 세션이 제거해야 함
   - 사람 확인이 필요한 질문
4. 커밋 `docs(progress): handoff for phase [N]`.

## 보고
PROGRESS에 적은 내용을 그대로 출력한다. 다음 세션은 이 내용과 Phase [N] 프롬프트를 함께 받는다.
````

---

## 4. 부록

### 4.1 템플릿

#### `docs/refactor/PROGRESS.md` 세션 로그 항목 형식

```markdown
### 2026-MM-DD Phase N — <이름>  (브랜치 refactor/phase-N-…)
- 완료 Step: N.1, N.2, N.3
- 미완료: N.4 (사유)
- verify: typecheck ✓ lint ✓ test ✓(42) build ✓
- 가정/우회: …
- 발견 사항(범위 밖): …
- 다음 세션: …
- Human TODO: …
```

#### `docs/refactor/DECISIONS.md` 항목 형식

```markdown
| # | 결정 | 값 | 근거 | 영향 Phase/Step | 상태 |
|---|---|---|---|---|---|
| D1 | 관리자 로그인 화면 | 삭제, /login 통일 | 중복 화면·로그아웃 트랩 원인 | P2 S2.3, S2.6 | 확정 |
```

### 4.2 이 프롬프트들이 그렇게 쓰인 이유 (프롬프트 설계 원칙)

| 장치 | 막으려는 실패 |
|---|---|
| 한 세션 = 한 Phase, "범위 밖" 목록 | 에이전트가 눈에 띄는 다른 문제를 고치다 diff가 비대해지고 리뷰 불가가 되는 것 |
| "먼저 읽을 것"에 파일을 **열거** | 설계문서를 요약 기억으로 대체하고 추측으로 구현하는 것 |
| "이미 결정됨" + DECISIONS.md | 매 세션 같은 질문을 반복하거나, 묻지 않고 다른 선택을 하는 것 |
| 검증 명령 + **기대값 숫자** | "통과했습니다"라는 말만 남고 실제로는 실패인 상태 |
| 완료 기준 체크박스 | 80%에서 완료 선언 |
| 멈추고 물어볼 조건을 **좁게** 명시 | 되돌릴 수 없는 작업을 자동 진행하는 것 / 사소한 것마다 멈추는 것 둘 다 |
| 체크포인트 커밋 메시지 사전 지정 | 한 덩어리 커밋, 되돌리기 불가 |
| 리뷰는 새 세션(P-R) | 작업 세션이 자기 결과를 관대하게 채점하는 것 |
| 수정 루프 3회 상한(P-F) | 같은 실패를 무한 반복하며 테스트를 약화시키는 것 |
| PROGRESS.md 장부 | 세션 간 기억 단절 → 중복 작업·누락 |
| TDD 지시(Phase 1·3·6) | 권한·리다이렉트 같은 위험 로직을 구현 후 "대충 확인"으로 넘기는 것 |

### 4.3 자주 생기는 문제와 대응

| 증상 | 원인 | 대응 |
|---|---|---|
| 에이전트가 설계문서 코드를 그대로 복사해 버전 숫자가 lock과 다름 | 지시 무시 | P-F로 "lock 기준 재계산" 요구. Phase 0 프롬프트의 해당 문장을 인용 |
| `eslint-config-next` import 오류 | 16.x flat export 경로 변경 | 에이전트에게 `node_modules/eslint-config-next/README.md` 확인 지시(프롬프트에 이미 포함) |
| Phase 2 후 확인 메일 링크가 Supabase 기본 페이지로 감 | 이메일 템플릿 미변경 | §0.5 체크리스트. 배포 **전** 템플릿 변경 |
| `getClaims()` 후 세션이 갱신되지 않음 | 레거시 HS256 키 | D6을 HS256으로 수정, `getUser()`로 되돌리기 |
| Phase 4에서 화면이 레거시 CSS와 섞여 깨짐 | 새 컴포넌트가 레거시 클래스명을 재사용 | 프롬프트 "범위 밖" 위반 → 리뷰 Must. 새 컴포넌트는 모듈 클래스만 |
| Phase 5 후 특정 화면만 스타일 없음 | 레거시 블록을 지웠는데 모듈이 그 요소를 덮지 않음 | P-F. before/after 스크린샷으로 어느 요소인지 특정 |
| e2e가 CI에서 전부 skip | `E2E_*` secret 미등록 | GitHub Secrets 등록(Phase 6 Human TODO) |
| 에이전트가 "완료"라 했는데 `verify` 실패 | 보고 신뢰 | 항상 직접 1회 실행 → P-F |
| 마이그레이션을 묻지 않고 적용함 | Supabase MCP 자동 승인 | MCP 도구 승인을 수동으로 두고, CLAUDE.md 멈춤 조건 재확인 |
| 두 세션이 같은 Phase를 다른 브랜치에서 진행 | PROGRESS 미갱신 | P-H로 인계 후 한 브랜치로 합치기 |

### 4.4 Phase ↔ 설계문서 문제 ID 매핑 (리뷰 시 참조)

| Phase | 해결하는 문제 ID |
|---|---|
| 0 | G-5, H-1, H-2, H-4, H-5 |
| 1 | A-1, A-3, A-4, A-5, B-1, B-2, B-4 |
| 2 | B-3, B-5, B-6, B-7, B-8, B-9, B-10, F-4, I-1 |
| 3 | A-2(게이트 수준), A-6, A-7, A-8, E-1, E-2, E-3, E-4, E-5, E-6 |
| 4 | C-1, C-2, C-3, C-4, C-5, C-6, C-7, C-8, C-9, C-10, C-11, F-1, F-2, F-3, F-5, F-6, I-4 |
| 5 | D-1, D-2, D-3, D-4, D-5, D-6, D-7, D-8 |
| 6 | G-1, G-2, G-3, G-4, A-5(CSP enforce) |
| 7 | E-7, H-3, I-2, I-3 |
| 8 | A-2(근본, 8.3 보류), E-6(관리 기능), 실제 '이어서 학습하기'(8.1), PWA(8.4) |

---

*끝. 이 문서와 설계문서(`docs/refactor/DESIGN.md`)를 함께 저장소에 두고, P-00부터 순서대로 실행하세요.*
