"use server";

import { db } from "@/db/drizzle";
import { predictions, predictionEntries, users, teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export type PredictionWithTeams = {
  id: string;
  createdTime: Date;
  entries: {
    position: number;
    team: {
      id: string;
      name: string;
      shortCode: string | null;
      logoUrl: string | null;
    };
  }[];
};

export const getUserPrediction = async (contestId: string): Promise<PredictionWithTeams | null> => {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.warn("User not authenticated when fetching prediction");
      return null;
    }

    // Get the internal user ID
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userId, clerkUserId));

    if (userResult.length === 0) {
      console.warn("User not found in database when fetching prediction");
      return null;
    }

    const userId = userResult[0].id;

    // Get the user's prediction for this contest
    const predictionResult = await db
      .select({
        id: predictions.id,
        createdTime: predictions.createdTime,
      })
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, userId),
          eq(predictions.contestId, contestId)
        )
      );

    if (predictionResult.length === 0) {
      // Not an error - user simply hasn't made a prediction yet
      return null;
    }

    const prediction = predictionResult[0];
    
    // Ensure createdTime is a Date object
    const createdTime = prediction.createdTime instanceof Date 
      ? prediction.createdTime 
      : prediction.createdTime 
        ? new Date(prediction.createdTime) 
        : new Date();

    // Get the prediction entries with team details
    const entriesResult = await db
      .select({
        position: predictionEntries.position,
        team: {
          id: teams.id,
          name: teams.name,
          shortCode: teams.shortCode,
          logoUrl: teams.logoUrl,
        },
      })
      .from(predictionEntries)
      .innerJoin(teams, eq(predictionEntries.teamId, teams.id))
      .where(eq(predictionEntries.predictionId, prediction.id))
      .orderBy(predictionEntries.position);

    if (entriesResult.length === 0) {
      console.warn(`Found prediction ${prediction.id} but no entries for it`);
    }

    return {
      id: prediction.id,
      createdTime,
      entries: entriesResult,
    };
  } catch (error: any) {
    console.error("Error getting user prediction:", error);
    // Return null instead of throwing to make the function more robust
    // in the UI context - the UI should handle null gracefully
    return null;
  }
}; 