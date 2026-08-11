# 02 · DB 스키마 + 엑셀 130건 CSV 임포트

_작성: 2026-08-11 · 상태: 진행 중_

## 목표
실제 지원 이력(회사이름 + "몇 차 탈락")을 담을 스키마를 확정하고, 사람이 채우기 쉬운 CSV 템플릿 → Supabase 임포트까지 연결한다.

## 핵심 설계 결정 (실데이터 반영)
원본 데이터는 대부분 **"어느 단계에서 탈락"**. "탈락"을 칸반 컬럼으로 두면 130장이 한 컬럼에 몰려 보드가 무의미해진다. 그래서:

- **stage (도달 단계)** = 그 회사에서 도달한 **가장 먼 단계**
- **result (결과)** = `pending`(진행중) / `rejected`(탈락) / `accepted`(합격)
- **round (면접 차수)** = 면접일 때만 1·2·3 …

칸반 컬럼 = stage, 카드 색/배지 = result. → 자연스러운 퍼널 모양 + 대시보드 전환율/탈락률이 실제 의미를 가짐.

> 이 결정으로 `00-overview.md`·`react.md`의 "탈락=컬럼" 서술은 "stage=컬럼, result=배지"로 갱신 필요(이 브랜치에서 함께 반영).

## CSV 템플릿 (사람이 채우는 형식)
파일: `seed/applications.template.csv` — Excel에서 열어 130행 채운 뒤 `seed/applications.csv`로 저장.

| 컬럼 | 필수 | 허용값 / 형식 | 설명 |
|------|:---:|----------------|------|
| 회사이름 | ✅ | 자유 텍스트 | 이미 보유 |
| 직무 |  | 자유 텍스트 | 예: 프론트엔드 (비우면 기본값) |
| 도달단계 | ✅ | `관심` `지원` `서류` `코테` `면접` `최종` `오퍼` | 가장 멀리 간 단계 |
| 면접차수 |  | `1` `2` `3` … | 도달단계=`면접`일 때만, 아니면 비움 |
| 결과 | ✅ | `진행중` `탈락` `합격` | "몇 차 탈락"의 탈락 여부 |
| 지원일 |  | `YYYY-MM-DD` | 모르면 비움 |
| 직무링크 |  | URL | JD 링크 |
| 메모 |  | 자유 텍스트 | 원본 "2차 탈락" 등 원문 보존용 |

**"몇 차 탈락" → 채우는 법 예시**
| 원본 메모 | 도달단계 | 면접차수 | 결과 |
|-----------|----------|:-------:|------|
| 서류 탈락 | 서류 | | 탈락 |
| 코테 탈락 | 코테 | | 탈락 |
| 1차 탈락 | 면접 | 1 | 탈락 |
| 2차 탈락 | 면접 | 2 | 탈락 |
| 최종 탈락 | 최종 | | 탈락 |
| 최종 합격 / 오퍼 | 오퍼 | | 합격 |
| 결과 대기 | (도달한 단계) | | 진행중 |

## 라벨 → enum 매핑 (임포트 스크립트가 변환)
```
도달단계:  관심→wishlist  지원→applied  서류→document  코테→coding_test
           면접→interview  최종→final    오퍼→offer
결과:      진행중→pending  탈락→rejected  합격→accepted
```

## 스키마 SQL (MVP: 인증 없음 — user_id/RLS 없음)
```sql
-- 단계(파이프라인 위치) / 결과
create type application_stage as enum
  ('wishlist','applied','document','coding_test','interview','final','offer');
create type application_result as enum ('pending','rejected','accepted');

create table applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  position text,
  stage application_stage not null default 'applied',
  round smallint,                       -- 면접 차수 (stage=interview 일 때)
  result application_result not null default 'pending',
  applied_at date,
  job_url text,
  notes text,
  position_order double precision not null default 0,  -- 칸반 정렬
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index applications_stage_idx on applications (stage);

-- 활동 타임라인 (stage 변경 자동 기록 → 퍼널/소요일 통계 원천)
create table application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications on delete cascade,
  type text not null,                   -- 'stage_change' | 'note' | ...
  from_stage application_stage,
  to_stage application_stage,
  note text,
  occurred_at timestamptz default now()
);

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger applications_set_updated_at
  before update on applications for each row execute function set_updated_at();

-- stage 변경 자동 기록
create or replace function log_stage_change()
returns trigger language plpgsql as $$
begin
  if new.stage is distinct from old.stage then
    insert into application_events (application_id, type, from_stage, to_stage)
    values (new.id, 'stage_change', old.stage, new.stage);
  end if;
  return new;
end $$;
create trigger applications_log_stage_change
  after update on applications for each row execute function log_stage_change();

-- MVP: 인증 없음 → RLS 비활성(기본). 단일 사용자 가정.
-- Phase 2에서 user_id 컬럼 + RLS 추가.
```

## 임포트 방법 (두 갈래)
1. **Supabase 대시보드 Table Editor → Import CSV** (가장 간단): `seed/applications.csv` 업로드.
   단, 한글 라벨→enum 변환이 안 되므로, 업로드 전 CSV를 enum 값으로 변환하거나 아래 스크립트 사용.
2. **Node 임포트 스크립트** (`scripts/import.ts`, 추천): CSV 파싱 + 라벨→enum 매핑 + `applications` insert.
   - `applied_at` 오름차순으로 `position_order` 부여.
   - 실행: `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` 세팅 후 `npx tsx scripts/import.ts`.

## 작업 체크리스트
- [ ] Supabase 프로젝트 생성 + `.env.local` 채우기
- [ ] 스키마 SQL 실행 (SQL Editor)
- [ ] `seed/applications.csv` 작성 (사용자, 130행)
- [ ] 임포트 스크립트 작성 + 실행
- [ ] `00-overview.md`·`react.md` stage/result 모델로 갱신
- [ ] `/board`에서 실데이터 렌더 확인

## 다음
- `03-kanban.md`: dnd-kit 칸반 + 낙관적 업데이트 (실데이터 기반)
