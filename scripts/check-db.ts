/**
 * Supabase 연결/데이터 헬스체크 (anon 키 기준 — 앱과 동일 경로)
 * 실행: npx tsx scripts/check-db.ts
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('❌ .env.local 에 URL/ANON_KEY 가 없습니다.');
    process.exit(1);
  }
  console.log('🔗 URL:', url);

  const supabase = createClient(url, key);

  // 1) 총 건수 (anon 조회 가능 = RLS off 확인)
  const { count, error: countErr } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error('❌ 조회 실패:', countErr.message);
    console.error('   → RLS가 켜져 있거나 테이블이 없을 수 있습니다.');
    process.exit(1);
  }
  console.log(`✅ applications 총 ${count}건`);

  // 2) 단계 분포
  const { data, error } = await supabase
    .from('applications')
    .select('stage, result');
  if (error) {
    console.error('❌ 상세 조회 실패:', error.message);
    process.exit(1);
  }
  const byStage: Record<string, number> = {};
  const byResult: Record<string, number> = {};
  for (const r of data ?? []) {
    byStage[r.stage] = (byStage[r.stage] ?? 0) + 1;
    byResult[r.result] = (byResult[r.result] ?? 0) + 1;
  }
  console.log('📈 stage 분포:', byStage);
  console.log('📊 result 분포:', byResult);

  // 3) 샘플 3건
  const { data: sample } = await supabase
    .from('applications')
    .select('platform, company_name, stage, round, result')
    .limit(3);
  console.log('🔎 샘플:', sample);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
