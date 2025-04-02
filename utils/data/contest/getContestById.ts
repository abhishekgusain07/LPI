"use server";

import { db } from "@/db/drizzle";
import { contests, competitions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ContestWithCompetition } from "./contestGet";

export const getContestById = async (contestId: string): Promise<ContestWithCompetition> => {
  try {
    const result = await db
      .select({
        id: contests.id,
        year: contests.year,
        startTime: contests.startTime,
        endTime: contests.endTime,
        isActive: contests.isActive,
        predictionDeadline: contests.predictionDeadline,
        competitionId: competitions.id,
        competitionName: competitions.name,
        sportType: competitions.sportType,
      })
      .from(contests)
      .innerJoin(competitions, eq(contests.competitionId, competitions.id))
      .where(eq(contests.id, contestId))
      .limit(1);

    if (result.length === 0) {
      throw new Error("Contest not found");
    }

    const contest = result[0];
    
    return {
      id: contest.id,
      year: contest.year,
      startTime: contest.startTime,
      endTime: contest.endTime,
      isActive: contest.isActive ?? false,
      predictionDeadline: contest.predictionDeadline,
      competition: {
        id: contest.competitionId,
        name: contest.competitionName,
        sportType: contest.sportType,
      },
    };
  } catch (error) {
    console.error("Error fetching contest by ID:", error);
    throw error;
  }
}; 