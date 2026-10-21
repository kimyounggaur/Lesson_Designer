# 리팩토링 진행 장부

> 매 세션 시작 시 읽고, 종료 시 갱신. 최신 항목이 위로.

## 현재 상태
- 완료 Phase: (없음)
- 진행 중 Phase: 0
- 현재 브랜치: refactor/phase-0-tooling
- 마지막 verify 결과: (미실행 — 기준선: vitest 21/21 통과, next build 통과, tsc는 TS6 `baseUrl` deprecation 오류)

## 사람 작업 대기 (Human TODO)
- [ ] D6: Supabase JWT 서명 키 타입 확인(Project Settings → JWT Keys) → 비대칭이면 DECISIONS D6 갱신
- [ ] D7: Vercel env `NEXT_PUBLIC_SITE_URL`에 실제 배포 도메인 설정
- [ ] D8: e2e 계정 2개(member/admin) 생성, GitHub Secrets `E2E_*` 등록

## 발견 사항 (범위 밖이라 보류한 문제)
- `package-lock.json`이 `package.json`("latest")과 동기화되어 있지 않아 `npm ci`가 실패함 → Phase 0에서 버전 고정으로 해결.
- TypeScript 6.0에서 `baseUrl` 옵션이 deprecation 오류(TS5101) → Phase 0에서 `paths`만 남기고 제거.

## 세션 로그

### 2026-10-22 P-00 / P-01 설치
- 완료: CLAUDE.md, PROGRESS.md, DECISIONS.md 생성. 설계문서·프롬프트북을 `docs/refactor/`에 배치.
- 환경: Node 22.22, npm 10.9, Next 16.2.9, React 19.2.7, TS 6.0.3. push 권한 있는 클론 `/home/claude/lesson_designer`.
- Supabase MCP: 프로젝트 `lesson-designer`(cgoafcjvnbzozxbbyfle) 확인. DB 쿼리는 연결 타임아웃 → Phase 3에서 재시도.
- 다음: Phase 0.
