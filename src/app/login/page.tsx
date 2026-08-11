'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          toast.success('회원가입 완료. 이메일 확인이 필요할 수 있어요.');
          setMode('login');
          return;
        }
        toast.success('가입되었습니다');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('로그인되었습니다');
      }
      router.push('/board');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-1 items-center py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{mode === 'login' ? '로그인' : '회원가입'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            로그인하면 내 지원 현황이 저장됩니다. (로그인 없이도 데모로 둘러볼 수 있어요.)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-xs text-muted-foreground">이메일</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password" className="text-xs text-muted-foreground">비밀번호</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '처리 중…' : mode === 'login' ? '로그인' : '회원가입'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
            className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
