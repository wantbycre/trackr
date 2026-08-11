# 04 · 카드 상세 Sheet + 활동 타임라인

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
칸반 카드 클릭 → 우측 Sheet로 상세 정보 편집 + `application_events` 기반 활동 타임라인 표시.

## 결정
- 카드 클릭으로 Sheet 오픈(dnd-kit activationConstraint distance:5 라 드래그와 클릭이 충돌하지 않음).
- 편집 폼은 **inner 컴포넌트를 `key={application.id}`로 리마운트**해 초기화 → `useEffect`+`setState` 안티패턴 제거(React 19 `react-hooks/set-state-in-effect` 규칙 준수).
- 저장은 `useUpdateApplication`(부분 패치 update). **stage 변경 시 DB 트리거가 `application_events`에 자동 기록** → 타임라인 자동 갱신.
- 편집 필드: 플랫폼/회사/직무/단계/결과/지원일/JD링크/메모. 단계≠면접이면 round=null 정리.
- 결과/단계는 경량 native `<select>`(shadcn Select 대비 코드 절감), 나머지는 shadcn Input/Textarea.

## 파일
- `src/lib/applications.ts` — `ApplicationEvent` 타입 추가
- `src/hooks/use-applications.ts` — `useApplicationEvents`, `useUpdateApplication` 추가
- `src/components/board/card-detail-sheet.tsx` — Sheet + 편집 폼 + 타임라인
- `application-card.tsx` / `kanban-column.tsx` / `kanban-board.tsx` — `onOpen` 전달 + 선택 상태 + Sheet 렌더

## 검증
- `/board` 200, ESLint 0 error, 컴파일 에러 0
- 저장 시 toast, 성공 후 목록/이벤트 invalidate

## 다음
- 05-dashboard: 전환율 퍼널 · 단계별 체류시간 · 주간 추이(recharts)
