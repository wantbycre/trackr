'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { keys } from '@/lib/query/keys';
import type { Application, Stage } from '@/lib/applications';

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
