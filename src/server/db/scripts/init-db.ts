import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = postgres(connectionString, { max: 1 });

async function initDatabase() {
    try {
        console.log("🚀 Starting database initialization...\n");

        // pgvector extension 활성화
        console.log("📦 Enabling pgvector extension...");
        await sql`CREATE EXTENSION IF NOT EXISTS vector`;
        console.log("✅ pgvector extension enabled\n");

        console.log("✨ Database initialization completed!");
        console.log("\n📝 Next steps:");
        console.log("  1. Run 'npm run db:push' to sync schema to database");
        console.log("  2. Or run 'npm run db:generate' and 'npm run db:migrate' for migration-based approach");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

initDatabase();
