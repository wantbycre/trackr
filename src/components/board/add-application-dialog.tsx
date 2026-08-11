'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateApplication } from '@/hooks/use-applications';
import { RESULT_META, STAGES, STAGE_LABEL, type Result, type Stage } from '@/lib/applications';

const selectCls = 'h-9 rounded-md border border-input bg-background px-2.5 text-sm';

export function AddApplicationDialog() {
  const create = useCreateApplication();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('프론트엔드');
  const [stage, setStage] = useState<Stage>('applied');
  const [result, setResult] = useState<Result>('pending');
  const [appliedAt, setAppliedAt] = useState('');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setPlatform('');
    setCompany('');
    setPosition('프론트엔드');
    setStage('applied');
    setResult('pending');
    setAppliedAt('');
    setNotes('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        platform: platform.trim(),
        company_name: company.trim(),
        position: position.trim(),
        stage,
        result,
        applied_at: appliedAt || null,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success('지원을 추가했습니다');
          reset();
          setOpen(false);
        },
        onError: (err) => toast.error(`추가 실패: ${(err as Error).message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">+ 지원 추가</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>지원 추가</DialogTitle>
          <DialogDescription>새 지원 카드를 만듭니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">플랫폼 *</Label>
            <Input
              required
              list="platform-options"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="선택하거나 직접 입력"
            />
            <datalist id="platform-options">
              <option value="원티드" />
              <option value="잡코리아" />
              <option value="사람인" />
            </datalist>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">회사이름 *</Label>
            <Input required value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">직무 *</Label>
            <Input required value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">단계</Label>
              <select className={selectCls} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">결과</Label>
              <select className={selectCls} value={result} onChange={(e) => setResult(e.target.value as Result)}>
                {(Object.keys(RESULT_META) as Result[]).map((r) => (
                  <option key={r} value={r}>{RESULT_META[r].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">지원일</Label>
            <Input type="date" value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">메모</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? '추가 중…' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
