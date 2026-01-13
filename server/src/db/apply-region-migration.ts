import postgres from "postgres";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

async function applyRegionMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("🔄 Applying migration 0007: Convert region to region_id...");

    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "src/db/migrations/0007_migrate_region_to_region_id.sql"
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
        console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
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
          console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 60)}...`);
          continue;
        }
        // For column operations, check if column already exists/doesn't exist
        if (
          (statement.includes("ADD COLUMN") && error.code === "42701") ||
          (statement.includes("DROP COLUMN") && error.code === "42703")
        ) {
          console.log(`⏭️  Skipped (column state): ${statement.substring(0, 60)}...`);
          continue;
        }
        // For constraint operations
        if (
          (statement.includes("ADD CONSTRAINT") && error.code === "42710") ||
          (statement.includes("CREATE INDEX") && error.code === "42P07")
        ) {
          console.log(`⏭️  Skipped (constraint/index already exists): ${statement.substring(0, 60)}...`);
          continue;
        }
        // Re-throw other errors
        throw error;
      }
    }

    console.log("✅ Migration 0007 applied successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyRegionMigration().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
