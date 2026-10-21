# Lesson Designer — 작업 규칙 (Claude Code용)

## 프로젝트
- Next.js 16 App Router + React 19 + TypeScript + Supabase(Auth/Postgres, @supabase/ssr) + 순수 CSS(CSS Modules). Vercel 배포. 모바일 퍼스트 웹앱.
- 설계문서: `docs/refactor/DESIGN.md` — 문제 ID(A-1…I-4), Phase 0~8, Step 번호. 모든 작업은 이 문서의 Step을 참조한다.
- 프롬프트북: `docs/refactor/PROMPTBOOK.md` — Phase별 실행 프롬프트.
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
