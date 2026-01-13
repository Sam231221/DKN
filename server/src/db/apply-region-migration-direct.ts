import postgres from "postgres";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

async function applyRegionMigrationDirect() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("🔄 Applying region migration directly...");

    // Check if region_id column already exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'region_id'
    `;

    if (checkResult.length > 0) {
      console.log("  ✓ region_id column already exists");
    } else {
      console.log("  📝 Adding region_id column...");
      await sql`ALTER TABLE "users" ADD COLUMN "region_id" text;`;
      console.log("  ✓ Added region_id column");
    }

    // Check if region column exists
    const regionCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'region'
    `;

    if (regionCheck.length > 0) {
      console.log("  📝 Migrating data from region to region_id...");
      await sql`
        UPDATE "users" u
        SET "region_id" = r.id
        FROM "regions" r
        WHERE u.region = r.name
          AND u.region IS NOT NULL
          AND u.region_id IS NULL
      `;
      console.log("  ✓ Migrated region data");

      console.log("  📝 Dropping region column...");
      await sql`ALTER TABLE "users" DROP COLUMN "region";`;
      console.log("  ✓ Dropped region column");
    } else {
      console.log("  ✓ region column already removed");
    }

    // Add foreign key constraint
    const fkCheck = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
        AND constraint_name = 'users_region_id_regions_id_fk'
    `;

    if (fkCheck.length === 0) {
      console.log("  📝 Adding foreign key constraint...");
      await sql`
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_region_id_regions_id_fk" 
        FOREIGN KEY ("region_id") 
        REFERENCES "regions"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `;
      console.log("  ✓ Added foreign key constraint");
    } else {
      console.log("  ✓ Foreign key constraint already exists");
    }

    // Create index
    const indexCheck = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'users_region_id_idx'
    `;

    if (indexCheck.length === 0) {
      console.log("  📝 Creating index...");
      await sql`CREATE INDEX "users_region_id_idx" ON "users"("region_id");`;
      console.log("  ✓ Created index");
    } else {
      console.log("  ✓ Index already exists");
    }

    console.log("✅ Migration applied successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyRegionMigrationDirect()
  .then(() => {
    console.log("🎉 Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
