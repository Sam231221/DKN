ALTER TABLE "knowledge_assets" RENAME COLUMN "project_id" TO "originating_project_id";--> statement-breakpoint
ALTER TABLE "knowledge_assets" DROP CONSTRAINT "knowledge_assets_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "originating_project_id" text;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "access_level" "access_level" DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "lifecycle_status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_code" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lead_consultant_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_satisfaction_score" integer;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "repository_code" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "storage_location" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "encryption_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "retention_policy" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "search_index_status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "knowledge_assets" ADD CONSTRAINT "knowledge_assets_originating_project_id_projects_id_fk" FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_originating_project_id_projects_id_fk" FOREIGN KEY ("originating_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_consultant_id_users_id_fk" FOREIGN KEY ("lead_consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_code_unique" UNIQUE("project_code");--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_repository_code_unique" UNIQUE("repository_code");