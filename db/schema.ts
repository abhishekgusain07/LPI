import { boolean, integer, pgTable, primaryKey, text, timestamp, varchar, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";

// First, create the enum type
export const sportTypeEnum = pgEnum('sport_type_enum', ['cricket', 'football', 'basketball']);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: text("gender"),
  profileImageUrl: text("profile_image_url"),
  userId: text("user_id").unique(),
});

export const competitions = pgTable("competitions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // "Premier League"
  slug: text("slug").notNull().unique(), // "premier-league"
  sportType: sportTypeEnum("sport_type_enum").notNull(), // Match the enum name exactly
  logoUrl: text("logo_url"),
  seasonDuration: text("season_duration"), // "September-June" for display
});

export const contests = pgTable("contests", {
  id: text("id").primaryKey(),
  competitionId: text("competition_id").references(() => competitions.id),
  year: integer("year").notNull(), // 2023, 2024
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  predictionDeadline: timestamp("prediction_deadline").notNull(),
  isActive: boolean("is_active").default(true),
});

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  contestId: text("contest_id").references(() => contests.id),
  name: text("name").notNull(),
  shortCode: varchar("short_code"), // e.g., MCI for Manchester City
  logoUrl: text("logo_url"),
});

export const predictions = pgTable("predictions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  contestId: text("contest_id").references(() => contests.id),
  createdTime: timestamp("created_time").defaultNow(),
});

export const predictionsUserContestIndex = pgTable("predictions_user_contest_index", {
  userId: text("user_id").references(() => users.id).notNull(),
  contestId: text("contest_id").references(() => contests.id).notNull(),
}, (t) => ({
  unq: primaryKey({ columns: [t.userId, t.contestId] }),
}));

export const predictionEntries = pgTable("prediction_entries", {
  id: text("id").primaryKey(),
  predictionId: text("prediction_id").references(() => predictions.id),
  teamId: text("team_id").references(() => teams.id),
  position: integer("position").notNull(),
});

export const userContestScores = pgTable("user_contest_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  competitionId: text("competition_id").references(() => competitions.id),
  contestId: text("contest_id").references(() => contests.id),
  score: integer("score").default(0),
  seasonScore: integer("season_score").default(0), // For competition's annual tracking
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const userOverallScores = pgTable("user_overall_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  totalScore: integer("total_score").default(0),
  // Track both all-time and annual overall scores
  annualScore: integer("annual_score").default(0),
  year: integer("year").notNull(), // 2023, 2024
  lastUpdated: timestamp("last_updated").defaultNow(),
});