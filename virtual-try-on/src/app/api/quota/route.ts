import { NextResponse } from 'next/server';
import { getQuota } from '@/services/quota.service';

export async function GET() {
  const quota = await getQuota();
  return NextResponse.json(quota);
}
