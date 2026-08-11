import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  "관심",
  "지원",
  "서류",
  "코테",
  "면접",
  "오퍼",
  "탈락",
] as const;

export default function BoardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">칸반 보드</h1>
          <p className="text-sm text-muted-foreground">
            지원 현황을 단계별로 관리합니다. (드래그·데이터 연동은 03단계에서 구현)
          </p>
        </div>
        <Button size="sm">+ 지원 추가</Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <section
            key={stage}
            className="flex w-64 shrink-0 flex-col gap-2 rounded-lg border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{stage}</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              카드 없음
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
