import { db } from "@/server/db";
import { applicants } from "@/server/db/schema/applicants.schema";
import { matches } from "@/server/db/schema/matches.schema";
import { desc } from "drizzle-orm";

/**
 * Check and display test data in database
 * This script helps prepare data for testing the search result cards API
 */
async function checkTestData() {
  console.log("=".repeat(80));
  console.log("  Checking Test Data for /api/v1/search/result-cards");
  console.log("=".repeat(80) + "\n");

  try {
    // 1. Check applicants
    console.log("📋 Checking Applicants...");
    const applicantsList = await db
      .select({
        id: applicants.id,
        handle: applicants.handle,
        walletAddress: applicants.walletAddress,
        position: applicants.position,
      })
      .from(applicants)
      .orderBy(desc(applicants.createdAt))
      .limit(5);

    if (applicantsList.length === 0) {
      console.log("❌ No applicants found in database!");
      console.log("   Please create applicants first using POST /api/v1/applicants\n");
      return;
    }

    console.log(`✅ Found ${applicantsList.length} applicants:`);
    applicantsList.forEach((applicant, index) => {
      console.log(`   ${index + 1}. ID: ${applicant.id}`);
      console.log(`      Handle: ${applicant.handle}`);
      console.log(`      Position: ${applicant.position || "N/A"}`);
      console.log(`      Wallet: ${applicant.walletAddress}\n`);
    });

    // 2. Check matches
    console.log("📋 Checking Matches...");
    const matchesList = await db
      .select({
        id: matches.id,
        applicantId: matches.applicantId,
        recruiterWalletAddress: matches.recruiterWalletAddress,
        status: matches.status,
      })
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(5);

    if (matchesList.length === 0) {
      console.log("❌ No matches found in database!");
      console.log("   Please create matches first using POST /api/v1/match\n");
      return;
    }

    console.log(`✅ Found ${matchesList.length} matches:`);
    matchesList.forEach((match, index) => {
      console.log(`   ${index + 1}. ID: ${match.id}`);
      console.log(`      Applicant ID: ${match.applicantId}`);
      console.log(`      Recruiter: ${match.recruiterWalletAddress}`);
      console.log(`      Status: ${match.status}\n`);
    });

    // 3. Generate test data template
    console.log("=".repeat(80));
    console.log("  Test Data Template");
    console.log("=".repeat(80) + "\n");

    if (matchesList.length > 0) {
      const firstMatch = matchesList[0];
      const testTemplate = {
        query: "Test Search Query",
        recruiterWalletAddress: firstMatch.recruiterWalletAddress,
        results: [
          {
            applicantId: firstMatch.applicantId,
            similarity: 0.95,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      console.log("Use this test data for api-search-result-cards.test.ts:");
      console.log(JSON.stringify(testTemplate, null, 2));
      console.log("\n");
    }

    console.log("=".repeat(80));
    console.log("  Data Check Complete");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ Error checking test data:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
  }

  process.exit(0);
}

checkTestData();
