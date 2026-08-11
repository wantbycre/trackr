# Trackr — 프론트엔드(React/Next) 스펙 & 포트폴리오 설명

> 이 문서는 프론트엔드 구현 스펙과 **면접·포트폴리오에서 무엇을 어필할지**를 함께 담는다.
> 큰 제품 맥락은 `00-overview.md`, 작업 단위 상세는 순차 로그(`NN-*.md`)를 참조.

_최종 수정: 2026-08-11_

---

## 1. 이 프로젝트가 포트폴리오로 보여주는 것

| 어필 포인트 | 어디서 드러나나 |
|-------------|-----------------|
| **서버 상태 관리 설계** | TanStack Query v5로 캐시 키 설계 · 낙관적 업데이트 · 롤백 |
| **인터랙션 엔지니어링** | dnd-kit 기반 칸반 드래그 + 순서(position) 재계산 |
| **데이터 시각화** | 지원→오퍼 전환율 퍼널, 단계별 체류시간, 주간 추이 차트 |
| **타입 안전성** | Supabase 스키마 → 생성된 TS 타입을 앱 전역에서 사용 |
| **App Router 아키텍처** | Server Component 초기 fetch + Client Component 인터랙션 분리 |
| **점진적 설계** | 인증 없이 MVP → Phase 2에서 auth/RLS를 얹는 마이그레이션 전략 |

한 줄 요약: **"실데이터 130건으로 돌아가는, 드래그·통계가 살아있는 구직 파이프라인 트래커."**

---

## 2. 기술 스택 (프론트 관점)

| 영역 | 선택 | 메모 |
|------|------|------|
| 프레임워크 | Next.js (App Router) + TypeScript | RSC + Client 경계 명확히 |
| 스타일 | Tailwind + shadcn/ui | 디자인 토큰/다크모드 기본 |
| 서버 상태 | TanStack Query v5 | `queryKey` 팩토리 + 낙관적 업데이트 |
| 데이터 소스 | `@supabase/supabase-js` | MVP는 anon key 직결, RLS off |
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` | 칸반 정렬 |
| 차트 | recharts | 퍼널/추이 |
| 폼 | react-hook-form + zod | 카드 상세 편집 검증 |

> **인증 없음(MVP)**: 클라이언트에서 anon key로 Supabase에 직접 질의. `user_id` 컬럼 없이 단일 사용자 가정. Phase 2에서 `@supabase/ssr` + auth + RLS로 전환.

---

## 3. 폴더 구조 (제안)

```
trackr/
├─ app/
│  ├─ layout.tsx            # 루트 레이아웃 (Providers 주입)
│  ├─ page.tsx              # / → /board 리다이렉트
│  ├─ board/page.tsx        # 칸반 (메인)
│  └─ dashboard/page.tsx    # 통계
├─ components/
│  ├─ ui/                   # shadcn 생성 컴포넌트
│  ├─ board/                # KanbanBoard, Column, Card, CardDetailSheet
│  └─ dashboard/            # FunnelChart, StageDurationChart, WeeklyTrend
├─ lib/
│  ├─ supabase/client.ts    # 브라우저 클라이언트
│  ├─ query/keys.ts         # queryKey 팩토리
│  └─ types/database.ts     # supabase gen types 산출물
├─ hooks/
│  ├─ useApplications.ts    # 목록/이동/수정 쿼리·뮤테이션
│  └─ useDashboardStats.ts  # 통계 쿼리
└─ *.md                     # 문서 (overview, react, 순차 로그)
```

---

## 4. 화면별 컴포넌트 스펙

### 4.1 칸반 보드 (`/board`)
- **컬럼**: `wishlist → applied → screening → coding_test → interview → offer / rejected / accepted`
- **카드**: 회사명 · 직무 · 우선순위 뱃지 · 마감 D-day · 지원일
- **드래그**: `@dnd-kit`으로 카드 이동 → `stage` + `position_order` 갱신
- **낙관적 업데이트**: `onMutate`에서 캐시 즉시 반영 → 실패 시 `onError` 롤백 → `onSettled` 무효화
- **컴포넌트**: `KanbanBoard` > `KanbanColumn` > `ApplicationCard` / `AddCardButton`

```ts
// 낙관적 이동 뮤테이션 골격
const move = useMutation({
  mutationFn: ({ id, stage, order }: MovePayload) =>
    supabase.from('applications').update({ stage, position_order: order }).eq('id', id),
  onMutate: async (vars) => {
    await qc.cancelQueries({ queryKey: keys.applications() });
    const prev = qc.getQueryData(keys.applications());
    qc.setQueryData(keys.applications(), (old) => applyMove(old, vars)); // 즉시 반영
    return { prev };
  },
  onError: (_e, _v, ctx) => qc.setQueryData(keys.applications(), ctx?.prev), // 롤백
  onSettled: () => qc.invalidateQueries({ queryKey: keys.applications() }),
});
```

### 4.2 카드 상세 (Sheet/Drawer)
- 카드 클릭 → 우측 Sheet 오픈. 필드: 회사·직무·JD링크·연봉레인지·마감일·우선순위·메모.
- **활동 타임라인**: `application_events`를 시간순 렌더 (단계 변경/메모).
- 편집: react-hook-form + zod, 저장 시 낙관적 반영.
- 컴포넌트: `CardDetailSheet` > `CardForm` + `ActivityTimeline`.

### 4.3 대시보드 (`/dashboard`)
- **전환율 퍼널**: 단계별 도달 수 → applied 대비 %.
- **단계별 평균 체류시간**: `application_events`의 `stage_change` 간 diff 집계.
- **주간 지원 추이**: `applied_at` 기준 주간 카운트.
- KPI 카드: 총 지원 · 진행중 · 오퍼 · 탈락률.
- 컴포넌트: `StatCard`, `FunnelChart`, `StageDurationChart`, `WeeklyTrendChart`.

---

## 5. TanStack Query 규약

```ts
// lib/query/keys.ts
export const keys = {
  applications: () => ['applications'] as const,
  application: (id: string) => ['applications', id] as const,
  events: (appId: string) => ['applications', appId, 'events'] as const,
  stats: () => ['stats'] as const,
};
```

- 목록은 단일 키(`['applications']`)로 캐시, 칸반은 클라이언트에서 stage별 그룹핑.
- 뮤테이션은 낙관적 업데이트 우선, `onSettled`에서 관련 키 무효화.
- 대시보드 통계는 별도 키(`['stats']`)로 분리해 보드 갱신과 독립.

---

## 6. 타입 전략

- Supabase CLI로 스키마 → TS 타입 생성:
  ```
  supabase gen types typescript --project-id <ref> > lib/types/database.ts
  ```
- 앱 전역에서 `Database['public']['Tables']['applications']['Row']` 등을 재사용해
  DB ↔ 프론트 타입 불일치를 컴파일 타임에 차단.

---

## 7. 접근성 / UX 디테일 (면접에서 언급용)

- 드래그는 키보드로도 가능(dnd-kit 기본 지원) → 접근성 어필.
- 빈 상태 / 스켈레톤 / 에러 바운더리 3종 세트.
- 다크모드(shadcn `next-themes`), 반응형(모바일은 컬럼 가로 스크롤).
- 낙관적 업데이트 실패 시 토스트로 롤백 고지.

---

## 8. 열린 결정 (추후 확정)

- 차트 라이브러리: recharts vs shadcn charts(내부 recharts) — 후자로 통일 검토.
- 카드 순서 저장: `position_order` float 재계산 방식(중간값 삽입) 유지.
- 엑셀 130건 → CSV 컬럼 매핑 확정 필요(다음 순차 로그에서).
