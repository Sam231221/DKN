import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function applyRegionColumnMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });

  console.log("🔄 Applying region column migration...");

  try {
    // Step 1: Add region column
    console.log("  Step 1: Adding 'region' column to regions table...");
    await sql`
      ALTER TABLE "regions" 
      ADD COLUMN IF NOT EXISTS "region" text;
    `;
    console.log("  ✓ Column added (or already exists)");

    // Step 2: Update existing rows to set region = name for backward compatibility
    console.log("  Step 2: Updating existing rows...");
    const result = await sql`
      UPDATE "regions" 
      SET "region" = "name" 
      WHERE "region" IS NULL;
    `;
    console.log(`  ✓ Updated ${result.count || 0} rows`);

    console.log("✅ Region column migration completed successfully");
  } catch (error: any) {
    console.error("❌ Error applying migration:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyRegionColumnMigration()
  .then(() => {
    console.log("\n🎉 Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
