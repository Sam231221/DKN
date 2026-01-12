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
    // Check if error is about existing enum types
    if (error?.cause?.code === "42710" && error?.cause?.message?.includes("already exists")) {
      console.warn("⚠️  Warning: Some database objects already exist. This is usually safe to ignore.");
      console.warn("   Error details:", error.cause.message);
      console.log("✅ Continuing with migration...");
    } else {
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

