import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function migrateHistoriesToJsonb() {
  try {
    console.log("🚀 Starting migration to JSONB...");

    // 1. Add new results column (jsonb)
    console.log("📝 Adding results column...");
    await sql`
      ALTER TABLE histories
      ADD COLUMN IF NOT EXISTS results jsonb
    `;
    console.log("✅ Results column added");

    // 2. Migrate data from applicant_ids to results
    console.log("📝 Migrating data from applicant_ids to results...");
    await sql`
      UPDATE histories
      SET results = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'applicantId', unnest,
            'similarity', 0,
            'createdAt', created_at
          )
        )
        FROM unnest(applicant_ids)
      )
      WHERE results IS NULL
    `;
    console.log("✅ Data migrated");

    // 3. Make results NOT NULL
    console.log("📝 Setting results as NOT NULL...");
    await sql`
      ALTER TABLE histories
      ALTER COLUMN results SET NOT NULL
    `;
    console.log("✅ Results column set to NOT NULL");

    // 4. Drop old applicant_ids column
    console.log("📝 Dropping applicant_ids column...");
    await sql`
      ALTER TABLE histories
      DROP COLUMN IF EXISTS applicant_ids
    `;
    console.log("✅ applicant_ids column dropped");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateHistoriesToJsonb();
