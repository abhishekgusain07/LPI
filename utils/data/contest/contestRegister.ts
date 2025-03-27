"use server";

import { db } from "@/db/drizzle";
import { predictions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uid } from "uid";

export const contestRegister = async (contestId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if user already registered
    const existingPrediction = await db.query.predictions.findFirst({
      where: (predictions, { eq, and }) => 
        and(eq(predictions.userId, userId), eq(predictions.contestId, contestId))
    });

    if (existingPrediction) {
      throw new Error("You have already registered for this contest");
    }

    // Create new prediction entry
    const result = await db.insert(predictions).values({
      id: uid(32),
      userId,
      contestId,
      createdTime: new Date(),
    }).returning();

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 