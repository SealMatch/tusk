import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function getApplicantWallet() {
  try {
    const applicantId = "f99db28d-81fa-4eaf-b054-a6a7dfecf169";

    const result = await sql`
      SELECT wallet_address, handle
      FROM applicants
      WHERE id = ${applicantId}
    `;

    if (result.length > 0) {
      console.log("Wallet Address:", result[0].wallet_address);
      console.log("Handle:", result[0].handle);
    } else {
      console.log("Applicant not found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sql.end();
  }
}

getApplicantWallet();
