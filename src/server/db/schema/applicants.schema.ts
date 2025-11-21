import { pgTable } from "drizzle-orm/pg-core";

export const applicants = pgTable("applicants", {});

// Drizzle에서 타입 자동 유추
export type Applicant = typeof applicants.$inferSelect;
export type NewApplicant = typeof applicants.$inferInsert;
