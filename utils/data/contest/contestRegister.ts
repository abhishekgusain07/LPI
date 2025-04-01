"use server";

import { db } from "@/db/drizzle";
import { predictions, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { uid } from "uid";

export const contestRegister = async (contestId: string) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    // First get the internal user ID from users table using Clerk userId
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userId, clerkUserId));

    if (userResult.length === 0) {
      throw new Error("User not found. Please complete your profile first.");
    }

    const userId = userResult[0].id;

    // Check if user already registered
    const existingPredictions = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, userId),
          eq(predictions.contestId, contestId)
        )
      );

    if (existingPredictions.length > 0) {
      throw new Error("You have already registered for this contest");
    }

    // Create new prediction entry
    const result = await db.insert(predictions).values({
      id: uid(32),
      userId,
      contestId,
      createdTime: new Date(),
    }).returning();

    return result[0];
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 