import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db/drizzle";
import { contests, competitions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  const contestId = params.contestId;

  console.log("API route called for contest ID:", contestId);
  
  if (!contestId) {
    return NextResponse.json({ error: "Contest ID is required" }, { status: 400 });
  }

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
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const contest = result[0];
    
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching contest by ID:", error);
    return NextResponse.json({ error: "Failed to fetch contest" }, { status: 500 });
  }
} 