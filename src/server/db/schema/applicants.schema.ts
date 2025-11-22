import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// pgvector 타입 정의
const vector = customType<{
  data: number[];
  driverData: string;
  config: { length?: number };
}>({
  dataType(config) {
    return `vector(${config?.length ?? 768})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

export const applicants = pgTable(
  "applicants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    handle: text("handle").notNull(),
    walletAddress: text("wallet_address").notNull().unique(),

    // Walrus/Seal 관련
    blobId: text("blob_id").default(""),
    sealPolicyId: text("seal_policy_id").default(""),
    encryptionId: text("encryption_id").default(""),

    // 공개 정보
    position: text("position"),
    techStack: text("tech_stack").array(), // text[]
    introduction: text("introduction"),
    aiSummary: text("ai_summary"),

    // 접근 제어
    accessPrice: integer("access_price").default(0),
    accessList: jsonb("access_list").default({}), // Record<string, boolean>

    isJobSeeking: boolean("is_job_seeking").default(true),
    // 벡터 임베딩 (Gemini embedding-001: 768차원)
    embedding: vector("embedding", { length: 768 }),

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
