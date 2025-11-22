import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function createHistoriesTable() {
  try {
    console.log("🚀 Creating histories table...");

    // Create histories table
    await sql`
      CREATE TABLE IF NOT EXISTS histories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        recruiter_wallet_address text NOT NULL,
        query text NOT NULL,
        applicant_ids text[] NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ Histories table created");

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS histories_recruiter_wallet_address_idx
      ON histories USING btree (recruiter_wallet_address)
    `;
    console.log("✅ Index on recruiter_wallet_address created");

    await sql`
      CREATE INDEX IF NOT EXISTS histories_created_at_idx
      ON histories USING btree (created_at)
    `;
    console.log("✅ Index on created_at created");

    console.log("🎉 All done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createHistoriesTable();
