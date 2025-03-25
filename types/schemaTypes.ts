import { competitions, contests } from "@/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Contests = InferSelectModel<typeof contests>;
export type NewContests = InferInsertModel<typeof contests>;
export type Competitions = InferSelectModel<typeof competitions>
export type NewCompetitions = InferSelectModel<typeof competitions> 