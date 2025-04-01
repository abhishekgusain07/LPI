"use server";

import { db } from "@/db/drizzle";
import { teams } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uid } from "uid";

export type TeamCreateProps = {
  contestId: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
};

export const teamCreate = async ({
  contestId,
  name,
  shortCode,
  logoUrl,
}: TeamCreateProps) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    console.log("Creating team:", { contestId, name, shortCode, logoUrl });

    const result = await db.insert(teams).values({
      id: uid(32),
      contestId,
      name,
      shortCode,
      logoUrl: logoUrl || null,
    }).returning();

    console.log("Team created successfully:", result[0]);
    return result[0];
  } catch (error: any) {
    console.error("Error creating team:", error);
    throw new Error(error.message);
  }
}; 