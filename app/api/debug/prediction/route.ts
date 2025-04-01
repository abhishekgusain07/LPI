import { db } from "@/db/drizzle";
import { predictions, predictionEntries, users, teams } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check for database connection
    const dbStatus = {
      predictions: await db.select({ count: { value: predictions.id } }).from(predictions),
      predictionEntries: await db.select({ count: { value: predictionEntries.id } }).from(predictionEntries),
      users: await db.select({ count: { value: users.id } }).from(users),
      teams: await db.select({ count: { value: teams.id } }).from(teams),
    };
    
    // Check database schema
    const tablesInfo = {
      predictionsSchema: Object.keys(predictions).join(", "),
      predictionEntriesSchema: Object.keys(predictionEntries).join(", "),
      usersSchema: Object.keys(users).join(", "),
      teamsSchema: Object.keys(teams).join(", "),
    };
    
    return NextResponse.json({
      status: "Connected to database",
      counts: dbStatus,
      schema: tablesInfo
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: "Database connection error",
      message: error.message
    }, { status: 500 });
  }
} 