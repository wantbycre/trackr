import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          지원 현황 요약과 전형 전환율을 한눈에 봅니다.
        </p>
      </div>
      <DashboardView />
    </div>
  );
}
