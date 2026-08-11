"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useApplications, useMoveApplication } from "@/hooks/use-applications";
import { STAGES, type Application, type Stage } from "@/lib/applications";
import { KanbanColumn } from "./kanban-column";
import { ApplicationCard } from "./application-card";
import { CardDetailSheet } from "./card-detail-sheet";
import { Skeleton } from "@/components/ui/skeleton";

type Columns = Record<Stage, Application[]>;

function group(apps: Application[]): Columns {
  const cols = Object.fromEntries(
    STAGES.map((s) => [s, [] as Application[]]),
  ) as Columns;
  for (const a of apps) (cols[a.stage] ?? (cols[a.stage] = [])).push(a);
  for (const s of STAGES) {
    cols[s].sort((x, y) => x.position_order - y.position_order);
  }
  return cols;
}

function findCard(cols: Columns, id: string): Application | null {
  for (const s of STAGES) {
    const hit = cols[s].find((a) => a.id === id);
    if (hit) return hit;
  }
  return null;
}

/** 이동 후 목록에서 idx 위치의 새 position_order를 이웃 중간값으로 계산 */
function computeOrder(list: Application[], idx: number): number {
  const prev = list[idx - 1]?.position_order;
  const next = list[idx + 1]?.position_order;
  if (prev == null && next == null) return 1000;
  if (prev == null) return next! - 1000;
  if (next == null) return prev + 1000;
  return (prev + next) / 2;
}

export function KanbanBoard() {
  const { data, isLoading, isError, error } = useApplications();
  const move = useMoveApplication();

  const [columns, setColumns] = useState<Columns>(() => group([]));
  const columnsRef = useRef<Columns>(columns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setCols = (updater: Columns | ((prev: Columns) => Columns)) =>
    setColumns((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: Columns) => Columns)(prev)
          : updater;
      columnsRef.current = next;
      return next;
    });

  // 서버 데이터 → 로컬 컬럼 동기화 (드래그 중이 아닐 때)
  useEffect(() => {
    if (data && !activeId) setCols(group(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function stageOf(id: string): Stage | null {
    if (id.startsWith("col:")) return id.slice(4) as Stage;
    for (const s of STAGES)
      if (columnsRef.current[s].some((a) => a.id === id)) return s;
    return null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  // 컨테이너 간 이동을 실시간 반영
  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const from = stageOf(String(active.id));
    const to = stageOf(String(over.id));
    if (!from || !to || from === to) return;

    setCols((prev) => {
      const item = prev[from].find((a) => a.id === active.id);
      if (!item) return prev;
      const fromList = prev[from].filter((a) => a.id !== active.id);
      const overIdx = prev[to].findIndex((a) => a.id === over.id);
      const insertAt = overIdx >= 0 ? overIdx : prev[to].length;
      const toList = [...prev[to]];
      toList.splice(insertAt, 0, { ...item, stage: to });
      return { ...prev, [from]: fromList, [to]: toList };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const to = stageOf(String(over.id));
    if (!to) return;

    // 같은 컬럼 내 정렬 반영
    setCols((prev) => {
      const list = prev[to];
      const oldIndex = list.findIndex((a) => a.id === active.id);
      const overIndex = String(over.id).startsWith("col:")
        ? list.length - 1
        : list.findIndex((a) => a.id === over.id);
      if (oldIndex >= 0 && overIndex >= 0 && oldIndex !== overIndex) {
        return { ...prev, [to]: arrayMove(list, oldIndex, overIndex) };
      }
      return prev;
    });

    // 최종 위치로 저장 (낙관적)
    const finalList = columnsRef.current[to];
    const idx = finalList.findIndex((a) => a.id === active.id);
    if (idx < 0) return;

    const original = data?.find((a) => a.id === active.id);
    const newOrder = computeOrder(finalList, idx);
    const changed =
      !original ||
      original.stage !== to ||
      original.position_order !== newOrder;
    if (changed) {
      move.mutate({
        id: String(active.id),
        stage: to,
        position_order: newOrder,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 md:grid md:h-[calc(100dvh-12rem)] md:grid-cols-7">
        {STAGES.map((s) => (
          <div
            key={s}
            className="w-full space-y-2 rounded-lg border p-2 md:w-auto"
          >
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        데이터를 불러오지 못했습니다: {(error as Error)?.message}
        <div className="mt-1 text-xs text-muted-foreground">
          .env.local 의 Supabase 키와 RLS 설정을 확인하세요.
        </div>
      </div>
    );
  }

  const activeCard = activeId ? findCard(columns, activeId) : null;
  const selectedCard = selectedId ? findCard(columns, selectedId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-col gap-3 md:grid md:h-[calc(100dvh-12rem)] md:grid-cols-7 md:overflow-hidden">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            items={columns[stage]}
            onOpen={(a) => setSelectedId(a.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <ApplicationCard application={activeCard} overlay />
        ) : null}
      </DragOverlay>
      <CardDetailSheet
        application={selectedCard}
        open={!!selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
      />
    </DndContext>
  );
}
