import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema/*.schema.ts",
  out: "./src/server/db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
