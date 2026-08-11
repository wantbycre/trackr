# 06 · 폴리시 (다크모드 · 반응형 · 상태 처리)

_작성: 2026-08-11 · 상태: 구현 완료(리뷰 대기)_

## 목표
사용성/완성도 다듬기: 다크모드 토글, 반응형, 로딩/빈/에러 상태 확인.

## 변경 내용
- **다크모드**: `next-themes` `ThemeProvider`(attribute="class", system 기본) — `src/app/providers.tsx`
  - `<html suppressHydrationWarning>` 추가(하이드레이션 경고 방지)
  - 헤더 우측에 `ModeToggle`(Sun/Moon, lucide) — `src/components/mode-toggle.tsx`
  - sonner Toaster가 테마 따라감
- **상태 처리**(기구현 확인): 보드/대시보드 로딩 스켈레톤, 에러 배너, 컬럼 빈 상태
- **반응형**: 헤더 `max-w-6xl`, 보드 가로 스크롤, 대시보드 grid(모바일 2열 → sm 4열, 차트 lg 2열)
- README 로드맵 1~6 완료 표기

## 검증
- `/board`·`/dashboard` 200, ESLint 0, 컴파일 에러 0
- 테마 토글 시 클래스 기반 다크/라이트 전환(테마 토큰 사용해 위젯/차트 모두 대응)

## 다음(선택)
- 데모 데이터 다양화(진행중/합격/여러 단계) → 퍼널·배지 시연 품질↑
- Phase 2: 인증 + user_id + RLS
