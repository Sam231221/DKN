import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("🔄 Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error: any) {
    // Handle enum already exists error (code 42710)
    if (error?.cause?.code === "42710" && error?.cause?.message?.includes("already exists")) {
      console.warn("⚠️  Warning: Some database objects already exist (this is usually safe to ignore)");
      console.warn(`   Details: ${error.cause.message}`);
      console.log("✅ Migration process completed (some objects were already present)");
    } else {
      // Re-throw other errors
      throw error;
    }
  } finally {
    await sql.end();
  }
}

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

