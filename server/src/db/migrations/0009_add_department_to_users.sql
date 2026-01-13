-- Migration: Add department column to users table
-- This migration adds a new 'department' column to store department/team names for users

--> statement-breakpoint
-- Add department column (nullable to allow existing data)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" text;
