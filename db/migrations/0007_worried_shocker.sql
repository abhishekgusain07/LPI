CREATE TABLE "predictions_user_contest_index" (
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	CONSTRAINT "predictions_user_contest_index_user_id_contest_id_pk" PRIMARY KEY("user_id","contest_id")
);
--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_user_id_contest_id_pk";--> statement-breakpoint
ALTER TABLE "predictions_user_contest_index" ADD CONSTRAINT "predictions_user_contest_index_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions_user_contest_index" ADD CONSTRAINT "predictions_user_contest_index_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;