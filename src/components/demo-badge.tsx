'use client';

import { useDataMode } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

export function DemoBadge() {
  const mode = useDataMode();
  if (mode !== 'demo') return null;
  return (
    <Badge variant="outline" className="text-[10px]" title="로그인 전 데모 — 변경사항은 저장되지 않습니다">
      데모 · 저장 안 됨
    </Badge>
  );
}
