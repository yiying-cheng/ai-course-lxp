import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    const result = await db.execute(sql`select 1 as ok`);
    const row = result.rows[0] as { ok: number } | undefined;

    return NextResponse.json({
      ok: row?.ok === 1,
      provider: 'neon',
      projectId: process.env.NEON_PROJECT_ID ?? 'purple-field-07835895',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database check failed';
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
