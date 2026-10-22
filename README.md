# Lesson Designer

악기 교육앱과 음악 게임앱을 한곳에서 고르고 여는 모바일 퍼스트 수업 허브입니다. 게스트는 공개 앱만, 회원은 모든 앱을 열 수 있고, 관리자는 관리 화면에 들어갈 수 있습니다.

- 스택: Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Auth, Postgres, `@supabase/ssr`) · 순수 CSS
- 배포: Vercel
- 리팩토링 진행 중 — 설계·진행 상황은 [`docs/refactor/`](docs/refactor/) 참조 (`DESIGN.md`, `PROMPTBOOK.md`, `DECISIONS.md`, `PROGRESS.md`)

## 로컬 실행

```bash
nvm use            # .nvmrc = Node 22
npm ci
cp .env.example .env.local   # 값 채우기 (아래 참조)
npm run dev        # http://localhost:3000
```

`.env.local`:

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon(publishable) 키. service_role 키는 절대 넣지 않습니다 |
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인. 이메일 확인 링크 생성에 사용되므로 실제 도메인과 일치해야 합니다 |

env가 없으면 앱은 게스트 모드로 동작합니다(빌드·테스트에는 필요 없음).

## Supabase 설정

1. `supabase/migrations/`의 SQL을 순서대로 적용합니다 (`supabase db push` 또는 SQL Editor).
2. Authentication → URL Configuration: Site URL = 배포 도메인, Redirect URLs에 `http://localhost:3000/**`, `https://<배포도메인>/**`.
3. Authentication → Email Templates → Confirm signup 링크를
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` 로 변경합니다.
4. 관리자 승격: SQL Editor에서 `update public.profiles set role = 'admin' where email = '<이메일>';`

## 앱 카탈로그

- 카탈로그는 코드에 있습니다: `src/features/catalog/apps.ts`. 항목마다 `id`, `name`, `description`, `icon`, `url`, `categories`, `access("public" | "member")`.
- 앱 추가: 항목을 추가하고 아이콘을 `public/icons/<id>.png`(Phase 7 이후 `.webp`)에 넣습니다. `npm test`의 카탈로그 무결성 테스트가 id 중복·URL 중복·아이콘 누락을 잡습니다.
- 외부 앱 URL은 화면에 직접 쓰지 않고 항상 `/go/<id>`(서버 접근 게이트)를 거칩니다. 게스트가 회원용 앱을 열면 `/login?next=/go/<id>`로 보냅니다.
- 2026-10 리팩토링에서 텅드럼·칼림바가 교육/게임 양쪽에 중복 등록되어 있던 것을 하나로 합쳤습니다(`categories` 복수). 전체 앱 수가 16 → **14**로 바뀐 것은 의도된 정정입니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` / `build` / `start` | Next.js 개발·빌드·실행 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config, 경고 0 기준) + `lint:css` |
| `npm run lint:css` | Stylelint — 토큰 외 hex 금지, 특이성 상한 (0,2,0), `!important` 금지 |
| `npm run format` / `format:check` | Prettier (TS/TSX/CSS/JSON) |
| `npm test` / `test:watch` | Vitest 단위 테스트 |
| `npm run test:e2e` | Playwright e2e |
| `npm run verify` | typecheck → lint → test → build (CI와 동일) |
| `npm run icons:build` | `design/icons-src/` → `public/icons/` 아이콘 생성 |
| `npm run db:types` | Supabase 타입 생성 (`SUPABASE_PROJECT_ID` 필요) |

## 폴더 구조

