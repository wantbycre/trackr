import { DEMO_APPLICATIONS, DEMO_EVENTS } from '@/lib/demo-data';
import type { Application, ApplicationEvent, Stage } from '@/lib/applications';

// 로그인 전 데모용 인메모리 스토어. 저장 없음 — 새로고침 시 초기 데이터로 리셋.
let apps: Application[] = DEMO_APPLICATIONS.map((a) => ({ ...a }));
let events: ApplicationEvent[] = DEMO_EVENTS.map((e) => ({ ...e }));

export const demoStore = {
  listApplications(): Application[] {
    return apps.map((a) => ({ ...a }));
  },

  listEvents(applicationId: string): ApplicationEvent[] {
    return events
      .filter((e) => e.application_id === applicationId)
      .sort((x, y) => x.occurred_at.localeCompare(y.occurred_at))
      .map((e) => ({ ...e }));
  },

  move(id: string, stage: Stage, position_order: number) {
    apps = apps.map((a) =>
      a.id === id ? { ...a, stage, position_order, updated_at: new Date().toISOString() } : a,
    );
  },

  update(
    id: string,
    patch: Partial<
      Pick<
        Application,
        'platform' | 'company_name' | 'position' | 'stage' | 'round' | 'result' | 'applied_at' | 'job_url' | 'notes'
      >
    >,
  ) {
    const before = apps.find((a) => a.id === id);
    apps = apps.map((a) =>
      a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a,
    );
    // 실제 트리거 흉내: stage가 바뀌면 타임라인 이벤트 추가
    if (before && patch.stage && patch.stage !== before.stage) {
      events = [
        ...events,
        {
          id: `demo-ev-${Date.now()}`,
          application_id: id,
          type: 'stage_change',
          from_stage: before.stage,
          to_stage: patch.stage,
          note: null,
          occurred_at: new Date().toISOString(),
        },
      ];
    }
  },
};
