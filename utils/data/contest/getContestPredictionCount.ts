"use server";

import { db } from "@/db/drizzle";
import { predictions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";

export const getContestPredictionCount = async (contestId: string): Promise<number> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await db
      .select({ value: count() })
      .from(predictions)
      .where(eq(predictions.contestId, contestId));

    return result[0].value;
  } catch (error: any) {
    console.error("Error fetching prediction count:", error);
    throw new Error(error.message);
  }
}; 