```
proxy.ts                 Supabase 세션 갱신 (Next 16 proxy)
src/app/                 App Router 라우트 — (app)/ 셸 있는 화면(홈·카테고리·관리), (auth)/ 로그인·가입, go/ 접근 게이트, auth/ 서버 액션·이메일 확인
src/components/          UI 컴포넌트 — shell/(AppShell·AppHeader·BottomNav) catalog/(AppCard·AppGrid·CategoryCard) auth/(AuthForm·StatusBanner) ui/(Stat·Pill·AccessDenied·Button/Page 모듈)
src/features/            도메인 로직 (auth, catalog)
src/lib/                 env, supabase 클라이언트·DB 타입, 공용 유틸
src/styles/              tokens.css(디자인 토큰 1벌) + base.css(리셋·.sr-only·포커스 링) — 그 외 CSS 는 전부 CSS Modules
src/content/ko.ts        사용자에게 보이는 문구(한국어) 단일 출처
e2e/                     Playwright e2e(게스트·회원·관리자·시각 스냅샷·axe·CSP)
scripts/                 optimize-icons.mjs(아이콘 생성), check-coverage.mjs(커버리지 게이트)
supabase/migrations/     DB 마이그레이션 (커밋된 파일은 수정하지 않음, 새 파일만 추가)
docs/refactor/           리팩토링 설계·프롬프트북·결정·진행 문서
docs/history/            초기 계획서(superpowers) — 현 코드와 불일치, 참고용
docs/app-links.md        하위 앱 배포 링크 목록
design/                  디자인 산출물 (앱 빌드와 무관) — exports/(Claude Design 내보내기) mockups/ screenshots/ icons-src/(아이콘 원본) qa/(Phase 별 스크린샷)
public/icons/            카탈로그 아이콘 14종 (256×256 webp, 생성물 — 직접 편집하지 않음)
```

CSS 는 CSS Modules + `src/styles/tokens.css` 토큰만 사용하며 Prettier 로 포맷하고 Stylelint(`npm run lint:css`: 토큰 외 hex 금지, 특이성 상한 (0,2,0), `!important` 금지)로 검사합니다.

## 디자인 자산과 아이콘

- 아이콘 원본은 `design/icons-src/<카탈로그 id>.png|jpg` 에 둡니다. `npm run icons:build` 가 `public/icons/<id>.webp`(256×256, 투명 배경, contain)를 생성합니다. 모든 사용처가 `next/image` 를 거치므로 png 폴백은 만들지 않습니다(필요하면 `--png`).
- 앱을 추가할 때: `src/features/catalog/apps.ts` 항목 + `design/icons-src/<id>.png` → `npm run icons:build` → 카탈로그 무결성 테스트가 아이콘 존재를 확인합니다.
- 크몽 구매 원본(`.ai`, 미사용 악기 아이콘 등 5.7MB)은 저장소에서 제거했습니다(DECISIONS D5). 외부 보관 링크는 `design/README.md` 에 적습니다. 제거 전 마지막 커밋(태그 `phase-6`)에서 `git checkout phase-6 -- 아이콘` 으로 복구할 수 있습니다.

## 테스트

- 단위: `npm test` (Vitest + Testing Library). CI 는 `src/features`·`src/app/auth`·`src/app/go` 라인 커버리지 85% 미만이면 실패합니다(`scripts/check-coverage.mjs`).
- e2e: `npm run test:e2e` (Playwright, 390×844 Chromium). 프로덕션 빌드를 3100 포트에 띄워 실행합니다. 회원·관리자 시나리오는 `E2E_MEMBER_EMAIL/E2E_MEMBER_PASSWORD/E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD` 가 없으면 건너뜁니다. 시각 스냅샷 기준선은 `e2e/visual.spec.ts-snapshots/`, 갱신은 `npx playwright test e2e/visual.spec.ts --update-snapshots`.
- 접근성: `e2e/a11y.spec.ts` 가 axe 로 serious/critical 위반 0 을 강제합니다.

## 의존성 메모

- `.npmrc`의 `legacy-peer-deps=true`: npm 10.9의 arborist 버그(vitest 4.1.11+의 optional peer 집합에서 `edgesOut` null 참조)로 표준 peer 해석이 실패해 설정했습니다. 이 때문에 `@testing-library/dom`을 명시적 devDependency로 둡니다.
- `overrides.next.postcss`: Next가 요구하는 postcss 8.4.x에 경로 탐색 취약점(GHSA-fxqj-rqcc-2cmp)이 있어 8.5.31 이상으로 고정합니다.
- `npm audit`에 남는 `braces`/`micromatch` 계열 경고는 stylelint 개발 도구 체인(ReDoS)으로 런타임과 무관합니다.
