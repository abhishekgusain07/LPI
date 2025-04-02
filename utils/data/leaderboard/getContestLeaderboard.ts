"use server";

import { db } from "@/db/drizzle";
import { userContestScores, users, predictions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq, sql } from "drizzle-orm";

export type LeaderboardEntry = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  score: number;
  rank: number;
  isCurrentUser: boolean;
};

export const getContestLeaderboard = async (contestId: string): Promise<LeaderboardEntry[]> => {
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

    // First, get all users with predictions for this contest 
    // along with their details in one query
    const usersWithPredictions = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .innerJoin(
        predictions,
        eq(predictions.userId, users.id)
      )
      .where(eq(predictions.contestId, contestId))
      .groupBy(users.id); // Group to eliminate duplicates
    
    // Get scores where available
    const scores = await db
      .select({
        userId: userContestScores.userId,
        score: userContestScores.score,
        id: userContestScores.id,
      })
      .from(userContestScores)
      .where(eq(userContestScores.contestId, contestId));
    
    // Create a map of scores by userId
    const scoreMap = new Map();
    scores.forEach(score => {
      if (score.userId !== null) {
        scoreMap.set(score.userId, {
          score: score.score ?? 0,
          id: score.id
        });
      }
    });

    // Create leaderboard entries from users with predictions
    const leaderboardEntries: LeaderboardEntry[] = usersWithPredictions.map(user => {
      const userId = user.id;
      const scoreInfo = scoreMap.get(userId) || { score: 0, id: `${userId}_no_score` };
      
      return {
        id: scoreInfo.id,
        userId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        score: scoreInfo.score,
        rank: 0, // Will be calculated later
        isCurrentUser: userId === currentUserId
      };
    });

    // Sort entries by score (descending)
    leaderboardEntries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      
      // For same scores, sort alphabetically by name
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      return nameA.localeCompare(nameB);
    });

    // Calculate rankings (same score = same rank)
    let currentRank = 1;
    let currentScore = leaderboardEntries.length > 0 ? leaderboardEntries[0].score : 0;
    
    const leaderboardWithRanks = leaderboardEntries.map((entry, index) => {
      if (entry.score < currentScore) {
        currentRank = index + 1;
        currentScore = entry.score;
      }
      
      return {
        ...entry,
        rank: currentRank
      };
    });

    // Check if current user is in the leaderboard
    const hasCurrentUser = leaderboardWithRanks.some(entry => entry.isCurrentUser);
    
    // Add current user if not already in the leaderboard
    if (!hasCurrentUser && currentUserId) {
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
        leaderboardWithRanks.push({
          id: `${currentUserId}_no_prediction`,
          userId: currentUserId,
          firstName: currentUserDetails[0].firstName,
          lastName: currentUserDetails[0].lastName,
          profileImageUrl: currentUserDetails[0].profileImageUrl,
          score: 0,
          rank: leaderboardWithRanks.length + 1,
          isCurrentUser: true
        });
      }
    }

    return leaderboardWithRanks;
  } catch (error: any) {
    console.error("Error fetching contest leaderboard:", error);
    throw new Error(error.message);
  }
}; 