ALTER TABLE "histories" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "histories" ADD COLUMN "recruiter_wallet_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "histories" ADD COLUMN "query" text NOT NULL;--> statement-breakpoint
ALTER TABLE "histories" ADD COLUMN "applicant_ids" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "histories" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "histories_recruiter_wallet_address_idx" ON "histories" USING btree ("recruiter_wallet_address");--> statement-breakpoint
CREATE INDEX "histories_created_at_idx" ON "histories" USING btree ("created_at");