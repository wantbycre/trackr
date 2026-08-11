'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { demoStore } from '@/lib/demo-store';
import { useDataMode } from '@/hooks/use-auth';
import { keys } from '@/lib/query/keys';
import type { Application, ApplicationEvent, Stage } from '@/lib/applications';

/** 전체 지원 목록 (position_order 오름차순). demo=인메모리 / live=Supabase(RLS로 내 데이터). */
export function useApplications() {
  const mode = useDataMode();
  return useQuery({
    queryKey: [...keys.applications(), mode],
    queryFn: async (): Promise<Application[]> => {
      if (mode === 'demo') {
        return demoStore
          .listApplications()
          .sort((a, b) => a.position_order - b.position_order);
      }
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

/** 카드 이동/정렬 저장 — 낙관적 업데이트 + 실패 시 롤백. */
export function useMoveApplication() {
  const qc = useQueryClient();
  const mode = useDataMode();
  const listKey = [...keys.applications(), mode];

  return useMutation({
    mutationFn: async ({ id, stage, position_order }: MovePayload) => {
      if (mode === 'demo') {
        demoStore.move(id, stage, position_order);
        return;
      }
      const { error } = await supabase
        .from('applications')
        .update({ stage, position_order })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<Application[]>(listKey);
      qc.setQueryData<Application[]>(listKey, (old) =>
        (old ?? []).map((a) =>
          a.id === vars.id
            ? { ...a, stage: vars.stage, position_order: vars.position_order }
            : a,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

/** 특정 지원의 활동 타임라인 (occurred_at 오름차순) */
export function useApplicationEvents(applicationId: string | null) {
  const mode = useDataMode();
  return useQuery({
    queryKey: applicationId ? [...keys.events(applicationId), mode] : ['events', 'none'],
    enabled: !!applicationId,
    queryFn: async (): Promise<ApplicationEvent[]> => {
      if (mode === 'demo') return demoStore.listEvents(applicationId!);
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

/** 카드 상세 편집 저장. live에선 stage 변경 시 DB 트리거가 이벤트 자동 기록(demo는 스토어가 흉내). */
export function useUpdateApplication() {
  const qc = useQueryClient();
  const mode = useDataMode();
  return useMutation({
    mutationFn: async ({ id, patch }: UpdatePayload) => {
      if (mode === 'demo') {
        demoStore.update(id, patch);
        return;
      }
      const { error } = await supabase.from('applications').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...keys.applications(), mode] });
      qc.invalidateQueries({ queryKey: [...keys.events(vars.id), mode] });
    },
  });
}
