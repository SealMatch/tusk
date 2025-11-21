import { pgTable } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {});

// Drizzle에서 타입 자동 유추
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
