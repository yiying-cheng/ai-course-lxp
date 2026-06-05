import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { monthlyUsage } from '@/db/schema';
import { getOrCreateVisitorId, getSession } from '@/lib/session';

export const GUEST_LIFETIME_LIMIT = 1;
export const REGISTERED_MONTHLY_LIMIT = 5;

export interface QuotaSnapshot {
  limit: number;
  used: number;
  remaining: number;
  isRegistered: boolean;
  period: 'lifetime' | 'monthly';
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
}

const GUEST_MONTH_KEY = 'guest-lifetime';

async function getUsageCount(params: {
  userId?: string;
  visitorId?: string;
  monthKey: string;
}) {
  if (params.userId) {
    const row = await db.query.monthlyUsage.findFirst({
      where: and(
        eq(monthlyUsage.userId, params.userId),
        eq(monthlyUsage.monthKey, params.monthKey),
      ),
    });
    return row?.count ?? 0;
  }

  if (params.visitorId) {
    const row = await db.query.monthlyUsage.findFirst({
      where: and(
        eq(monthlyUsage.visitorId, params.visitorId),
        eq(monthlyUsage.monthKey, params.monthKey),
      ),
    });
    return row?.count ?? 0;
  }

  return 0;
}

async function incrementUsage(params: {
  userId?: string;
  visitorId?: string;
  monthKey: string;
}) {
  const existing = params.userId
    ? await db.query.monthlyUsage.findFirst({
        where: and(
          eq(monthlyUsage.userId, params.userId),
          eq(monthlyUsage.monthKey, params.monthKey),
        ),
      })
    : await db.query.monthlyUsage.findFirst({
        where: and(
          eq(monthlyUsage.visitorId, params.visitorId!),
          eq(monthlyUsage.monthKey, params.monthKey),
        ),
      });

  if (existing) {
    const [updated] = await db
      .update(monthlyUsage)
      .set({ count: existing.count + 1, updatedAt: new Date() })
      .where(eq(monthlyUsage.id, existing.id))
      .returning();
    return updated.count;
  }

  const [inserted] = await db
    .insert(monthlyUsage)
    .values({
      userId: params.userId ?? null,
      visitorId: params.userId ? null : params.visitorId,
      monthKey: params.monthKey,
      count: 1,
    })
    .returning();
  return inserted.count;
}

export async function getQuota(): Promise<QuotaSnapshot> {
  const session = await getSession();

  if (session) {
    const monthKey = currentMonthKey();
    const used = await getUsageCount({ userId: session.userId, monthKey });
    const limit = REGISTERED_MONTHLY_LIMIT;
    return {
      limit,
      used,
      remaining: Math.max(0, limit - used),
      isRegistered: true,
      period: 'monthly',
    };
  }

  const visitorId = await getOrCreateVisitorId();
  const used = await getUsageCount({ visitorId, monthKey: GUEST_MONTH_KEY });
  const limit = GUEST_LIFETIME_LIMIT;
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    isRegistered: false,
    period: 'lifetime',
  };
}

export async function consumeQuota(): Promise<QuotaSnapshot | null> {
  const snapshot = await getQuota();
  if (snapshot.remaining <= 0) return null;

  const session = await getSession();
  if (session) {
    const used = await incrementUsage({
      userId: session.userId,
      monthKey: currentMonthKey(),
    });
    return {
      ...snapshot,
      used,
      remaining: Math.max(0, snapshot.limit - used),
    };
  }

  const visitorId = await getOrCreateVisitorId();
  const used = await incrementUsage({
    visitorId,
    monthKey: GUEST_MONTH_KEY,
  });
  return {
    ...snapshot,
    used,
    remaining: Math.max(0, snapshot.limit - used),
  };
}
