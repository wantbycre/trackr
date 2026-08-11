# 01 · 프로젝트 셋업 (Next / TS / Tailwind / shadcn / TanStack / Supabase)

_작성: 2026-08-11 · 상태: ✅ 완료_

## 목표
돌아가는 앱 껍데기를 만든다. 이후 모든 기능 작업의 확인 루프(로컬 dev 서버)를 확보하는 것이 목적.

- Next.js(App Router) + TypeScript + Tailwind + ESLint
- shadcn/ui 초기화 + 기본 컴포넌트
- TanStack Query v5 Provider 주입
- Supabase 브라우저 클라이언트 + 환경변수

## 결정
- **인증 없음(MVP)**: `@supabase/supabase-js`만 사용(브라우저 anon key 직결). `@supabase/ssr`/미들웨어는 Phase 2에서.
- Tailwind는 create-next-app 기본(v4) 사용.
- 패키지 매니저: `npm` (필요 시 pnpm로 교체 가능).

## 작업 순서

### 0) 기존 문서 보존 (conflict 회피)
현재 폴더에 `.md`/`.kiro`가 있어 `create-next-app .`이 거부된다. 임시 폴더에 스캐폴딩 후 병합한다.

```bash
cd /Users/want/want/portfolio/trackr
# 문서는 docs/ 로 정리(루트를 깔끔하게)
mkdir -p docs && mv 00-overview.md react.md 01-setup.md docs/ 2>/dev/null || true
```

### 1) Next 스캐폴딩 (임시 폴더 → 병합)
```bash
cd /Users/want/want/portfolio
npx create-next-app@latest trackr-scaffold \
  --typescript --tailwind --eslint --app --src-dir --use-npm \
  --import-alias "@/*" --no-turbopack
# 스캐폴딩 내용물을 trackr/ 로 이동(README 등은 기존 것 유지)
rsync -a --ignore-existing trackr-scaffold/ trackr/
# package.json 등 핵심 파일은 강제로 가져오기
cp -f trackr-scaffold/package.json trackr-scaffold/tsconfig.json \
      trackr-scaffold/next.config.* trackr/ 2>/dev/null || true
cp -rf trackr-scaffold/src trackr/ 2>/dev/null || true
rm -rf trackr-scaffold
cd trackr && npm install
```
> 대안: 새 폴더에 스캐폴딩하고 `docs/`·`.kiro/`를 그 폴더로 옮기는 방식도 가능. 결과만 같으면 됨.

### 2) shadcn/ui 초기화
```bash
npx shadcn@latest init   # 스타일/베이스컬러 프롬프트 → 기본값 진행
npx shadcn@latest add button card dialog sheet badge input textarea \
  dropdown-menu select label separator skeleton sonner
```

### 3) TanStack Query
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```
`src/app/providers.tsx` 생성:
```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
  }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```
`src/app/layout.tsx`에서 `<Providers>`로 children 감싸기.

### 4) Supabase 클라이언트
```bash
npm install @supabase/supabase-js
```
`src/lib/supabase/client.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```
`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5) 라우팅 뼈대
- `src/app/page.tsx` → `/board`로 리다이렉트
- `src/app/board/page.tsx` (빈 칸반 자리)
- `src/app/dashboard/page.tsx` (빈 대시보드 자리)

### 6) 실행/검증
```bash
npm run dev   # http://localhost:3000 → /board 진입 확인
```

## 검증 체크리스트
- [ ] `npm run dev` 정상 기동, `/board`·`/dashboard` 라우팅 동작
- [ ] Tailwind 클래스 적용 확인
- [ ] shadcn `Button` 하나 렌더 확인
- [ ] React Query Devtools 표시
- [ ] `.env.local` 미커밋(.gitignore 확인)

## 실제 실행 결과 (2026-08-11)
- 런타임: Node **v22.19.0** (fnm), npm 10.9.3
- 설치 버전: **Next 16.3.0 / React 19.2.8 / Tailwind v4** (Turbopack 기본), TypeScript 5, ESLint 9
- 스캐폴딩: `trackr-scaffold` 임시 폴더 생성 → `rsync`로 `trackr/`에 병합(기존 `.git`/`README.md`/문서 보존) → 임시 폴더 삭제
- 문서는 루트에 그대로 유지(README가 루트 기준 링크) — `docs/` 이동은 하지 않음
- 추가 패키지: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@supabase/supabase-js`
- shadcn/ui init(neutral, CSS vars) + 컴포넌트 14종: button, card, dialog, sheet, badge, input, textarea, dropdown-menu, select, label, separator, skeleton, sonner
- 생성 파일:
  - `src/app/providers.tsx` (QueryClientProvider + Devtools)
  - `src/lib/supabase/client.ts` (anon 클라이언트, env 미설정 시 경고)
  - `src/lib/query/keys.ts` (쿼리 키 팩토리)
  - `src/app/layout.tsx` (Providers + 헤더 내비 + Toaster, lang=ko, 메타데이터)
  - `src/app/page.tsx` (`/board` 리다이렉트)
  - `src/app/board/page.tsx` (칸반 플레이스홀더 7컬럼)
  - `src/app/dashboard/page.tsx` (KPI 카드 플레이스홀더)
  - `.env.local`(빈 값) / `.env.example`
- 검증(curl): `/` → 307 → `/board`(200, "칸반 보드"), `/dashboard`(200), 컴파일 에러 0
- dev 서버: `http://127.0.0.1:3000` 기동 확인

## 다음
- `02-schema.md`: Supabase 스키마 SQL 실행 + 엑셀 130건 CSV 임포트
