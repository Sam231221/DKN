import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function addMissingColumns() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("🔄 Adding missing columns...");

    // Add project_code column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'project_code'
        ) THEN
          ALTER TABLE "projects" ADD COLUMN "project_code" text;
          CREATE UNIQUE INDEX IF NOT EXISTS "projects_project_code_unique" ON "projects"("project_code");
        END IF;
      END $$;
    `;
    console.log("  ✓ Added project_code column to projects table");

    // Add repository_code column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'repositories' AND column_name = 'repository_code'
        ) THEN
          ALTER TABLE "repositories" ADD COLUMN "repository_code" text;
          CREATE UNIQUE INDEX IF NOT EXISTS "repositories_repository_code_unique" ON "repositories"("repository_code");
        END IF;
      END $$;
    `;
    console.log("  ✓ Added repository_code column to repositories table");

    // Add domain column to projects if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'domain'
        ) THEN
          ALTER TABLE "projects" ADD COLUMN "domain" text;
        END IF;
      END $$;
    `;
    console.log("  ✓ Added domain column to projects table");

    // Add lead_consultant_id column to projects if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'lead_consultant_id'
        ) THEN
          ALTER TABLE "projects" ADD COLUMN "lead_consultant_id" text;
        END IF;
      END $$;
    `;
    console.log("  ✓ Added lead_consultant_id column to projects table");

    // Add client_satisfaction_score column to projects if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'client_satisfaction_score'
        ) THEN
          ALTER TABLE "projects" ADD COLUMN "client_satisfaction_score" integer;
        END IF;
      END $$;
    `;
    console.log("  ✓ Added client_satisfaction_score column to projects table");

    // Add originating_project_id column to knowledge_items if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'knowledge_items' AND column_name = 'originating_project_id'
        ) THEN
          ALTER TABLE "knowledge_items" ADD COLUMN "originating_project_id" text;
        END IF;
      END $$;
    `;
    console.log("  ✓ Added originating_project_id column to knowledge_items table");

    // Add foreign key constraint for originating_project_id if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'knowledge_items_originating_project_id_projects_id_fk'
        ) THEN
          ALTER TABLE "knowledge_items" 
          ADD CONSTRAINT "knowledge_items_originating_project_id_projects_id_fk" 
          FOREIGN KEY ("originating_project_id") REFERENCES "projects"("id");
        END IF;
      END $$;
    `;
    console.log("  ✓ Added foreign key constraint for originating_project_id");

    // Add access_level column to knowledge_items if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'knowledge_items' AND column_name = 'access_level'
        ) THEN
          ALTER TABLE "knowledge_items" ADD COLUMN "access_level" access_level DEFAULT 'internal' NOT NULL;
        END IF;
      END $$;
    `;
    console.log("  ✓ Added access_level column to knowledge_items table");

    // Add lifecycle_status column to knowledge_items if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'knowledge_items' AND column_name = 'lifecycle_status'
        ) THEN
          ALTER TABLE "knowledge_items" ADD COLUMN "lifecycle_status" text DEFAULT 'draft';
        END IF;
      END $$;
    `;
    console.log("  ✓ Added lifecycle_status column to knowledge_items table");

    console.log("✅ Missing columns added successfully!");
  } catch (error) {
    console.error("❌ Error adding columns:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

addMissingColumns()
  .then(() => {
    console.log("🎉 Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
