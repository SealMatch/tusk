ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_applicant_id_applicants_id_fk";
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'matches_applicant_id_applicants_id_fk'
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE "matches" ADD CONSTRAINT "matches_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;