import { KanbanBoard } from "@/components/board/kanban-board";

export default function BoardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">칸반 보드</h1>
        <p className="text-sm text-muted-foreground">
          지원 현황을 단계별로 관리합니다. 카드를 드래그해 단계를 옮기세요.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
