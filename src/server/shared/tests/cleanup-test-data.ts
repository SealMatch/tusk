import { db } from "@/server/db";
import { applicants } from "@/server/db/schema/applicants.schema";
import { eq } from "drizzle-orm";

async function cleanupTestData() {
  console.log("🧹 Cleaning up test data...\n");

  const testWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";

  try {
    await db
      .delete(applicants)
      .where(eq(applicants.walletAddress, testWalletAddress));

    console.log("✅ Test data cleaned up successfully");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    process.exit(1);
  }

  process.exit(0);
}

cleanupTestData();
