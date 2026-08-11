'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useSession } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function AuthNav() {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) return null;

  if (!session) {
    return (
      <Button variant="outline" size="sm" render={<Link href="/login">로그인</Link>} />
    );
  }

  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success('로그아웃되었습니다');
    router.push('/board');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {session.user.email}
      </span>
      <Button variant="ghost" size="sm" onClick={onLogout}>
        로그아웃
      </Button>
    </div>
  );
}
