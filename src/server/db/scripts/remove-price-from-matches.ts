import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function removePriceFromMatches() {
  try {
    console.log("🚀 Removing price column from matches table...");

    // Drop price column
    await sql`
      ALTER TABLE matches
      DROP COLUMN IF EXISTS price
    `;
    console.log("✅ Price column removed");

    console.log("🎉 Migration completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

removePriceFromMatches();
