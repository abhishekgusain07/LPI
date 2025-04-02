"use server";

import { db } from "@/db/drizzle";
import { contests, userContestScores, users, competitions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

export type ContestWinner = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  contestId: string;
  year: number;
  competitionName: string;
  score: number;
};

export const getHistoricalContestWinners = async (competitionId: string): Promise<ContestWinner[]> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get all contests for this competition
    const contestsResults = await db
      .select({
        id: contests.id,
        year: contests.year,
        competitionName: competitions.name,
      })
      .from(contests)
      .innerJoin(competitions, eq(contests.competitionId, competitions.id))
      .where(eq(contests.competitionId, competitionId))
      .orderBy(desc(contests.year));

    if (contestsResults.length === 0) {
      return [];
    }

    // For each contest, get the winner (top scorer)
    const winners: ContestWinner[] = [];

    for (const contest of contestsResults) {
      // Get the top scorer for this contest
      const topScorer = await db
        .select({
          id: userContestScores.id,
          userId: userContestScores.userId,
          score: userContestScores.score,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          contestId: userContestScores.contestId,
        })
        .from(userContestScores)
        .innerJoin(users, eq(userContestScores.userId, users.id))
        .where(eq(userContestScores.contestId, contest.id))
        .orderBy(desc(userContestScores.score))
        .limit(1);

      if (topScorer.length > 0 && topScorer[0].userId !== null && topScorer[0].score !== null) {
        winners.push({
          id: topScorer[0].id,
          userId: topScorer[0].userId as string,
          firstName: topScorer[0].firstName,
          lastName: topScorer[0].lastName,
          profileImageUrl: topScorer[0].profileImageUrl,
          contestId: topScorer[0].contestId as string,
          year: contest.year,
          competitionName: contest.competitionName,
          score: topScorer[0].score ?? 0,
        });
      }
    }

    return winners;
  } catch (error: any) {
    console.error("Error fetching historical contest winners:", error);
    throw new Error(error.message);
  }
}; 