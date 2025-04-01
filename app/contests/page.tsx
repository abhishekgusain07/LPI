"use client"
import { contestGet, ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Loader2, Trophy, Users } from "lucide-react";
import { ContestCard } from "@/components/contests/ContestCard";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestWithCompetition[]>([]);
  const [loadingContests, setLoadingContests] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchContests = async() => {
      try{
        setLoadingContests(true);
        const res = await contestGet();
        setContests(res);
        toast.success("Successfully fetched all contests");
      }catch(e) {
        toast.error("Failed to fetch contests");
      }finally{
        setLoadingContests(false);
      }
    }
    fetchContests();
  }, []);
  
  if(loadingContests) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <Loader2 className="size-4 animate-spin" />
    </div>
  }
  
  // Group contests by sport type
  const contestsByType = contests?.reduce((acc, contest) => {
    const sportType = contest.competition.sportType;
    if (!acc[sportType]) {
      acc[sportType] = [];
    }
    acc[sportType].push(contest);
    return acc;
  }, {} as Record<string, typeof contests>);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Active Contests
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Join exciting prediction contests across various sports. Make your predictions, compete with others, and climb the leaderboards!
        </p>
      </div>

      {Object.entries(contestsByType || {}).map(([sportType, sportContests]) => (
        <div key={sportType} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold capitalize">{sportType}</h2>
            <Badge variant="outline">{sportContests.length} active</Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sportContests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </div>
      ))}

      {contests?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4">
            <Trophy className="w-full h-full text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Active Contests</h3>
          <p className="text-muted-foreground">
            Check back later for new contests or contact the administrator.
          </p>
        </div>
      )}
    </div>
  );
} 