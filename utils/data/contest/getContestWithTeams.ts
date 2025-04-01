"use server";

import { db } from "@/db/drizzle";
import { contests, competitions, teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export type Team = {
  id: string;
  name: string;
  shortCode?: string | null;
  logoUrl?: string | null;
};

export type ContestWithTeams = {
  id: string;
  year: number;
  competition: {
    id: string;
    name: string;
    sportType: string;
  };
  teams: Team[];
  predictionDeadline: Date;
};

export const getContestWithTeams = async (contestId: string): Promise<ContestWithTeams> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get contest with competition info
    const contestResults = await db
      .select({
        id: contests.id,
        year: contests.year,
        competitionId: contests.competitionId,
        predictionDeadline: contests.predictionDeadline,
        competition: {
          id: competitions.id,
          name: competitions.name,
          sportType: competitions.sportType,
        }
      })
      .from(contests)
      .innerJoin(competitions, eq(contests.competitionId, competitions.id))
      .where(eq(contests.id, contestId));

    if (contestResults.length === 0) {
      throw new Error("Contest not found");
    }

    const contest = contestResults[0];

    // Get teams for the contest
    const teamResults = await db
      .select({
        id: teams.id,
        name: teams.name,
        shortCode: teams.shortCode,
        logoUrl: teams.logoUrl,
      })
      .from(teams)
      .where(eq(teams.contestId, contestId));

    return {
      id: contest.id,
      year: contest.year,
      predictionDeadline: contest.predictionDeadline,
      competition: contest.competition,
      teams: teamResults as Team[],
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 