ALTER TABLE "competitions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contests" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contests" ALTER COLUMN "competition_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prediction_entries" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prediction_entries" ALTER COLUMN "prediction_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prediction_entries" ALTER COLUMN "team_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "contest_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "contest_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_contest_scores" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_contest_scores" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_contest_scores" ALTER COLUMN "competition_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_contest_scores" ALTER COLUMN "contest_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_overall_scores" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_overall_scores" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;