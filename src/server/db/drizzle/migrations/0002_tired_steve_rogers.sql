CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recruiter_wallet_address" text NOT NULL,
	"applicant_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "histories" RENAME COLUMN "applicant_ids" TO "results";--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "encryption_id" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matches_recruiter_wallet_address_idx" ON "matches" USING btree ("recruiter_wallet_address");--> statement-breakpoint
CREATE INDEX "matches_applicant_id_idx" ON "matches" USING btree ("applicant_id");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");