'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useApplicationEvents, useUpdateApplication, useDeleteApplication } from '@/hooks/use-applications';
import {
  RESULT_META,
  STAGES,
  STAGE_LABEL,
  type Application,
  type Result,
  type Stage,
} from '@/lib/applications';

interface Props {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 외곽: Sheet 열림/닫힘. 내용은 application.id로 keyed 리마운트 → 폼 초기화에 effect 불필요. */
export function CardDetailSheet({ application, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        {application ? (
          <DetailBody
            key={application.id}
            application={application}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type FormState = {
  platform: string;
  company_name: string;
  position: string;
  stage: Stage;
  result: Result;
  applied_at: string;
  job_url: string;
  notes: string;
};

const selectCls = 'h-9 rounded-md border border-input bg-background px-2.5 text-sm';

function DetailBody({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const update = useUpdateApplication();
  const del = useDeleteApplication();
  const { data: events, isLoading: eventsLoading } = useApplicationEvents(application.id);

  const [form, setForm] = useState<FormState>(() => ({
    platform: application.platform ?? '',
    company_name: application.company_name ?? '',
    position: application.position ?? '',
    stage: application.stage,
    result: application.result,
    applied_at: application.applied_at ?? '',
    job_url: application.job_url ?? '',
    notes: application.notes ?? '',
  }));

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => {
    update.mutate(
      {
        id: application.id,
        patch: {
          platform: form.platform.trim(),
          company_name: form.company_name.trim(),
          position: form.position.trim(),
          stage: form.stage,
          result: form.result,
          applied_at: form.applied_at || null,
          job_url: form.job_url.trim() || null,
          notes: form.notes.trim() || null,
          round: form.stage === 'interview' ? application.round : null,
        },
      },
      {
        onSuccess: () => {
          toast.success('저장했습니다');
          onClose();
        },
        onError: (e) => toast.error(`저장 실패: ${(e as Error).message}`),
      },
    );
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {application.company_name}
          <Badge variant={RESULT_META[form.result].variant} className="text-[10px]">
            {RESULT_META[form.result].label}
          </Badge>
        </SheetTitle>
        <SheetDescription>지원 정보 편집 및 활동 이력</SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
        <Field label="플랫폼">
          <Input value={form.platform} onChange={(e) => set('platform', e.target.value)} />
        </Field>
        <Field label="회사이름">
          <Input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
        </Field>
        <Field label="직무">
          <Input value={form.position} onChange={(e) => set('position', e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="단계">
            <select
              className={selectCls}
              value={form.stage}
              onChange={(e) => set('stage', e.target.value as Stage)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="결과">
            <select
              className={selectCls}
              value={form.result}
              onChange={(e) => set('result', e.target.value as Result)}
            >
              {(Object.keys(RESULT_META) as Result[]).map((r) => (
                <option key={r} value={r}>
                  {RESULT_META[r].label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="지원일">
          <Input type="date" value={form.applied_at} onChange={(e) => set('applied_at', e.target.value)} />
        </Field>
        <Field label="JD 링크">
          <Input value={form.job_url} placeholder="https://..." onChange={(e) => set('job_url', e.target.value)} />
        </Field>
        <Field label="메모">
          <Textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>

        <Separator className="my-2" />

        <div>
          <h3 className="mb-2 text-sm font-medium">활동 타임라인</h3>
          {eventsLoading ? (
            <p className="text-xs text-muted-foreground">불러오는 중…</p>
          ) : events && events.length > 0 ? (
            <ol className="space-y-2">
              {events.map((ev) => (
                <li key={ev.id} className="flex gap-2 text-xs">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <div>
                      {ev.type === 'stage_change'
                        ? `${ev.from_stage ? STAGE_LABEL[ev.from_stage] : '—'} → ${ev.to_stage ? STAGE_LABEL[ev.to_stage] : '—'}`
                        : ev.note ?? ev.type}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(ev.occurred_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-muted-foreground">아직 활동 기록이 없습니다.</p>
          )}
        </div>
      </div>

      <SheetFooter>
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={del.isPending}
            onClick={() => {
              if (!confirm(`"${application.company_name}" 지원을 삭제할까요?`)) return;
              del.mutate(application.id, {
                onSuccess: () => {
                  toast.success('삭제했습니다');
                  onClose();
                },
                onError: (e) => toast.error(`삭제 실패: ${(e as Error).message}`),
              });
            }}
          >
            삭제
          </Button>
          <Button onClick={onSave} disabled={update.isPending}>
            {update.isPending ? '저장 중…' : '저장'}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
