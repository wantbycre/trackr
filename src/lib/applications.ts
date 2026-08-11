// Trackr 도메인 타입 & 표시 메타 (react.md / 02-schema.md 모델과 일치)

export type Stage =
  | 'wishlist'
  | 'applied'
  | 'document'
  | 'coding_test'
  | 'interview'
  | 'final'
  | 'offer';

export type Result = 'pending' | 'rejected' | 'accepted';

export interface ApplicationEvent {
  id: string;
  application_id: string;
  type: string; // 'stage_change' | 'note' | ...
  from_stage: Stage | null;
  to_stage: Stage | null;
  note: string | null;
  occurred_at: string;
}

export interface Application {
  id: string;
  platform: string;
  company_name: string;
  position: string;
  stage: Stage;
  round: number | null;
  result: Result;
  applied_at: string | null;
  job_url: string | null;
  notes: string | null;
  position_order: number;
  created_at: string;
  updated_at: string;
}

/** 칸반 컬럼 순서(파이프라인) */
export const STAGES: Stage[] = [
  'wishlist',
  'applied',
  'document',
  'coding_test',
  'interview',
  'final',
  'offer',
];

export const STAGE_LABEL: Record<Stage, string> = {
  wishlist: '관심',
  applied: '지원',
  document: '서류',
  coding_test: '코테',
  interview: '면접',
  final: '최종',
  offer: '오퍼',
};

/** result → shadcn Badge variant + 라벨 */
export const RESULT_META: Record<
  Result,
  { label: string; variant: 'secondary' | 'destructive' | 'default' | 'success' }
> = {
  pending: { label: '진행중', variant: 'default' },
  rejected: { label: '탈락', variant: 'destructive' },
  accepted: { label: '합격', variant: 'success' },
};
