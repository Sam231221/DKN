import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function applyRepositoriesColumns() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });

  console.log("🔄 Applying missing columns to repositories table...");

  try {
    // Check which columns exist
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repositories' AND table_schema = 'public'
    `;
    const existingColumnNames = existingColumns.map((row: any) => row.column_name);

    // Define columns to add
    const columnsToAdd = [
      { name: "repository_code", sql: 'ALTER TABLE "repositories" ADD COLUMN "repository_code" text;' },
      { name: "storage_location", sql: 'ALTER TABLE "repositories" ADD COLUMN "storage_location" text;' },
      { name: "encryption_enabled", sql: 'ALTER TABLE "repositories" ADD COLUMN "encryption_enabled" boolean DEFAULT true;' },
      { name: "retention_policy", sql: 'ALTER TABLE "repositories" ADD COLUMN "retention_policy" text;' },
      { name: "search_index_status", sql: 'ALTER TABLE "repositories" ADD COLUMN "search_index_status" text DEFAULT \'active\';' },
      { name: "is_public", sql: 'ALTER TABLE "repositories" ADD COLUMN "is_public" boolean DEFAULT false;' },
    ];

    for (const column of columnsToAdd) {
      if (existingColumnNames.includes(column.name)) {
        console.log(`ℹ️  Column already exists: ${column.name}`);
      } else {
        try {
          await sql.unsafe(column.sql);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error: any) {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
          throw error;
        }
      }
    }

    // Check if unique constraint exists and add it if it doesn't
    const existingConstraints = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'repositories' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'repositories_repository_code_unique'
    `;

    if (existingConstraints.length === 0) {
      try {
        await sql.unsafe('ALTER TABLE "repositories" ADD CONSTRAINT "repositories_repository_code_unique" UNIQUE("repository_code");');
        console.log("✅ Added unique constraint on repository_code");
      } catch (error: any) {
        if (error?.code === "42710") {
          console.log("ℹ️  Unique constraint already exists");
        } else {
          console.error("❌ Error adding unique constraint:", error.message);
        }
      }
    } else {
      console.log("ℹ️  Unique constraint already exists");
    }

    console.log("✅ Repository columns applied successfully");
  } catch (error: any) {
    console.error("❌ Failed to apply columns:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyRepositoriesColumns().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
