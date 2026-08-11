# 08 · 지원 추가/삭제 (CRUD 완성)

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
로그인 유저가 카드를 직접 만들고 지울 수 있게 해 실사용 루프를 닫는다(기존엔 "+ 지원 추가"가 무동작).

## 변경 내용
- `use-applications.ts`: `useCreateApplication`, `useDeleteApplication` — demo(인메모리)/live(Supabase) 분기
  - live insert는 `user_id`를 컬럼 기본값(`auth.uid()`)으로 자동 세팅
- `demo-store.ts`: `create`/`remove` 추가(비저장)
- `add-application-dialog.tsx`: 보드 헤더 "+ 지원 추가" → shadcn Dialog 폼(플랫폼/회사/직무/단계/결과/지원일/메모)
- `card-detail-sheet.tsx`: 푸터에 삭제 버튼(confirm) 추가
- `board/page.tsx`: 헤더에 추가 다이얼로그 배치
- README 로드맵 7 ✅ + CRUD 완성 표기

## 검증
- `/board` 200, ESLint 0, 컴파일 0
- demo: 추가/삭제가 즉시 반영(비저장, 새로고침 시 리셋)
- live: 로그인 후 내 계정으로 insert/delete (RLS 하에 내 행만)

## 다음(선택)
- 배포(Vercel), 테스트, 카드에 지원일 표시 등 소소한 UX
