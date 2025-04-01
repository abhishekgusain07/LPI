"use server";

import { db } from "@/db/drizzle";
import { teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export type Team = {
  id: string;
  name: string;
  shortCode: string | null;
  logoUrl: string | null;
};

export const getTeamsByContest = async (contestId: string): Promise<Team[]> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const teamsResult = await db
      .select({
        id: teams.id,
        name: teams.name,
        shortCode: teams.shortCode,
        logoUrl: teams.logoUrl,
      })
      .from(teams)
      .where(eq(teams.contestId, contestId));

    return teamsResult;
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    throw new Error(error.message);
  }
}; 