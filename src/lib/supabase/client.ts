import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 개발 편의를 위한 명시적 경고. 값이 없으면 실제 쿼리 시점에 실패한다.
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env.local 을 확인하세요.',
  );
}

// MVP: 인증 없음. 브라우저 anon key 직결 단일 클라이언트.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
