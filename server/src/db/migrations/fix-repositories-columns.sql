-- Fix missing columns in repositories table
-- Run this SQL script directly in your PostgreSQL database

-- Add repository_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'repository_code'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "repository_code" text;
        RAISE NOTICE 'Added column: repository_code';
    ELSE
        RAISE NOTICE 'Column already exists: repository_code';
    END IF;
END $$;

-- Add storage_location column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'storage_location'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "storage_location" text;
        RAISE NOTICE 'Added column: storage_location';
    ELSE
        RAISE NOTICE 'Column already exists: storage_location';
    END IF;
END $$;

-- Add encryption_enabled column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'encryption_enabled'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "encryption_enabled" boolean DEFAULT true;
        RAISE NOTICE 'Added column: encryption_enabled';
    ELSE
        RAISE NOTICE 'Column already exists: encryption_enabled';
    END IF;
END $$;

-- Add retention_policy column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'retention_policy'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "retention_policy" text;
        RAISE NOTICE 'Added column: retention_policy';
    ELSE
        RAISE NOTICE 'Column already exists: retention_policy';
    END IF;
END $$;

-- Add search_index_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'search_index_status'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "search_index_status" text DEFAULT 'active';
        RAISE NOTICE 'Added column: search_index_status';
    ELSE
        RAISE NOTICE 'Column already exists: search_index_status';
    END IF;
END $$;

-- Add is_public column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE "repositories" ADD COLUMN "is_public" boolean DEFAULT false;
        RAISE NOTICE 'Added column: is_public';
    ELSE
        RAISE NOTICE 'Column already exists: is_public';
    END IF;
END $$;

-- Add unique constraint on repository_code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'repositories' 
        AND constraint_name = 'repositories_repository_code_unique'
    ) THEN
        ALTER TABLE "repositories" ADD CONSTRAINT "repositories_repository_code_unique" UNIQUE("repository_code");
        RAISE NOTICE 'Added unique constraint: repositories_repository_code_unique';
    ELSE
        RAISE NOTICE 'Constraint already exists: repositories_repository_code_unique';
    END IF;
END $$;
