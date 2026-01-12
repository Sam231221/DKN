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
ALTER TABLE "knowledge_items" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "file_type" text;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "compliance_checked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "compliance_violations" text[];--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "duplicate_detected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD COLUMN "similar_items" text[];--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;