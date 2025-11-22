import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });

async function migrate() {
  try {
    console.log("🚀 Starting migration...");

    // pgvector extension 활성화
    console.log("📦 Enabling pgvector extension...");
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    console.log("✅ pgvector extension enabled");

    // 마이그레이션 SQL 파일 읽기
    const migrationPath = join(
      process.cwd(),
      "src/server/db/drizzle/migrations/0002_tired_steve_rogers.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // SQL 문을 개별 statement로 분리
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📝 Executing ${statements.length} statements...`);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
