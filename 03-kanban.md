# 03 · 칸반 보드 (dnd-kit + 실데이터 + 낙관적 업데이트)

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
Supabase의 `applications` 146건을 stage별 칸반으로 렌더하고, dnd-kit 드래그로 단계/정렬을 바꾸면 낙관적 업데이트로 저장한다.

## 결정
- 보드는 **클라이언트 컴포넌트**(`KanbanBoard`), 데이터는 TanStack Query로 조회.
- 컬럼 = stage(관심/지원/서류/코테/면접/최종/오퍼), 카드 배지 = result(진행중/탈락/합격).
- 멀티 컬럼 정렬: `@dnd-kit/sortable`의 `SortableContext`(컬럼별) + 단일 `DndContext`.
  - `onDragOver`: 컨테이너 간 이동 실시간 반영
  - `onDragEnd`: 최종 위치의 `position_order`를 **이웃 중간값**으로 계산해 이동 카드 1건만 update
- 낙관적 업데이트: `onMutate` 캐시 즉시 갱신 → `onError` 롤백 → `onSettled` 무효화.

## 파일
- `src/lib/applications.ts` — 타입(Application/Stage/Result) + STAGES/STAGE_LABEL/RESULT_META
- `src/hooks/use-applications.ts` — `useApplications`(조회) + `useMoveApplication`(낙관적 이동)
- `src/components/board/application-card.tsx` — 정렬 가능한 카드(useSortable) + DragOverlay용 정적 렌더
- `src/components/board/kanban-column.tsx` — 드롭 가능한 컬럼(useDroppable + SortableContext)
- `src/components/board/kanban-board.tsx` — DndContext 오케스트레이션 + 로컬 컬럼 상태 + 저장
- `src/app/board/page.tsx` — 플레이스홀더 제거, `<KanbanBoard/>` 렌더

## 검증
- `npm run dev`(3005) → `/board` 200, 컴파일 에러 0
- anon 조회로 146건 로드(check-db 기준), 로딩 스켈레톤/에러 상태 처리
- 접근성: PointerSensor(distance 5) + KeyboardSensor(키보드 드래그 지원)

## 남은 것 / 다음
- 데이터가 전부 `rejected`라 배지 다양성 낮음 → 데모용 일부 pending/accepted 전환 권장
- 04-card-detail: 카드 클릭 → 상세 Sheet + 활동 타임라인(application_events)
