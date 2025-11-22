import { db } from "@/server/db";
import { applicants } from "@/server/db/schema/applicants.schema";
import { desc } from "drizzle-orm";

async function verifyLatestApplicant() {
  console.log("🔍 Fetching latest applicant from database...\n");

  const [latest] = await db
    .select({
      id: applicants.id,
      handle: applicants.handle,
      position: applicants.position,
      techStack: applicants.techStack,
      embeddingDims: applicants.embedding,
    })
    .from(applicants)
    .orderBy(desc(applicants.createdAt))
    .limit(1);

  if (latest) {
    console.log("✅ Latest applicant found:");
    console.log(`   ID: ${latest.id}`);
    console.log(`   Handle: ${latest.handle}`);
    console.log(`   Position: ${latest.position}`);
    console.log(`   Tech Stack: ${latest.techStack?.join(", ") ?? "N/A"}`);
    console.log(
      `   Embedding dimensions: ${Array.isArray(latest.embeddingDims) ? latest.embeddingDims.length : "N/A"}`
    );
  } else {
    console.log("❌ No applicants found in database");
  }
}

verifyLatestApplicant()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
