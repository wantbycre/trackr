import { STAGES, STAGE_LABEL, type Application, type Stage } from '@/lib/applications';

/** 퍼널에 표시할 단계(관심 제외, 지원부터) */
const FUNNEL_STAGES: Stage[] = [
  'applied',
  'document',
  'coding_test',
  'interview',
  'final',
  'offer',
];

const stageIndex = (s: Stage) => STAGES.indexOf(s);

export interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  rejectRate: number; // 0~100
  /** 각 단계에 "도달한" 누적 수(그 단계 이상까지 간 지원) */
  funnel: { stage: Stage; label: string; reached: number; rate: number }[];
  /** 현재 단계 분포 */
  distribution: { stage: Stage; label: string; count: number }[];
}

export function computeStats(apps: Application[]): DashboardStats {
  const total = apps.length;
  const pending = apps.filter((a) => a.result === 'pending').length;
  const accepted = apps.filter((a) => a.result === 'accepted').length;
  const rejected = apps.filter((a) => a.result === 'rejected').length;

  const base = FUNNEL_STAGES.reduce(
    (max, s) =>
      Math.max(max, apps.filter((a) => stageIndex(a.stage) >= stageIndex(s)).length),
    0,
  );

  const funnel = FUNNEL_STAGES.map((s) => {
    const reached = apps.filter((a) => stageIndex(a.stage) >= stageIndex(s)).length;
    return {
      stage: s,
      label: STAGE_LABEL[s],
      reached,
      rate: base > 0 ? Math.round((reached / base) * 100) : 0,
    };
  });

  const distribution = STAGES.map((s) => ({
    stage: s,
    label: STAGE_LABEL[s],
    count: apps.filter((a) => a.stage === s).length,
  })).filter((d) => d.count > 0);

  return {
    total,
    pending,
    accepted,
    rejected,
    rejectRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
    funnel,
    distribution,
  };
}
