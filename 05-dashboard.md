# 05 · 대시보드 (전환율 퍼널 · 단계 분포)

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
지원 현황을 한눈에: KPI 카드 + 전환율 퍼널 + 현재 단계 분포.

## 결정
- 통계는 **클라이언트에서 계산**(`computeStats`) — 146건 정도는 in-memory로 충분, 별도 SQL 뷰 불필요.
- 차트: recharts(BarChart) — 퍼널은 가로 막대, 분포는 세로 막대. 색은 테마 토큰(`var(--primary)`).
- 퍼널 정의: stage=도달한 가장 먼 단계이므로, "그 단계 **이상**까지 간 지원 수"의 누적. 지원(applied)부터 오퍼까지.

## 파일
- `src/lib/stats.ts` — `computeStats`(KPI/퍼널/분포) 순수 함수
- `src/components/dashboard/dashboard-view.tsx` — KPI 카드 + 퍼널/분포 차트(recharts)
- `src/app/dashboard/page.tsx` — `<DashboardView/>` 렌더

## 데이터 한계 (정직하게)
- 현재 시드는 "결과 중심"이라 **단계 전환 타임스탬프(application_events)가 없음** → 단계별 평균 체류시간 미구현.
- `applied_at` 대부분 비어 있어 **주간 추이**도 보류.
- 앱을 실제로 쓰며 단계를 옮기면 트리거가 이벤트를 쌓아 두 지표를 활성화할 수 있음(추후).

## 검증
- `/dashboard` 200, ESLint 0, 컴파일 에러 0
- KPI: 총 146 / 진행중·합격 0 / 탈락률 100%(현재 데이터 기준)

## 다음
- 06-polish: 빈상태/스켈레톤 다듬기, 반응형, 다크모드, 데모 데이터 다양화
