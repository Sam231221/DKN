-- Migration: Add region column to regions table
-- This migration adds a new 'region' column to store region names separately from branch names
-- The 'name' column will represent branch names (e.g., "London Office")
-- The 'region' column will represent region names (e.g., "Europe")

--> statement-breakpoint
-- Add region column (nullable to allow existing data)
ALTER TABLE "regions" ADD COLUMN IF NOT EXISTS "region" text;

--> statement-breakpoint
-- For existing data, set region to name as fallback (if region is null)
-- This ensures backward compatibility
UPDATE "regions" 
SET "region" = "name" 
WHERE "region" IS NULL;
