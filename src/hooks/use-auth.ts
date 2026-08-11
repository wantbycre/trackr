'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

/**
 * Supabase 세션 구독. 로그인 전에는 session=null → 데모 모드.
 * 7-b(인증)에서 로그인/회원가입이 붙으면 자동으로 live 모드로 전환된다.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading, isAuthenticated: !!session };
}

/** 데이터 모드: 로그인 → 'live'(내 데이터, 저장됨) / 비로그인 → 'demo'(비저장) */
export function useDataMode(): 'live' | 'demo' {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? 'live' : 'demo';
}
