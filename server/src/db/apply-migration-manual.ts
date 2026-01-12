import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function applyMigrationManually() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });

  console.log("🔄 Applying migration 0005 manually...");

  const migrationSQL = `
    -- Rename project_id to originating_project_id in knowledge_assets
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_assets' AND column_name = 'project_id'
      ) THEN
        ALTER TABLE "knowledge_assets" RENAME COLUMN "project_id" TO "originating_project_id";
      END IF;
    END $$;

    -- Drop old constraint if it exists
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_assets_project_id_projects_id_fk'
      ) THEN
        ALTER TABLE "knowledge_assets" DROP CONSTRAINT "knowledge_assets_project_id_projects_id_fk";
      END IF;
    END $$;

    -- Add originating_project_id to knowledge_items if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_items' AND column_name = 'originating_project_id'
      ) THEN
        ALTER TABLE "knowledge_items" ADD COLUMN "originating_project_id" text;
      END IF;
    END $$;

    -- Add access_level to knowledge_items if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_items' AND column_name = 'access_level'
      ) THEN
        ALTER TABLE "knowledge_items" ADD COLUMN "access_level" "access_level" DEFAULT 'internal' NOT NULL;
      END IF;
    END $$;

    -- Add lifecycle_status to knowledge_items if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_items' AND column_name = 'lifecycle_status'
      ) THEN
        ALTER TABLE "knowledge_items" ADD COLUMN "lifecycle_status" text DEFAULT 'draft';
      END IF;
    END $$;

    -- Add project_code to projects if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'project_code'
      ) THEN
        ALTER TABLE "projects" ADD COLUMN "project_code" text;
      END IF;
    END $$;

    -- Add domain to projects if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'domain'
      ) THEN
        ALTER TABLE "projects" ADD COLUMN "domain" text;
      END IF;
    END $$;

    -- Add lead_consultant_id to projects if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'lead_consultant_id'
      ) THEN
        ALTER TABLE "projects" ADD COLUMN "lead_consultant_id" text;
      END IF;
    END $$;

    -- Add client_satisfaction_score to projects if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'client_satisfaction_score'
      ) THEN
        ALTER TABLE "projects" ADD COLUMN "client_satisfaction_score" integer;
      END IF;
    END $$;

    -- Add repository_code to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'repository_code'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "repository_code" text;
      END IF;
    END $$;

    -- Add storage_location to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'storage_location'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "storage_location" text;
      END IF;
    END $$;

    -- Add encryption_enabled to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'encryption_enabled'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "encryption_enabled" boolean DEFAULT true;
      END IF;
    END $$;

    -- Add retention_policy to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'retention_policy'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "retention_policy" text;
      END IF;
    END $$;

    -- Add search_index_status to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'search_index_status'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "search_index_status" text DEFAULT 'active';
      END IF;
    END $$;

    -- Add is_public to repositories if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'is_public'
      ) THEN
        ALTER TABLE "repositories" ADD COLUMN "is_public" boolean DEFAULT false;
      END IF;
    END $$;

    -- Add foreign key constraints if they don't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_assets_originating_project_id_projects_id_fk'
      ) THEN
        ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_originating_project_id_projects_id_fk" 
        FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
      END IF;
    END $$;

    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'knowledge_items_originating_project_id_projects_id_fk'
      ) THEN
        ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_originating_project_id_projects_id_fk" 
        FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
      END IF;
    END $$;

    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_lead_consultant_id_users_id_fk'
      ) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_consultant_id_users_id_fk" 
        FOREIGN KEY ("lead_consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
      END IF;
    END $$;

    -- Add unique constraints if they don't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_project_code_unique'
      ) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_project_code_unique" UNIQUE("project_code");
      END IF;
    END $$;

    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'repositories_repository_code_unique'
      ) THEN
        ALTER TABLE "repositories" ADD CONSTRAINT "repositories_repository_code_unique" UNIQUE("repository_code");
      END IF;
    END $$;
  `;

  try {
    await sql.unsafe(migrationSQL);
    console.log("✅ Migration applied successfully");
  } catch (error: any) {
    console.error("❌ Error applying migration:", error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

applyMigrationManually().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

