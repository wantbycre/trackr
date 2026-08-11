'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { RESULT_META, type Application } from '@/lib/applications';
import { cn } from '@/lib/utils';

interface Props {
  application: Application;
  /** DragOverlay용 정적 렌더(리스너/트랜스폼 없이) */
  overlay?: boolean;
  onOpen?: (application: Application) => void;
}

export function ApplicationCard({ application, overlay, onOpen }: Props) {
  const sortable = useSortable({ id: application.id });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const result = RESULT_META[application.result];

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={
        overlay
          ? undefined
          : { transform: CSS.Transform.toString(transform), transition }
      }
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={overlay ? undefined : () => onOpen?.(application)}
      className={cn(
        'rounded-md border bg-background p-2.5 text-sm shadow-sm',
        'cursor-grab active:cursor-grabbing',
        isDragging && !overlay && 'opacity-40',
        overlay && 'shadow-lg ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium leading-tight">{application.company_name}</span>
        <Badge variant={result.variant} className="shrink-0 text-[10px]">
          {result.label}
        </Badge>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>{application.position}</span>
        <span>·</span>
        <span>{application.platform}</span>
        {application.stage === 'interview' && application.round != null && (
          <Badge variant="outline" className="text-[10px]">
            {application.round}차
          </Badge>
        )}
      </div>
      {application.notes && (
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
          {application.notes}
        </p>
      )}
    </div>
  );
}
