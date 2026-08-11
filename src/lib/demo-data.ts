import type { Application, ApplicationEvent } from '@/lib/applications';

// 로그인 전 데모용 큐레이션 데이터(가상 회사). 다양한 단계/결과로 퍼널·배지를 보여줌.
// 저장되지 않으며 새로고침 시 리셋된다.

const now = '2026-08-01T09:00:00.000Z';

function app(
  i: number,
  data: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'position_order'> &
    Partial<Pick<Application, 'position_order'>>,
): Application {
  return {
    id: `demo-${i}`,
    position_order: i * 1000,
    created_at: now,
    updated_at: now,
    ...data,
  };
}

export const DEMO_APPLICATIONS: Application[] = [
  app(1, { platform: '원티드', company_name: '노바페이', position: '프론트엔드', stage: 'wishlist', round: null, result: 'pending', applied_at: null, job_url: null, notes: '핀테크, 관심 등록' }),
  app(2, { platform: '사람인', company_name: '클라우드런', position: '프론트엔드', stage: 'applied', round: null, result: 'pending', applied_at: '2026-07-20', job_url: null, notes: null }),
  app(3, { platform: '직접지원', company_name: '픽셀랩', position: '프론트엔드', stage: 'document', round: null, result: 'rejected', applied_at: '2026-07-10', job_url: null, notes: '서류 탈락' }),
  app(4, { platform: '원티드', company_name: '데이터브릿지', position: '프론트엔드', stage: 'document', round: null, result: 'pending', applied_at: '2026-07-22', job_url: null, notes: '서류 결과 대기' }),
  app(5, { platform: '점핏', company_name: '코드웨이브', position: '프론트엔드', stage: 'coding_test', round: null, result: 'rejected', applied_at: '2026-07-05', job_url: null, notes: '코테 탈락' }),
  app(6, { platform: '사람인', company_name: '스택포지', position: '프론트엔드', stage: 'coding_test', round: null, result: 'pending', applied_at: '2026-07-25', job_url: null, notes: null }),
  app(7, { platform: '링크드인', company_name: '세이프하버', position: '프론트엔드', stage: 'interview', round: 1, result: 'pending', applied_at: '2026-07-18', job_url: null, notes: '1차 면접 예정' }),
  app(8, { platform: '원티드', company_name: '오르빗', position: '프론트엔드', stage: 'interview', round: 2, result: 'rejected', applied_at: '2026-06-28', job_url: null, notes: '2차에서 탈락' }),
  app(9, { platform: '지인추천', company_name: '루멘소프트', position: '프론트엔드', stage: 'final', round: null, result: 'pending', applied_at: '2026-06-30', job_url: null, notes: '최종 결과 대기' }),
  app(10, { platform: '직접지원', company_name: '그린리프', position: '프론트엔드', stage: 'offer', round: null, result: 'accepted', applied_at: '2026-06-15', job_url: null, notes: '오퍼 수락 🎉' }),
];

export const DEMO_EVENTS: ApplicationEvent[] = [
  { id: 'demo-ev-1', application_id: 'demo-8', type: 'stage_change', from_stage: 'document', to_stage: 'coding_test', note: null, occurred_at: '2026-07-01T09:00:00.000Z' },
  { id: 'demo-ev-2', application_id: 'demo-8', type: 'stage_change', from_stage: 'coding_test', to_stage: 'interview', note: null, occurred_at: '2026-07-08T09:00:00.000Z' },
  { id: 'demo-ev-3', application_id: 'demo-8', type: 'note', from_stage: null, to_stage: null, note: '2차 면접 후 불합격 통보', occurred_at: '2026-07-15T09:00:00.000Z' },
  { id: 'demo-ev-4', application_id: 'demo-10', type: 'stage_change', from_stage: 'final', to_stage: 'offer', note: null, occurred_at: '2026-06-20T09:00:00.000Z' },
];
