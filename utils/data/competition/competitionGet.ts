"use server";

import { db } from "@/db/drizzle";
import { competitions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";

export const competitionGet = async () => {
  try {
    const {userId} = await auth();
    if(!userId){
      throw new Error("Unauthorized");
    }
    const result = await db
      .select({
        id: competitions.id,
        name: competitions.name,
      })
      .from(competitions)
      .orderBy(desc(competitions.name));

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 