import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { applicants } from "./applicants.schema";

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterWalletAddress: text("recruiter_wallet_address").notNull(),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => applicants.id, { onDelete: "cascade" }),
    viewRequestId: text("view_request_id"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    recruiterWalletAddressIdx: index("matches_recruiter_wallet_address_idx").on(
      table.recruiterWalletAddress
    ),
    applicantIdIdx: index("matches_applicant_id_idx").on(table.applicantId),
    statusIdx: index("matches_status_idx").on(table.status),
  })
);

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
