import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const histories = pgTable(
  "histories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterWalletAddress: text("recruiter_wallet_address").notNull(),
    query: text("query").notNull(),
    applicantIds: text("applicant_ids").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    recruiterWalletAddressIdx: index("histories_recruiter_wallet_address_idx").on(
      table.recruiterWalletAddress
    ),
    createdAtIdx: index("histories_created_at_idx").on(table.createdAt),
  })
);

// Drizzle에서 타입 자동 유추
export type History = typeof histories.$inferSelect;
export type NewHistory = typeof histories.$inferInsert;
