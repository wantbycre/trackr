--- /dev/null
+++ /Users/want/want/trackr/docs/00-overview.md
@@ -0,0 +1,168 @@
+# Trackr — 전체 맥락 (Master Context)

- +> 이 문서는 프로젝트의 **단일 진실 원천(source of truth)**. 큰 결정만 여기 기록하고,
  +> 작업 단위의 상세는 `docs/NN-*.md` 순차 로그에 남긴다. Kiro/Cursor는 이 파일을 항상 참조.
- +_최종 수정: 2026-08-11_
- +## 1. 제품 정의
  +- **Trackr**: 내가 지원한 회사들을 칸반으로 관리하고, 전형 단계별 전환율·응답 소요일을
- 대시보드로 보는 **개인 구직 파이프라인 트래커**.
  +- 성격: 잡플래닛(리뷰 커뮤니티) ❌ / Huntr·Teal 류 개인 생산성 툴 ✅.
  +- 목적: **포트폴리오 · 면접 시연용**. "직관적"(열자마자 이해) + 대시보드 특기 노출.
- +## 2. 범위 (Scope)
  +### MVP (지금)
  +- 칸반 보드 (드래그로 단계 이동, 낙관적 업데이트)
  +- 카드 상세 (CRUD + 활동 타임라인)
  +- 대시보드 (전환율 퍼널 · 응답 소요일 · 주간 추이)
  +- **엑셀 130곳 CSV 임포트**로 초기 데이터 시드
  +### 제외 (나중)
  +- **인증(Auth)** → Phase 2. MVP는 단일 사용자 가정, RLS off.
  +- 파일 첨부(이력서 Storage) → 카드 상세 안정화 후.
  +- 캘린더/리마인더 → 확장.
- +## 3. 기술 스택
  +| 영역 | 선택 |
  +|------|------|
  +| 프레임워크 | Next.js (App Router) + TypeScript |
  +| 스타일 | Tailwind + shadcn/ui |
  +| 데이터 | Supabase (Postgres). MVP는 anon key 직결, RLS off |
  +| 서버상태 | TanStack Query v5 |
  +| 드래그앤드롭 | @dnd-kit/core |
  +| 차트 | recharts (or shadcn charts) |
- +## 4. 정보 구조 / 화면
  +- `/board` — 칸반 (메인)
  +- 카드 클릭 → 상세 Drawer/Sheet
  +- `/dashboard` — 통계
  +- (Phase 2) `/login`
- +## 5. 데이터 모델 (MVP: 인증 없음 버전)
  +> 인증 없으므로 `user_id` 없이 단일 사용자. Phase 2에서 `user_id` 컬럼 추가 + RLS 활성.
- +### applications (칸반 카드)
  +| 컬럼 | 타입 | 비고 |
  +|------|------|------|
  +| id | uuid PK | gen_random_uuid() |
  +| company_name | text NOT NULL | |
  +| position | text | |
  +| job_url | text | |
  +| location | text | |
  +| salary_min / salary_max | int | |
  +| stage | enum | wishlist/applied/screening/coding_test/interview/offer/rejected/accepted |
  +| position_order | float | 칸반 정렬 |
  +| priority | smallint | 1 high ~ 3 low |
  +| applied_at / deadline | date | |
  +| notes | text | |
  +| is_archived | bool | |
  +| created_at / updated_at | timestamptz | updated_at 트리거 |
- +### application_events (활동 타임라인)
  +- application_id, type('stage_change'|'note'|...), from_stage, to_stage, note, occurred_at
  +- stage 변경 시 트리거로 자동 기록 → 퍼널/소요일 통계 원천.
- +## 6. 엑셀 → DB 시드 계획
  +- 원본: 지원 회사 ~130곳 엑셀.
  +- 흐름: 엑셀 → CSV 저장 → 컬럼 매핑 스크립트 → `applications` INSERT.
  +- **필요**: 엑셀 실제 헤더 목록 (매핑 확정용). ← 다음 스텝에서 요청.
- +## 7. 개발 로드맵 ↔ 순차 문서 매핑
  +| 문서 | 내용 | 상태 |
  +|------|------|------|
  +| `01-setup.md` | Next/TS/Tailwind/shadcn/Supabase/TanStack 초기화 | ⬜ |
  +| `02-schema.md` | DB 스키마 + 엑셀 CSV 임포트 | ⬜ |
  +| `03-kanban.md` | 칸반 보드 (dnd-kit + 낙관적 업데이트) | ⬜ |
  +| `04-card-detail.md` | 카드 상세 Drawer + 타임라인 | ⬜ |
  +| `05-dashboard.md` | 퍼널/소요일/추이 차트 | ⬜ |
  +| `06-polish.md` | 빈상태/스켈레톤/반응형/다크모드 | ⬜ |
  +| `07-auth.md` | (Phase 2) 인증 + user_id + RLS | ⬜ |
- +## 8. 문서 규칙
  +- 마스터(이 파일)엔 **큰 결정만**. 세부는 순차 로그.
  +- 순차 로그 포맷: `## 목표 / ## 결정 / ## 작업내역 / ## 검증 / ## 다음`.
  +- 결정이 바뀌면 마스터의 해당 섹션을 수정하고 로드맵 상태 갱신.
