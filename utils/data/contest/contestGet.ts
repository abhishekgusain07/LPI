"use server";

import { db } from "@/db/drizzle";
import { contests, competitions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type ContestWithCompetition = {
  id: string;
  year: number;
  startTime: Date;
  endTime: Date;
  predictionDeadline: Date;
  isActive: boolean;
  competition: {
    id: string;
    name: string;
    sportType: string;
  };
};

export const contestGet = async () => {
  try {
    // Temporarily remove auth checking for debugging
    // const {userId} = await auth();
    // if(!userId){
    //   throw new Error("Unauthorized");
    // }

    // Log the query to help with debugging
    console.log("Fetching contests and competitions...");

    const result = await db
      .select({
        id: contests.id,
        year: contests.year,
        startTime: contests.startTime,
        endTime: contests.endTime,
        predictionDeadline: contests.predictionDeadline,
        isActive: contests.isActive,
        competition: {
          id: competitions.id,
          name: competitions.name,
          sportType: competitions.sportType,
        },
      })
      .from(contests)
      .leftJoin(competitions, eq(contests.competitionId, competitions.id))
      .orderBy(desc(contests.startTime));

    console.log("Query result:", result);
    
    return result as ContestWithCompetition[];
  } catch (error: any) {
    console.error("Error fetching contests:", error);
    throw new Error(error.message);
  }
}; 