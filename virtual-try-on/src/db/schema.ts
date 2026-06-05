import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const personas = pgTable('personas', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitorId: text('visitor_id'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  imageDataUrl: text('image_data_url').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tryOnRecords = pgTable('try_on_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitorId: text('visitor_id'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  garmentImageUrl: text('garment_image_url').notNull(),
  resultImageUrl: text('result_image_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const monthlyUsage = pgTable(
  'monthly_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    visitorId: text('visitor_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    monthKey: text('month_key').notNull(),
    count: integer('count').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('monthly_usage_visitor_month_idx').on(table.visitorId, table.monthKey),
    uniqueIndex('monthly_usage_user_month_idx').on(table.userId, table.monthKey),
  ],
);

export type User = typeof users.$inferSelect;
export type Persona = typeof personas.$inferSelect;
export type TryOnRecord = typeof tryOnRecords.$inferSelect;
export type MonthlyUsage = typeof monthlyUsage.$inferSelect;
