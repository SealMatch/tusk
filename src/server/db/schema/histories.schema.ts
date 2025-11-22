import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { SearchResultItem } from "@/server/domains/histories/history.type";

export const histories = pgTable(
  "histories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterWalletAddress: text("recruiter_wallet_address").notNull(),
    query: text("query").notNull(),
    results: jsonb("results").notNull().$type<SearchResultItem[]>(),
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
