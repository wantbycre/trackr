'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { keys } from '@/lib/query/keys';
import type { Application, ApplicationEvent, Stage } from '@/lib/applications';

/** 전체 지원 목록 (position_order 오름차순) */
export function useApplications() {
  return useQuery({
    queryKey: keys.applications(),
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('position_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });
}

export interface MovePayload {
  id: string;
  stage: Stage;
  position_order: number;
}

/**
 * 카드 이동/정렬 저장 — 낙관적 업데이트 + 실패 시 롤백.
 * onMutate에서 캐시를 즉시 갱신, 실패하면 이전 스냅샷으로 되돌리고,
 * 완료되면 서버 상태로 재검증한다.
 */
export function useMoveApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage, position_order }: MovePayload) => {
      const { error } = await supabase
        .from('applications')
        .update({ stage, position_order })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: keys.applications() });
      const prev = qc.getQueryData<Application[]>(keys.applications());
      qc.setQueryData<Application[]>(keys.applications(), (old) =>
        (old ?? []).map((a) =>
          a.id === vars.id
            ? { ...a, stage: vars.stage, position_order: vars.position_order }
            : a,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.applications(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.applications() });
    },
  });
}

/** 특정 지원의 활동 타임라인 (occurred_at 오름차순) */
export function useApplicationEvents(applicationId: string | null) {
  return useQuery({
    queryKey: applicationId ? keys.events(applicationId) : ['events', 'none'],
    enabled: !!applicationId,
    queryFn: async (): Promise<ApplicationEvent[]> => {
      const { data, error } = await supabase
        .from('application_events')
        .select('*')
        .eq('application_id', applicationId!)
        .order('occurred_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ApplicationEvent[];
    },
  });
}

export interface UpdatePayload {
  id: string;
  patch: Partial<
    Pick<
      Application,
      | 'platform'
      | 'company_name'
      | 'position'
      | 'stage'
      | 'round'
      | 'result'
      | 'applied_at'
      | 'job_url'
      | 'notes'
    >
  >;
}

/** 카드 상세 편집 저장. stage 변경 시 DB 트리거가 application_events에 자동 기록. */
export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: UpdatePayload) => {
      const { error } = await supabase.from('applications').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.applications() });
      qc.invalidateQueries({ queryKey: keys.events(vars.id) });
    },
  });
}
