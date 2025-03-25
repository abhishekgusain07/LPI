"use client"
import { contestGet, ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Contests } from "@/types/schemaTypes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ContestsPage() {
  const [loadingContests, setLoadingContests] = useState<boolean>(false)
  const [contestsAndCompetition, setContestsAndCompetition] = useState<ContestWithCompetition[]>([])
  useEffect(() => {
    const fetchContests = async() => {
      try{
        setLoadingContests(true);
        const ress = await contestGet();
        setContestsAndCompetition(ress)
        toast.success("contests fetched successfully");
      }catch(e) {
        toast.error("cannot fetch contests");
      }finally {
        setLoadingContests(false);
      }
    }
    fetchContests()
  },[])

  if(loadingContests){
    return <div className="h-screen w-screen flex items-center justify-center">
      <Loader2 className="size-4 animate-spin" />
    </div>
  }
  console.log(contestsAndCompetition);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Active Contests</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contestsAndCompetition.map((contest) => (
          <Card key={contest.competition.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{contest.competition.name}</CardTitle>
                <Badge variant="outline">{contest.competition.sportType}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Year:</span> {contest.year}
                </div>
                <div>
                  <span className="font-medium">Start Time:</span>{" "}
                  {format(new Date(contest.startTime), "PPP")}
                </div>
                <div>
                  <span className="font-medium">End Time:</span>{" "}
                  {format(new Date(contest.endTime), "PPP")}
                </div>
                <div>
                  <span className="font-medium">Prediction Deadline:</span>{" "}
                  {format(new Date(contest.predictionDeadline), "PPP")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contestsAndCompetition.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active contests found.</p>
        </div>
      )}
    </div>
  );
} 