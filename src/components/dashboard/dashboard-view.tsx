'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApplications } from '@/hooks/use-applications';
import { computeStats } from '@/lib/stats';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const { data, isLoading, isError, error } = useApplications();
  const stats = useMemo(() => (data ? computeStats(data) : null), [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        통계를 불러오지 못했습니다: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="총 지원" value={`${stats.total}`} />
        <StatCard label="진행 중" value={`${stats.pending}`} />
        <StatCard label="합격" value={`${stats.accepted}`} />
        <StatCard label="탈락률" value={`${stats.rejectRate}%`} sub={`탈락 ${stats.rejected}건`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 전환율 퍼널 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">전환율 퍼널</CardTitle>
            <p className="text-xs text-muted-foreground">각 단계 이상까지 도달한 지원 수</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.funnel} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                  formatter={(v: number, _n, p) => [`${v}건 (${p.payload.rate}%)`, '도달']}
                />
                <Bar dataKey="reached" radius={[0, 4, 4, 0]} fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 단계 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">현재 단계 분포</CardTitle>
            <p className="text-xs text-muted-foreground">지원들이 현재 머문 단계</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.distribution} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                  formatter={(v: number) => [`${v}건`, '지원']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.distribution.map((d) => (
                    <Cell key={d.stage} fill="var(--primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        ※ 단계별 평균 체류시간·주간 추이는 활동 이벤트/지원일 데이터가 쌓이면 추가됩니다(현재 시드는
        결과 중심이라 전환 타임스탬프가 없음).
      </p>
    </div>
  );
}
