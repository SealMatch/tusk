CREATE TABLE "applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" text NOT NULL,
	"wallet_address" text NOT NULL,
	"blob_id" text DEFAULT '',
	"seal_policy_id" text DEFAULT '',
	"position" text,
	"tech_stack" text[],
	"introduction" text,
	"ai_summary" text,
	"access_price" integer DEFAULT 0,
	"access_list" jsonb DEFAULT '{}'::jsonb,
	"is_job_seeking" boolean DEFAULT true,
	"embedding" vector(768),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applicants_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "histories" (

);
--> statement-breakpoint
CREATE TABLE "notifications" (

);
--> statement-breakpoint
CREATE INDEX "applicants_wallet_address_idx" ON "applicants" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "applicants_is_job_seeking_idx" ON "applicants" USING btree ("is_job_seeking");