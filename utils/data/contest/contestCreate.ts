"use server";

import { db } from "@/db/drizzle";
import { contests } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uid } from "uid";

export type ContestCreateProps = {
  competitionId: string;
  year: number;
  startTime: Date;
  endTime: Date;
  predictionDeadline: Date;
  isActive?: boolean;
};

export const contestCreate = async ({
  competitionId,
  year,
  startTime,
  endTime,
  predictionDeadline,
  isActive = true,
}: ContestCreateProps) => {
  try {
    const {userId} = await auth();
    if(!userId){
      throw new Error("Unauthorized");
    }
    const result = await db.insert(contests).values({
      id: uid(32),
      competitionId,
      year,
      startTime,
      endTime,
      predictionDeadline,
      isActive,
    }).returning();

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 