import postgres from "postgres";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

async function applyMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("🔄 Applying migration 0001...");

    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "src/db/migrations/0001_opposite_scrambler.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        // Skip errors for things that already exist
        if (
          error.code === "42710" || // duplicate object (type, table, etc.)
          error.code === "42P07" || // duplicate table
          error.code === "42704" || // undefined object (already exists check)
          error.code === "42723" || // function already exists
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate")
        ) {
          console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 50)}...`);
          continue;
        }
        // For column addition, check if column already exists
        if (statement.includes("ADD COLUMN") && error.code === "42701") {
          console.log(`⏭️  Skipped (column already exists): ${statement.substring(0, 50)}...`);
          continue;
        }
        // Re-throw other errors
        throw error;
      }
    }

    console.log("✅ Migration 0001 applied successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyMigration().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

