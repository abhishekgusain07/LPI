ALTER TYPE "public"."sport_type" RENAME TO "sport_type_enum";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "sport_type" TO "sport_type_enum";