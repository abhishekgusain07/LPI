"use server";

import { db } from "@/db/drizzle";
import { userContestScores, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, sum, desc } from "drizzle-orm";

export type AllTimeLeaderboardEntry = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  totalScore: number;
  contestsPlayed: number;
  rank: number;
  isCurrentUser: boolean;
};

export const getAllTimeLeaderboard = async (): Promise<AllTimeLeaderboardEntry[]> => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    // Get the internal user ID
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userId, clerkUserId));

    if (userResult.length === 0) {
      throw new Error("User not found");
    }

    const currentUserId = userResult[0].id;

    // Get all users with their aggregated scores across all contests
    const leaderboardData = await db
      .select({
        userId: users.id,
        totalScore: sql<number>`COALESCE(sum(${userContestScores.score}), 0)`,
        contestsPlayed: sql<number>`COALESCE(count(${userContestScores.contestId}), 0)`,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .leftJoin(userContestScores, eq(userContestScores.userId, users.id))
      .groupBy(users.id, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(desc(sql<number>`COALESCE(sum(${userContestScores.score}), 0)`), desc(sql<number>`COALESCE(count(${userContestScores.contestId}), 0)`));

    // Calculate rankings and mark current user
    const leaderboard: AllTimeLeaderboardEntry[] = leaderboardData
      .filter(entry => entry.userId !== null) // Filter out any null userIds
      .map((entry, index) => ({
        userId: entry.userId as string,
        firstName: entry.firstName,
        lastName: entry.lastName,
        profileImageUrl: entry.profileImageUrl,
        totalScore: Number(entry.totalScore) || 0,
        contestsPlayed: Number(entry.contestsPlayed) || 0,
        rank: index + 1,
        isCurrentUser: entry.userId === currentUserId
      }));

    // If current user is not in the leaderboard (has no scores yet), add them with 0 score
    if (!leaderboard.some(entry => entry.isCurrentUser) && currentUserId) {
      const currentUserDetails = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, currentUserId))
        .limit(1);
      
      if (currentUserDetails.length > 0) {
        leaderboard.push({
          userId: currentUserId,
          firstName: currentUserDetails[0].firstName,
          lastName: currentUserDetails[0].lastName,
          profileImageUrl: currentUserDetails[0].profileImageUrl,
          totalScore: 0,
          contestsPlayed: 0,
          rank: leaderboard.length + 1,
          isCurrentUser: true
        });
      }
    }

    return leaderboard;
  } catch (error: any) {
    console.error("Error fetching all-time leaderboard:", error);
    throw new Error(error.message);
  }
}; 