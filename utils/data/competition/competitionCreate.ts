"use server";

import { db } from "@/db/drizzle";
import { competitions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uid } from "uid";

export type CompetitionCreateProps = {
  name: string;
  slug: string;
  sportType: 'cricket' | 'football' | 'basketball';
  logoUrl?: string;
  seasonDuration?: string;
};

export const competitionCreate = async ({
  name,
  slug,
  sportType,
  logoUrl,
  seasonDuration,
}: CompetitionCreateProps) => {
  try {
    const {userId} = await auth();
    if(!userId){
      throw new Error("Unauthorized");
    }
    const result = await db.insert(competitions).values({
      id: uid(32),
      name,
      slug,
      sportType,
      logoUrl,
      seasonDuration,
    }).returning();

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 