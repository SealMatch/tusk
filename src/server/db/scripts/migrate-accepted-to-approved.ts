import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

/**
 * Migrate match status from 'accepted' to 'approved'
 *
 * Background:
 * - Old MatchStatus: "pending" | "accepted" | "rejected" | "approved"
 * - New MatchStatus: "pending" | "approved" | "rejected"
 * - Need to migrate 'accepted' -> 'approved'
 */
async function migrateAcceptedToApproved() {
  try {
    console.log("=".repeat(80));
    console.log("  Migrating Match Status: 'accepted' -> 'approved'");
    console.log("=".repeat(80) + "\n");

    // 1. Check current data
    console.log("1️⃣ Checking current data...\n");

    const currentData = await sql`
      SELECT status, COUNT(*) as count
      FROM matches
      GROUP BY status
      ORDER BY status
    `;

    console.log("Current status distribution:");
    currentData.forEach((row) => {
      console.log(`   - ${row.status}: ${row.count} records`);
    });

    const acceptedCount = currentData.find((row) => row.status === "accepted");

    if (!acceptedCount || acceptedCount.count === 0) {
      console.log("\n✅ No 'accepted' status found. Nothing to migrate.");
      return;
    }

    console.log(`\n🔄 Found ${acceptedCount.count} records with 'accepted' status`);

    // 2. Perform migration
    console.log("\n2️⃣ Migrating 'accepted' to 'approved'...\n");

    const result = await sql`
      UPDATE matches
      SET status = 'approved', updated_at = NOW()
      WHERE status = 'accepted'
      RETURNING id, recruiter_wallet_address, applicant_id, status
    `;

    console.log(`✅ Successfully updated ${result.count} records\n`);

    if (result.length > 0 && result.length <= 10) {
      console.log("Updated records:");
      result.forEach((record, index) => {
        console.log(`   ${index + 1}. Match ID: ${record.id}`);
        console.log(`      Recruiter: ${record.recruiter_wallet_address}`);
        console.log(`      Applicant: ${record.applicant_id}`);
        console.log(`      Status: ${record.status}\n`);
      });
    }

    // 3. Verify migration
    console.log("3️⃣ Verifying migration...\n");

    const verifyData = await sql`
      SELECT status, COUNT(*) as count
      FROM matches
      GROUP BY status
      ORDER BY status
    `;

    console.log("New status distribution:");
    verifyData.forEach((row) => {
      console.log(`   - ${row.status}: ${row.count} records`);
    });

    const stillAccepted = verifyData.find((row) => row.status === "accepted");

    if (stillAccepted && stillAccepted.count > 0) {
      console.log(`\n❌ Warning: ${stillAccepted.count} records still have 'accepted' status`);
    } else {
      console.log("\n✅ Verification successful: No 'accepted' status remaining");
    }

    console.log("\n" + "=".repeat(80));
    console.log("  Migration Complete");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n❌ Migration Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateAcceptedToApproved();
