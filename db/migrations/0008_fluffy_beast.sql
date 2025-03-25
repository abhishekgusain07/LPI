CREATE TYPE "public"."sport_type" AS ENUM('cricket', 'football', 'basketball');--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "sport_type" SET DATA TYPE sport_type;