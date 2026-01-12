import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function applyInvitationsMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("🚀 Applying invitations table migration (0004)...");

    // Read the migration file
    const migrationPath = path.join(process.cwd(), "src/db/migrations/0004_elite_green_goblin.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split by statement breakpoint
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        if (statement.trim()) {
          await sql.unsafe(statement);
          console.log(`✓ Executed statement`);
        }
      } catch (error: any) {
        // Ignore errors for objects that already exist
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate") ||
          error.code === "42P07" || // duplicate_table
          error.code === "42710" || // duplicate_object
          error.code === "23505" || // unique_violation
          error.severity === "NOTICE"
        ) {
          console.log(`⏭️  Skipped (already exists)`);
        } else {
          console.error(`❌ Error executing statement:`);
          console.error(error.message);
          throw error;
        }
      }
    }

    // Mark migration as applied in drizzle_migrations table
    try {
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0004_elite_green_goblin', NOW())
        ON CONFLICT DO NOTHING
      `;
      console.log("✓ Migration marked as applied");
    } catch (error: any) {
      // Table might not exist or already marked
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        console.log("⚠️  Could not mark migration (drizzle_migrations table not found)");
      } else {
        console.log("⚠️  Could not mark migration (may already be marked)");
      }
    }

    console.log("✅ Invitations table migration applied successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

applyInvitationsMigration()
  .then(() => {
    console.log("🎉 Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
