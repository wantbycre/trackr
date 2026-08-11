# 07-a · 데모 모드 (로그인 전 비저장 시연)

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
로그인 없이도 board/dashboard가 동작하되, **저장되지 않는 큐레이션 샘플 데이터**로 시연. 이후 7-b(인증)에서 로그인 시 자동으로 live(내 데이터) 모드로 전환.

## 결정
- 데이터 소스를 **모드로 분기**: `demo`(인메모리) / `live`(Supabase).
  - `useSession`/`useDataMode`(`src/hooks/use-auth.ts`): Supabase 세션 구독 → 세션 없으면 `demo`.
  - 훅(`use-applications.ts`)이 mode로 분기, `queryKey`에 mode를 포함해 로그인 시 자동 리페치.
- 데모 데이터는 다양한 단계/결과(진행중·탈락·합격)로 구성 → 퍼널·초록 배지·KPI가 살아남(실데이터가 전부 탈락이던 문제 해소).
- 데모 스토어는 새로고침 시 초기화(비저장). `update`에서 stage 변경 시 타임라인 이벤트를 추가해 트리거 동작을 흉내.
- 헤더에 "데모 · 저장 안 됨" 배지(`DemoBadge`).

## 파일
- `src/lib/demo-data.ts` — 큐레이션 샘플(10건 + 이벤트 4건)
- `src/lib/demo-store.ts` — 인메모리 스토어(list/move/update)
- `src/hooks/use-auth.ts` — 세션/데이터 모드
- `src/hooks/use-applications.ts` — demo/live 분기
- `src/components/demo-badge.tsx` + `layout.tsx` — 데모 배지

## 검증
- `/board`·`/dashboard` 200, ESLint 0, 컴파일 0
- 로그아웃 상태에서 데모 데이터 렌더/드래그/편집 동작(비저장)

## 다음 (7-b)
- 이메일/비번 회원가입·로그인(`/login`), `@supabase/ssr` 세션, 미들웨어
- `user_id` 컬럼 + RLS 정책(내 데이터만) — SQL 마이그레이션은 사용자 실행
