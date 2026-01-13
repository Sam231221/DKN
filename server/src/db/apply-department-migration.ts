import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function applyDepartmentMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });

  console.log("🔄 Applying department column migration...");

  try {
    // Add department column
    console.log("  Step 1: Adding 'department' column to users table...");
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "department" text;
    `;
    console.log("  ✓ Column added (or already exists)");

    console.log("✅ Department column migration completed successfully");
  } catch (error: any) {
    console.error("❌ Error applying migration:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyDepartmentMigration()
  .then(() => {
    console.log("\n🎉 Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
