'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { ApplicationCard } from './application-card';
import { STAGE_LABEL, type Application, type Stage } from '@/lib/applications';
import { cn } from '@/lib/utils';

interface Props {
  stage: Stage;
  items: Application[];
  onOpen?: (application: Application) => void;
}

export function KanbanColumn({ stage, items, onOpen }: Props) {
  // 빈 컬럼에도 드롭할 수 있도록 컬럼 자체를 droppable로 등록
  const { setNodeRef, isOver } = useDroppable({ id: `col:${stage}` });

  return (
    <section className="flex w-64 shrink-0 flex-col rounded-lg border bg-card">
      <header className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">{STAGE_LABEL[stage]}</span>
        <Badge variant="secondary">{items.length}</Badge>
      </header>
      <SortableContext
        items={items.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-24 flex-1 flex-col gap-2 p-2 transition-colors',
            isOver && 'bg-accent/50',
          )}
        >
          {items.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              비어 있음
            </div>
          ) : (
            items.map((a) => (
              <ApplicationCard key={a.id} application={a} onOpen={onOpen} />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}
