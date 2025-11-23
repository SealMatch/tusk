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

    // 실행할 마이그레이션 파일 목록 (0003~0007)
    const migrationFiles = [
      "0003_famous_celestials.sql",
      "0004_lean_captain_cross.sql",
      "0005_absent_miss_america.sql",
      "0006_red_morgan_stark.sql",
      "0007_unique_morg.sql",
    ];

    for (const fileName of migrationFiles) {
      console.log(`📝 Executing ${fileName}...`);

      const migrationPath = join(
        process.cwd(),
        "src/server/db/drizzle/migrations",
        fileName
      );
      const migrationSQL = readFileSync(migrationPath, "utf-8");

      // SQL 문을 개별 statement로 분리
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await sql.unsafe(statement);
      }

      console.log(`✅ ${fileName} completed`);
    }

    console.log("✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
