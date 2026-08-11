# 09 · 배포 (Vercel CI/CD) + 빌드 타입 수정

_작성: 2026-08-11 · 상태: 빌드 수정 완료 / Vercel 연결은 사용자 진행_

## 빌드 타입 수정
`next build`(전체 tsc)가 dev/lint에서 안 잡힌 타입 오류 3건을 드러냄 → 수정:
- `auth-nav.tsx`: base-ui Button은 `asChild` 미지원 → `render={<Link/>}` 로 변경
- `dashboard-view.tsx`: recharts `Tooltip.formatter` 시그니처 정정(명시적 `number` 제거, payload는 캐스팅)

이후 `next build` ✓ (5개 라우트 정적 프리렌더).

## Vercel CI/CD (사용자 진행)
1. https://vercel.com 로그인(GitHub 연동)
2. **Add New → Project → `wantbycre/trackr` import**
3. Framework: Next.js 자동 감지, 빌드 명령 기본값 그대로
4. **Environment Variables** 추가(필수 — `.env.local`은 gitignore라 레포에 없음):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy → 프로덕션 URL 발급

이후 자동 CI/CD:
- `main` push → 프로덕션 재배포
- PR 생성 → 프리뷰 배포 URL 코멘트

## Supabase 연동 참고
- 이메일/비번 인증이라 OAuth redirect는 불필요.
- (선택) Authentication → URL Configuration의 **Site URL**을 Vercel 도메인으로 두면 이메일 링크가 올바른 도메인을 가리킴.

## 검증
- 로컬 `next build` ✓ / 배포 후 프로덕션 URL에서 데모 모드 + 로그인 동작 확인
