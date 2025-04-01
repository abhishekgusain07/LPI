"use server";

import { db } from "@/db/drizzle";
import { predictions, predictionEntries, users, contests, predictionsUserContestIndex, teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, inArray } from "drizzle-orm";
import { uid } from "uid";
import { isBefore } from "date-fns";

type PredictionEntry = {
  teamId: string;
  position: number;
};

export const saveContestPrediction = async (
  contestId: string, 
  entries: PredictionEntry[]
) => {
  try {
    console.log("[saveContestPrediction] Starting with contestId:", contestId);
    console.log("[saveContestPrediction] Entries to save:", entries);
    
    // Validate that we received entries
    if (!entries || entries.length === 0) {
      console.error("[saveContestPrediction] No entries provided");
      throw new Error("No team predictions provided");
    }
    
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error("[saveContestPrediction] No authenticated user found");
      throw new Error("Unauthorized");
    }
    console.log("[saveContestPrediction] Authenticated user:", clerkUserId);

    // Get the internal user ID
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userId, clerkUserId));

    if (userResult.length === 0) {
      console.error("[saveContestPrediction] User not found in database");
      throw new Error("User not found. Please complete your profile first.");
    }

    const userId = userResult[0].id;
    console.log("[saveContestPrediction] Internal userId:", userId);

    // Check contest deadline
    const contestResult = await db
      .select({ predictionDeadline: contests.predictionDeadline })
      .from(contests)
      .where(eq(contests.id, contestId));

    if (contestResult.length === 0) {
      console.error("[saveContestPrediction] Contest not found:", contestId);
      throw new Error("Contest not found");
    }

    const deadline = new Date(contestResult[0].predictionDeadline);
    const now = new Date();
    console.log("[saveContestPrediction] Contest deadline:", deadline);
    console.log("[saveContestPrediction] Current time:", now);

    if (isBefore(deadline, now)) {
      console.error("[saveContestPrediction] Deadline has passed");
      throw new Error("The deadline for submitting predictions has passed");
    }
    
    // Validate that all teamIds exist in this contest
    const teamIds = entries.map(entry => entry.teamId);
    console.log("[saveContestPrediction] Validating teamIds:", teamIds);
    
    const validTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.contestId, contestId),
          inArray(teams.id, teamIds)
        )
      );
    
    console.log("[saveContestPrediction] Valid teams found:", validTeams.length);
    
    if (validTeams.length !== teamIds.length) {
      console.error("[saveContestPrediction] Not all teams exist in the contest");
      const validTeamIds = validTeams.map(team => team.id);
      const invalidTeamIds = teamIds.filter(id => !validTeamIds.includes(id));
      console.error("[saveContestPrediction] Invalid team IDs:", invalidTeamIds);
      throw new Error("Some team IDs are invalid for this contest");
    }

    // Check if user already has a prediction for this contest
    const existingPrediction = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, userId),
          eq(predictions.contestId, contestId)
        )
      );
    
    console.log("[saveContestPrediction] Existing prediction check:", 
                existingPrediction.length > 0 ? "Found" : "Not found");

    let predictionId: string;

    if (existingPrediction.length === 0) {
      // Create a new prediction if one doesn't exist
      console.log("[saveContestPrediction] Creating new prediction");
      const newPrediction = await db.insert(predictions)
        .values({
          id: uid(32),
          userId,
          contestId,
          createdTime: new Date(),
        })
        .returning();
      
      predictionId = newPrediction[0].id;
      console.log("[saveContestPrediction] Created new prediction with ID:", predictionId);
      
      // Also create an entry in the predictionsUserContestIndex table
      // to enforce the uniqueness constraint
      try {
        console.log("[saveContestPrediction] Creating index entry");
        await db.insert(predictionsUserContestIndex)
          .values({
            userId,
            contestId,
          });
        console.log("[saveContestPrediction] Index entry created successfully");
      } catch (indexError) {
        console.error("[saveContestPrediction] Error creating index entry:", indexError);
        // Continue even if index creation fails - it might be a duplicate key error
        // which is actually fine in this case
      }
    } else {
      // Use the existing prediction
      predictionId = existingPrediction[0].id;
      console.log("[saveContestPrediction] Using existing prediction ID:", predictionId);
      
      // Delete existing entries
      console.log("[saveContestPrediction] Deleting existing prediction entries");
      try {
        const deleteResult = await db.delete(predictionEntries)
          .where(eq(predictionEntries.predictionId, predictionId))
          .returning();
        console.log("[saveContestPrediction] Deleted entries:", deleteResult.length);
      } catch (deleteError) {
        console.error("[saveContestPrediction] Error deleting existing entries:", deleteError);
        throw new Error("Failed to update prediction. Please try again.");
      }
    }

    // Insert new prediction entries
    console.log("[saveContestPrediction] Creating new prediction entries");
    const predictionEntriesData = entries.map(entry => ({
      id: uid(32),
      predictionId,
      teamId: entry.teamId,
      position: entry.position,
    }));
    
    console.log("[saveContestPrediction] Prediction entries data:", predictionEntriesData);

    try {
      const insertResult = await db.insert(predictionEntries)
        .values(predictionEntriesData)
        .returning();
      
      console.log("[saveContestPrediction] Inserted prediction entries:", insertResult.length);
      
      if (insertResult.length !== entries.length) {
        console.warn("[saveContestPrediction] Not all entries were inserted!", {
          requested: entries.length,
          inserted: insertResult.length
        });
      }
    } catch (insertError: any) {
      console.error("[saveContestPrediction] Failed to insert prediction entries:", insertError);
      throw new Error(`Failed to save prediction entries: ${insertError.message}`);
    }

    console.log("[saveContestPrediction] Successfully completed prediction save");
    return { success: true, predictionId, entriesCount: entries.length };
  } catch (error: any) {
    console.error("[saveContestPrediction] Error saving prediction:", error);
    throw new Error(error.message);
  }
}; 