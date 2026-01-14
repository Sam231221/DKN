CREATE TYPE "public"."access_level" AS ENUM('public', 'internal', 'confidential', 'restricted');--> statement-breakpoint
CREATE TYPE "public"."compliance_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."connectivity_status" AS ENUM('online', 'offline', 'limited');--> statement-breakpoint
CREATE TYPE "public"."contribution_type" AS ENUM('created', 'edited', 'validated', 'commented', 'viewed');--> statement-breakpoint
CREATE TYPE "public"."expertise_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."knowledge_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."knowledge_type" AS ENUM('documentation', 'best_practices', 'procedure', 'training', 'project_knowledge', 'client_content', 'technical', 'policy', 'guideline');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('individual', 'organizational');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('consultant', 'knowledge_champion', 'administrator', 'executive_leadership', 'knowledge_council_member');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"region_id" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text NOT NULL,
	"law_description" text NOT NULL,
	"compliance_level" "compliance_level" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultant_expertise" (
	"id" text PRIMARY KEY NOT NULL,
	"consultant_id" text NOT NULL,
	"expertise_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultant_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"consultant_id" text NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_recommendation_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"recommendation_id" text NOT NULL,
	"knowledge_asset_id" text NOT NULL,
	"rank" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_recommendation_expertise" (
	"id" text PRIMARY KEY NOT NULL,
	"recommendation_id" text NOT NULL,
	"expertise_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"consultant_id" text NOT NULL,
	"effectiveness_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"knowledge_item_id" text,
	"type" "contribution_type" NOT NULL,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expertise" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"level" "expertise_level" DEFAULT 'intermediate' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "governance_council" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "governance_council_members" (
	"id" text PRIMARY KEY NOT NULL,
	"council_id" text NOT NULL,
	"consultant_id" text NOT NULL,
	"role" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"organization_name" text,
	"role" "user_role" DEFAULT 'consultant',
	"invited_by" text NOT NULL,
	"accepted" boolean DEFAULT false,
	"accepted_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "knowledge_asset_compliance" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_asset_id" text NOT NULL,
	"compliance_rule_id" text NOT NULL,
	"is_compliant" boolean DEFAULT false,
	"checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"status" "knowledge_status" DEFAULT 'draft' NOT NULL,
	"tags" text[],
	"access_level" "access_level" DEFAULT 'internal' NOT NULL,
	"client_id" text,
	"originating_project_id" text,
	"curator_id" text,
	"repository_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_champions" (
	"id" text PRIMARY KEY NOT NULL,
	"champion_id" text NOT NULL,
	"appointment_date" date NOT NULL,
	"region" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_champions_champion_id_unique" UNIQUE("champion_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"type" "knowledge_type" DEFAULT 'documentation' NOT NULL,
	"originating_project_id" text,
	"repository_id" text,
	"author_id" text NOT NULL,
	"status" "knowledge_status" DEFAULT 'draft' NOT NULL,
	"access_level" "access_level" DEFAULT 'internal' NOT NULL,
	"lifecycle_status" text DEFAULT 'draft',
	"tags" text[],
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"is_published" boolean DEFAULT false,
	"validated_by" text,
	"validated_at" timestamp,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"file_type" text,
	"metadata" jsonb,
	"compliance_checked" boolean DEFAULT false,
	"compliance_violations" text[],
	"duplicate_detected" boolean DEFAULT false,
	"similar_items" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_asset_id" text NOT NULL,
	"tags" text[],
	"category" text,
	"language" text DEFAULT 'en',
	"version" text DEFAULT '1.0',
	"last_reviewed" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"related_id" text,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"project_code" text,
	"name" text NOT NULL,
	"client_id" text NOT NULL,
	"domain" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"lead_consultant_id" text,
	"client_satisfaction_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text,
	"data_protection_laws" text[],
	"connectivity_status" "connectivity_status" DEFAULT 'online' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_code" text,
	"name" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"storage_location" text,
	"encryption_enabled" boolean DEFAULT true,
	"retention_policy" text,
	"search_index_status" text DEFAULT 'active',
	"item_count" integer DEFAULT 0,
	"contributor_count" integer DEFAULT 0,
	"tags" text[],
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repositories_repository_code_unique" UNIQUE("repository_code")
);
--> statement-breakpoint
CREATE TABLE "training_session_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"training_session_id" text NOT NULL,
	"knowledge_asset_id" text NOT NULL,
	"recommendation_type" text DEFAULT 'recommends' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"topic" text NOT NULL,
	"attendees" integer DEFAULT 0,
	"knowledge_champion_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"interest" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"address" text,
	"avatar" text,
	"experience_level" text,
	"role" "user_role" DEFAULT 'consultant' NOT NULL,
	"organization_type" "organization_type" DEFAULT 'individual',
	"organization_name" text,
	"employee_count" text,
	"points" integer DEFAULT 0,
	"contributions" integer DEFAULT 0,
	"hire_date" date,
	"region_id" text,
	"industry" text,
	"department" text,
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_token_expires" timestamp,
	"password_reset_token" text,
	"password_reset_token_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_verification_token_unique" UNIQUE("email_verification_token"),
	CONSTRAINT "users_password_reset_token_unique" UNIQUE("password_reset_token")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_rules" ADD CONSTRAINT "compliance_rules_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_expertise" ADD CONSTRAINT "consultant_expertise_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_expertise" ADD CONSTRAINT "consultant_expertise_expertise_id_expertise_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_projects" ADD CONSTRAINT "consultant_projects_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_projects" ADD CONSTRAINT "consultant_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_recommendation_assets" ADD CONSTRAINT "content_recommendation_assets_recommendation_id_content_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."content_recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_recommendation_assets" ADD CONSTRAINT "content_recommendation_assets_knowledge_asset_id_knowledge_assets_id_fk" FOREIGN KEY ("knowledge_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_recommendation_expertise" ADD CONSTRAINT "content_recommendation_expertise_recommendation_id_content_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."content_recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_recommendation_expertise" ADD CONSTRAINT "content_recommendation_expertise_expertise_id_expertise_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_recommendations" ADD CONSTRAINT "content_recommendations_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_knowledge_item_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_item_id") REFERENCES "public"."knowledge_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_council_members" ADD CONSTRAINT "governance_council_members_council_id_governance_council_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."governance_council"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_council_members" ADD CONSTRAINT "governance_council_members_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_asset_compliance" ADD CONSTRAINT "knowledge_asset_compliance_knowledge_asset_id_knowledge_assets_id_fk" FOREIGN KEY ("knowledge_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_asset_compliance" ADD CONSTRAINT "knowledge_asset_compliance_compliance_rule_id_compliance_rules_id_fk" FOREIGN KEY ("compliance_rule_id") REFERENCES "public"."compliance_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_originating_project_id_projects_id_fk" FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_curator_id_users_id_fk" FOREIGN KEY ("curator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_champions" ADD CONSTRAINT "knowledge_champions_champion_id_users_id_fk" FOREIGN KEY ("champion_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_originating_project_id_projects_id_fk" FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_knowledge_asset_id_knowledge_assets_id_fk" FOREIGN KEY ("knowledge_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_consultant_id_users_id_fk" FOREIGN KEY ("lead_consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_session_recommendations" ADD CONSTRAINT "training_session_recommendations_training_session_id_training_sessions_id_fk" FOREIGN KEY ("training_session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_session_recommendations" ADD CONSTRAINT "training_session_recommendations_knowledge_asset_id_knowledge_assets_id_fk" FOREIGN KEY ("knowledge_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_knowledge_champion_id_users_id_fk" FOREIGN KEY ("knowledge_champion_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;