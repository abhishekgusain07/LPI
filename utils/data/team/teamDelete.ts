"use server";

import { db } from "@/db/drizzle";
import { teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const teamDelete = async (teamId: string): Promise<boolean> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Delete the team
    const result = await db
      .delete(teams)
      .where(eq(teams.id, teamId))
      .returning();

    if (result.length === 0) {
      throw new Error("Team not found");
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting team:", error);
    throw new Error(error.message);
  }
}; 