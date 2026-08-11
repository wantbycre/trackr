/**
 * seed/applications.csv → Supabase `applications` 임포트 스크립트
 *
 * 실행:
 *   npx tsx scripts/import.ts                 # seed/applications.csv 임포트
 *   npx tsx scripts/import.ts --dry-run       # 파싱 결과만 미리보기(insert 안 함)
 *   npx tsx scripts/import.ts path/to.csv     # 다른 CSV 경로 지정
 *
 * 환경변수(.env.local): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   (RLS를 켠 경우엔 SUPABASE_SERVICE_ROLE_KEY 사용)
 */
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

// ---- enum 매핑 ---------------------------------------------------------
type Stage =
  | 'wishlist' | 'applied' | 'document' | 'coding_test'
  | 'interview' | 'final' | 'offer';
type Result = 'pending' | 'rejected' | 'accepted';

const STAGE_MAP: Record<string, Stage> = {
  관심: 'wishlist',
  지원: 'applied',
  서류: 'document',
  코테: 'coding_test',
  과제: 'coding_test',
  최종면접: 'final',
  오퍼: 'offer',
};
const RESULT_MAP: Record<string, Result> = {
  '': 'pending',
  진행중: 'pending',
  탈락: 'rejected',
  합격: 'accepted',
};

const warnings: string[] = [];

/** '2차면접' → { stage:'interview', round:2 }, '최종면접' → { stage:'final' } */
function parseStage(raw: string): { stage: Stage; round: number | null } {
  const label = (raw ?? '').trim();
  if (!label) return { stage: 'applied', round: null };

  const m = label.match(/^(\d+)차\s*면접$/);
  if (m) return { stage: 'interview', round: Number(m[1]) };

  const mapped = STAGE_MAP[label];
  if (mapped) return { stage: mapped, round: null };

  warnings.push(`알 수 없는 도달단계 "${label}" → applied 로 처리`);
  return { stage: 'applied', round: null };
}

function parseResult(raw: string): Result {
  const label = (raw ?? '').trim();
  const mapped = RESULT_MAP[label];
  if (mapped) return mapped;
  warnings.push(`알 수 없는 결과 "${label}" → pending 로 처리`);
  return 'pending';
}

/** 지원일이 날짜면 그대로, 아니면 null + 원문을 메모로 흡수하도록 반환 */
function parseAppliedAt(raw: string): { date: string | null; spillToNotes: string | null } {
  const v = (raw ?? '').trim();
  if (!v) return { date: null, spillToNotes: null };
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return { date: v, spillToNotes: null };
  return { date: null, spillToNotes: v };
}

// ---- CSV 읽기/변환 ------------------------------------------------------
interface Row {
  플랫폼?: string;
  회사이름?: string;
  직무?: string;
  도달단계?: string;
  결과?: string;
  지원일?: string;
  메모?: string;
}

interface AppInsert {
  platform: string;
  company_name: string;
  position: string;
  stage: Stage;
  round: number | null;
  result: Result;
  applied_at: string | null;
  notes: string | null;
  position_order: number;
}

function buildRecords(rows: Row[]): AppInsert[] {
  const orderByStage = new Map<Stage, number>();
  const records: AppInsert[] = [];

  rows.forEach((row, i) => {
    const platform = (row.플랫폼 ?? '').trim();
    const company = (row.회사이름 ?? '').trim();
    const position = (row.직무 ?? '').trim();

    if (!platform || !company || !position) {
      warnings.push(`${i + 2}행: 필수값 누락(플랫폼/회사이름/직무) → 건너뜀`);
      return;
    }

    const { stage, round } = parseStage(row.도달단계 ?? '');
    const nextOrder = (orderByStage.get(stage) ?? 0) + 1;
    orderByStage.set(stage, nextOrder);

    const { date, spillToNotes } = parseAppliedAt(row.지원일 ?? '');
    const memo = (row.메모 ?? '').trim();
    if (spillToNotes) {
      warnings.push(`${i + 2}행: 지원일 칸의 "${spillToNotes}" 를 메모로 이동`);
    }
    const notes = [spillToNotes, memo].filter(Boolean).join(' / ') || null;

    records.push({
      platform,
      company_name: company,
      position,
      stage,
      round,
      result: parseResult(row.결과 ?? ''),
      applied_at: date,
      notes,
      position_order: nextOrder * 1000,
    });
  });

  return records;
}

// ---- 메인 --------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const csvPath = resolve(
    args.find((a) => !a.startsWith('--')) ?? 'seed/applications.template.csv',
  );

  const raw = readFileSync(csvPath, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Row[];

  const records = buildRecords(rows);

  console.log(`📄 CSV: ${csvPath}`);
  console.log(`📊 파싱: ${rows.length}행 → 유효 ${records.length}건`);

  // 단계별 분포 요약
  const dist = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.stage] = (acc[r.stage] ?? 0) + 1;
    return acc;
  }, {});
  console.log('📈 단계 분포:', dist);

  if (warnings.length) {
    console.log(`⚠️  경고 ${warnings.length}건:`);
    warnings.slice(0, 20).forEach((w) => console.log('   -', w));
    if (warnings.length > 20) console.log(`   … 외 ${warnings.length - 20}건`);
  }

  if (dryRun) {
    console.log('\n🔍 --dry-run: 미리보기 3건');
    console.dir(records.slice(0, 3), { depth: null });
    console.log('\n(insert 하지 않고 종료)');
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 .env.local 에 없습니다.');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // 배치 insert (100건씩)
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from('applications').insert(batch);
    if (error) {
      console.error(`❌ ${i}~${i + batch.length} insert 실패:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`   ✓ ${inserted}/${records.length}`);
  }

  console.log(`✅ 완료: ${inserted}건 insert`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
