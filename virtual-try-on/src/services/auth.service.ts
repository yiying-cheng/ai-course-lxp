import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tryOnRecords, users } from '@/db/schema';
import {
  hashPassword,
  validateEmail,
  validatePassword,
  verifyPassword,
} from '@/lib/password';
import { getSession } from '@/lib/session';

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const passwordError = validatePassword(input.password);
  if (passwordError) throw new Error(passwordError);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name: input.name?.trim() || null,
    })
    .returning();

  return { id: user.id, email: user.email, name: user.name };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new Error('Invalid email or password.');
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function saveTryOnRecord(input: {
  category: string;
  garmentImageUrl: string;
  resultImageUrl: string;
}) {
  const session = await getSession();
  if (!session) return;

  await db.insert(tryOnRecords).values({
    userId: session.userId,
    visitorId: null,
    category: input.category,
    garmentImageUrl: input.garmentImageUrl,
    resultImageUrl: input.resultImageUrl,
  });
}

export async function listTryOnHistory() {
  const session = await getSession();
  if (!session) return [];

  return db
    .select()
    .from(tryOnRecords)
    .where(eq(tryOnRecords.userId, session.userId))
    .orderBy(desc(tryOnRecords.createdAt))
    .limit(50);
}
