# design/

앱 빌드와 무관한 디자인 산출물. 소스 코드는 이 폴더를 참조하지 않는다(`public/icons/` 는 `icons-src/` 에서 생성).

| 폴더 | 내용 |
|---|---|
| `exports/` | Claude Design 내보내기(`*.dc.html`, `support.js`). 브라우저에서 열어 보는 프로토타입 — 수정하지 않음 |
| `mockups/` | 모바일 목업 PNG(1~3) |
| `screenshots/` | 초기 데스크톱 디자인 스크린샷 |
| `icons-src/` | 카탈로그 아이콘 원본 14종(`<id>.png|jpg`). `npm run icons:build` 의 입력 |
| `qa/` | 리팩토링 Phase 별 스크린샷 증적(phase4, phase5-before/after) |

## 아이콘 원본(크몽 구매분) 보관처

저장소 용량을 줄이기 위해 `아이콘/` 폴더(5.7MB, `.ai` 원본·미사용 악기 아이콘 포함)는 2026-10 리팩토링(Phase 7, DECISIONS D5)에서 제거했다.

- 외부 보관 링크: **[Drive 링크 — 사람이 채움]**
- 복구: `git checkout phase-6 -- 아이콘` (히스토리는 재작성하지 않았으므로 그대로 남아 있다)

## 알려진 이슈
- `icons-src/drum.jpg` 는 JPEG(불투명 배경)라 생성된 아이콘도 흰 배경이다. 배경이 제거된 PNG 원본으로 교체 필요.
- `icons-src/cello.png` 는 `violin.png` 와 동일 파일이다(원본 저장소에 첼로 아이콘이 없었음). 별도 첼로 아이콘 필요.
