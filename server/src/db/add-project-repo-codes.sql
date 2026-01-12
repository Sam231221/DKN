-- Add project_code column to projects table if it doesn't exist
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

-- Add repository_code column to repositories table if it doesn't exist
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
