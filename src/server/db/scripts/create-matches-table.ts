import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function createMatchesTable() {
  try {
    console.log("🚀 Creating matches table...");

    // Create matches table
    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        recruiter_wallet_address text NOT NULL,
        applicant_id uuid NOT NULL REFERENCES applicants(id),
        price integer NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ Matches table created");

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS matches_recruiter_wallet_address_idx
      ON matches USING btree (recruiter_wallet_address)
    `;
    console.log("✅ Index on recruiter_wallet_address created");

    await sql`
      CREATE INDEX IF NOT EXISTS matches_applicant_id_idx
      ON matches USING btree (applicant_id)
    `;
    console.log("✅ Index on applicant_id created");

    await sql`
      CREATE INDEX IF NOT EXISTS matches_status_idx
      ON matches USING btree (status)
    `;
    console.log("✅ Index on status created");

    console.log("🎉 All done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createMatchesTable();
