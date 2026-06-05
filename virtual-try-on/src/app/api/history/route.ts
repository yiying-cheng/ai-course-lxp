import { NextResponse } from 'next/server';
import { listTryOnHistory } from '@/services/auth.service';

export async function GET() {
  const records = await listTryOnHistory();
  return NextResponse.json({ records });
}
