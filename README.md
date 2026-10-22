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
src/app/                 App Router 라우트 — (app)/ 셸 있는 화면(홈·카테고리·관리), (auth)/ 로그인·가입, go/ 접근 게이트
src/components/          UI 컴포넌트 — shell/(AppShell·AppHeader·BottomNav) catalog/(AppCard·AppGrid·CategoryCard) auth/(AuthForm·StatusBanner) ui/(Stat·Pill·AccessDenied·Button/Page 모듈)
src/features/            도메인 로직 (auth, catalog)
src/lib/                 env, supabase 클라이언트, 공용 유틸
src/styles/              tokens.css(디자인 토큰 1벌) + base.css(리셋·.sr-only·포커스 링) — 그 외 CSS 는 전부 CSS Modules, 색·그림자·라운드는 토큰만 사용
supabase/migrations/     DB 마이그레이션 (커밋된 파일은 수정하지 않음)
docs/refactor/           리팩토링 설계·진행 문서
design/                  디자인 산출물 (앱 빌드와 무관)
```

CSS 는 CSS Modules + `src/styles/tokens.css` 토큰만 사용하며 Prettier 로 포맷하고 Stylelint(`npm run lint:css`: 토큰 외 hex 금지, 특이성 상한 (0,2,0), `!important` 금지)로 검사합니다.

## 의존성 메모

- `.npmrc`의 `legacy-peer-deps=true`: npm 10.9의 arborist 버그(vitest 4.1.11+의 optional peer 집합에서 `edgesOut` null 참조)로 표준 peer 해석이 실패해 설정했습니다. 이 때문에 `@testing-library/dom`을 명시적 devDependency로 둡니다.
- `overrides.next.postcss`: Next가 요구하는 postcss 8.4.x에 경로 탐색 취약점(GHSA-fxqj-rqcc-2cmp)이 있어 8.5.31 이상으로 고정합니다.
- `npm audit`에 남는 `braces`/`micromatch` 계열 경고는 stylelint 개발 도구 체인(ReDoS)으로 런타임과 무관합니다.
