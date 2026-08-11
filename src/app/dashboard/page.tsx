import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KPIS = [
  { label: "총 지원", value: "—" },
  { label: "진행 중", value: "—" },
  { label: "오퍼", value: "—" },
  { label: "탈락률", value: "—" },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          전환율 퍼널·단계별 체류시간·주간 추이. (차트는 05단계에서 구현)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {kpi.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
