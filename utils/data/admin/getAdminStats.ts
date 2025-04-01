"use server";

import { db } from "@/db/drizzle";
import { contests, competitions, predictions, teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";

export type ContestStat = {
  id: string;
  name: string;
  year: number;
  sportType: string;
  entrantsCount: number;
  teamsCount: number;
};

export type AdminStats = {
  totalContests: number;
  totalCompetitions: number;
  totalPredictions: number;
  activeContests: number;
  contestStats: ContestStat[];
};

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get contest statistics with competition info and prediction counts
    const contestStatsQuery = await db
      .select({
        id: contests.id,
        year: contests.year,
        isActive: contests.isActive,
        name: competitions.name,
        sportType: competitions.sportType,
      })
      .from(contests)
      .innerJoin(competitions, eq(contests.competitionId, competitions.id));

    // For each contest, get the entrants count and teams count
    const contestStats: ContestStat[] = [];
    
    for (const contest of contestStatsQuery) {
      // Get prediction count
      const predictionsResult = await db
        .select({ value: count() })
        .from(predictions)
        .where(eq(predictions.contestId, contest.id));
      
      // Get teams count  
      const teamsResult = await db
        .select({ value: count() })
        .from(teams)
        .where(eq(teams.contestId, contest.id));
      
      contestStats.push({
        id: contest.id,
        name: contest.name,
        year: contest.year,
        sportType: contest.sportType,
        entrantsCount: predictionsResult[0].value,
        teamsCount: teamsResult[0].value
      });
    }
    
    // Get overall counts
    const totalContestsResult = await db
      .select({ value: count() })
      .from(contests);
      
    const totalCompetitionsResult = await db
      .select({ value: count() })
      .from(competitions);
      
    const totalPredictionsResult = await db
      .select({ value: count() })
      .from(predictions);
      
    const activeContestsResult = await db
      .select({ value: count() })
      .from(contests)
      .where(eq(contests.isActive, true));

    return {
      totalContests: totalContestsResult[0].value,
      totalCompetitions: totalCompetitionsResult[0].value, 
      totalPredictions: totalPredictionsResult[0].value,
      activeContests: activeContestsResult[0].value,
      contestStats
    };
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    throw new Error(error.message);
  }
}; 