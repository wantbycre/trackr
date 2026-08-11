# 07-b · 인증(이메일/비번) + RLS

_작성: 2026-08-11 · 상태: 구현 중_

## 목표

이메일/비밀번호 회원가입·로그인. 로그인 시 **내 데이터만**(user_id + RLS). 로그인 전에는 7-a 데모 모드 유지.

## Supabase 대시보드 설정 (사용자)

1. Authentication → Providers → **Email** 활성(기본 on). OAuth는 사용 안 함.
2. (개발 편의) Authentication → Sign In / Providers → **"Confirm email" 끄기**를 권장.
   - 켜져 있으면 회원가입 후 이메일 인증을 해야 로그인됨(개발/시연 번거로움).

## DB 마이그레이션 (SQL Editor에서 실행)

```sql
-- 1) user_id 컬럼 (기본값 = 현재 로그인 유저)
alter table public.applications
  add column if not exists user_id uuid references auth.users on delete cascade default auth.uid();
alter table public.application_events
  add column if not exists user_id uuid references auth.users on delete cascade default auth.uid();

-- 2) RLS 켜기
alter table public.applications enable row level security;
alter table public.application_events enable row level security;

-- 3) 정책: 내 행만
create policy "app_own_select" on public.applications for select using (auth.uid() = user_id);
create policy "app_own_insert" on public.applications for insert with check (auth.uid() = user_id);
create policy "app_own_update" on public.applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "app_own_delete" on public.applications for delete using (auth.uid() = user_id);

create policy "evt_own_select" on public.application_events for select using (auth.uid() = user_id);
create policy "evt_own_insert" on public.application_events for insert with check (auth.uid() = user_id);
```

### (선택) 기존 146건을 내 계정으로 귀속

회원가입 후 내 uid 확인(Authentication → Users) 뒤:

```sql
update public.applications set user_id = '194851b2-7f43-4c47-a748-2ee4f6adc1be' where user_id is null;
update public.application_events e
  set user_id = a.user_id from public.applications a where e.application_id = a.id and e.user_id is null;
```

귀속 안 하면 로그인 후 내 보드는 **빈 상태**로 시작(앱에서 직접 추가).

## 앱 구현

- 클라이언트 세션(supabase-js, localStorage 지속) — 순수 CSR 앱이라 미들웨어/SSR 없이 충분.
- `/login`: 이메일/비번 로그인 + 회원가입 토글.
- 헤더: 로그인 시 이메일 + 로그아웃, 비로그인 시 "로그인" 링크. (데모 배지는 비로그인 때 유지)
- 로그인/로그아웃 시 `useSession`이 감지 → 데이터 모드 demo↔live 자동 전환.

## 검증

- 회원가입 → 로그인 → 보드가 live(빈/내 데이터)로 전환, 로그아웃 시 데모로 복귀.

## 다음(선택)

- 배포(Vercel) / 서버 세션·미들웨어 하드닝
