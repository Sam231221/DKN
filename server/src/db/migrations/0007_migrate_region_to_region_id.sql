-- Migration: Convert users.region from text to region_id foreign key
-- This migration:
-- 1. Adds a new region_id column
-- 2. Migrates existing region text values to region_id by matching region names
-- 3. Drops the old region column
-- 4. Adds foreign key constraint

--> statement-breakpoint
-- Step 1: Add new region_id column (nullable initially)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "region_id" text;

--> statement-breakpoint
-- Step 2: Migrate existing region text values to region_id
-- Match users.region (text) with regions.name and populate region_id
UPDATE "users" u
SET "region_id" = r.id
FROM "regions" r
WHERE u.region = r.name
  AND u.region IS NOT NULL
  AND u.region_id IS NULL;

--> statement-breakpoint
-- Step 3: Drop the old region text column
ALTER TABLE "users" DROP COLUMN IF EXISTS "region";

--> statement-breakpoint
-- Step 4: Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_region_id_regions_id_fk'
  ) THEN
    ALTER TABLE "users" 
    ADD CONSTRAINT "users_region_id_regions_id_fk" 
    FOREIGN KEY ("region_id") 
    REFERENCES "regions"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;
  END IF;
END $$;

--> statement-breakpoint
-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS "users_region_id_idx" ON "users"("region_id");
