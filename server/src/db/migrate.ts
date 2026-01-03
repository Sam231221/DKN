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
  
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  
  console.log("✅ Migrations completed successfully");
  
  await sql.end();
}

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

