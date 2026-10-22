# 리팩토링 결정 사항 (DECISIONS)

작성일: 2026-10-22 · 기준: `docs/refactor/DESIGN.md` §9.4, `docs/refactor/PROMPTBOOK.md` P-01

> 사용자 지시: "설계 내용 그대로, 묻지 말고 스스로 승인하며 진행". 따라서 모든 항목은 **설계문서 권장안(기본값)** 으로 확정했다. `(기본값 적용 — 확인 필요)` 표시 항목은 사람이 값을 바꾸면 해당 Phase에서 반영한다.

## 결정 표

| # | 결정 | 값 | 근거 | 영향 Phase/Step | 상태 |
|---|---|---|---|---|---|
| D1 | 관리자 로그인 화면 | **삭제**. `/login` 하나로 통일. `/admin-login` 요청은 `next.config.mjs` redirects로 `/login`에 301. | 중복 화면·로그아웃 트랩(B-1, B-9)의 원인 | P1 S1.2 / P2 S2.3, S2.6 | 확정 |
| D2 | 데스크톱 폰 베젤 | **제거**. 600px 이상에서는 카드형 중앙 컬럼(max 480px). `?frame=1` 옵션은 구현하지 않음. | C-4, 원 스펙 "responsive mobile and desktop" | P4 S4.2 / P5 S5.3 | 확정 |
| D3 | 중복 앱(텅드럼·칼림바) | **통합**. `categories: [...]` 복수 카테고리. 전체 앱 수 16 → 14(의도된 정정, README·릴리스 노트 명시). | E-3 통계 부풀림 | P3 S3.1 | 확정 |
| D4 | 하위 앱 실제 보호(설계 8.3) | **보류**. `/go/[appId]` 서버 게이트만 구현. 잠금 문구는 "회원용". | 제품 결정 필요(도메인 통일·서명 토큰 등) | P3 S3.2 / P8.3 | 보류 |
| D5 | 원본 아이콘 `아이콘/` 보관처 | **저장소 밖**(Google Drive 등). git 히스토리 재작성은 하지 않음. | 5.7MB, .ai 원본 포함 | P7 S7.1 | 확정 (Drive 링크는 사람이 기입) |
| D6 | Supabase JWT 서명 키 타입 | **미확인 → `getUser()` 유지**(안전). 비대칭(ECC/RSA) 확인 시 `getClaims()`로 전환. | 대시보드 접근 불가 | P2 S2.1 | (기본값 적용 — 확인 필요) |
| D7 | 배포 도메인 (`NEXT_PUBLIC_SITE_URL`) | 코드에서는 env만 참조. 문서 예시값 `https://lesson-designer.vercel.app`. **실제 값은 Vercel env에서 설정.** | 이메일 확인 링크(`emailRedirectTo`)에 사용 | P2 S2.3, S2.4 / P4 S4.1 | (기본값 적용 — 확인 필요) |
| D8 | e2e 테스트 계정 | 환경변수 `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`. 없으면 member/admin 스펙은 `test.skip`. | 프로덕션 계정 오염 방지 | P6 S6.4 | (기본값 적용 — 사람이 계정 생성) |

## 운영 결정 (이번 실행 세션에서 추가)

| # | 결정 | 값 |
|---|---|---|
| O1 | 브랜치 전략 | Phase별 브랜치를 **스택**으로 생성(`refactor/phase-N-*`, 각 브랜치는 직전 Phase 브랜치에서 분기). PR도 스택(base = 직전 Phase 브랜치). `main` 머지는 사람이 수행. |
| O2 | Supabase 프로젝트 | `lesson-designer` (ref `cgoafcjvnbzozxbbyfle`, ap-northeast-2). **2026-10-22 조사 결과 이 DB는 ScoreForge 등 다른 앱과 공유**됨(`scores`, `jobs`, `grant_notices` 테이블, `scoreforge_*` 마이그레이션). `profiles`는 저장소의 첫 마이그레이션과 달리 `display_name`·`updated_at` 컬럼, `private.is_admin()`, 관리자 SELECT 정책을 이미 가짐. 따라서 설계 Step 3.4의 컬럼 권한 축소·정책 교체는 **보류**, 추가 전용 변경(이메일 동기화 트리거, `set_profile_role` RPC)만 `202610220001_profiles_hardening.sql`에 담음. 적용은 사람이 수행(자동 적용은 플랫폼 정책으로 차단됨). |
| O3 | npm 설치 | `--ignore-scripts`로 설치(샌드박스 정책). `sharp` 바이너리 등 postinstall이 필요한 패키지는 사용 시점에 확인. |

## 미결 사항
- O2: `profiles` 컬럼 권한 축소(`revoke update` → `grant update (email, display_name, updated_at)`)를 ScoreForge 영향 검토 후 적용할지 결정. 현재는 `profiles_update_own_email_only` 정책의 WITH CHECK가 role 자기 변경을 이미 막고 있어 보안상 공백은 없음.
- O2: 저장소의 `supabase/migrations/`가 공유 DB의 진실 원천이 아님(`supabase_migrations`에 scoreforge_* 만 기록). 두 저장소의 마이그레이션 관리 방식을 통일할지 결정 필요.
- D6: JWT 키 타입 확인 후 `src/lib/supabase/proxy.ts`에서 `getUser()` → `getClaims()` 전환 여부 결정.
- D7: Vercel 프로젝트 env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정.
- D8: e2e 계정 생성 및 GitHub Secrets 등록.

## 변경 이력
- 2026-10-22: 최초 작성(전 항목 기본값).
