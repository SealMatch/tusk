import { pgTable } from "drizzle-orm/pg-core";

export const histories = pgTable("histories", {});

// Drizzle에서 타입 자동 유추
export type History = typeof histories.$inferSelect;
export type NewHistory = typeof histories.$inferInsert;
