import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const applicants = pgTable(
  "applicants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    walletAddress: text("wallet_address").notNull().unique(),

    // Walrus/Seal 관련
    publicBlobId: text("public_blob_id").default(""),
    privateBlobId: text("private_blob_id").default(""),
    sealPolicyId: text("seal_policy_id").default(""),
    pdfDataHash: text("pdf_data_hash").default(""),

    // 공개 정보
    position: text("position"),
    techStack: text("tech_stack").array(), // text[]
    introduction: text("introduction"),

    // 상세 정보 (JSON 타입)
    careerDetail: text("career_detail"),

    // 접근 제어
    accessPrice: integer("access_price").default(0),
    isJobSeeking: boolean("is_job_seeking").default(true),
    accessList: jsonb("access_list").default({}), // Record<string, boolean>

    // 벡터 임베딩 (Gemini embedding-001: 768차원)
    embedding: sql`vector(768)`,

    // 메타데이터
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    walletAddressIdx: index("applicants_wallet_address_idx").on(
      table.walletAddress
    ),
    isJobSeekingIdx: index("applicants_is_job_seeking_idx").on(
      table.isJobSeeking
    ),
  })
);

// Drizzle에서 타입 자동 유추
export type Applicant = typeof applicants.$inferSelect;
export type NewApplicant = typeof applicants.$inferInsert;
