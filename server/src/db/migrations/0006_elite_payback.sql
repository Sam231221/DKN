ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_verification_token_unique" UNIQUE("email_verification_token");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_password_reset_token_unique" UNIQUE("password_reset_token");