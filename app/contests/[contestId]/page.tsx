"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTeamsByContest } from "@/utils/data/team/getTeamsByContest";
import { getUserPrediction } from "@/utils/data/prediction/getUserPrediction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Trophy, Users, BarChart4, ArrowLeft, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getContestById } from "@/utils/data/contest/getContestById";

export default function ContestPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params?.contestId as string;
  
  console.log("Contest page loaded with contestId:", contestId);
  
  const [contest, setContest] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) {
        console.error("No contestId provided to ContestPage");
        return;
      }
      
      try {
        console.log("Fetching contest data for:", contestId);
        setLoading(true);
        const [contestData, teamsData] = await Promise.all([
          getContestById(contestId),
          getTeamsByContest(contestId)
        ]);
        
        console.log("Contest data received:", contestData);
        setContest(contestData);
        setTeams(teamsData);
        
        // Try to get user prediction
        try {
          const userPrediction = await getUserPrediction(contestId);
          setPrediction(userPrediction);
        } catch (error) {
          console.error("Failed to fetch user prediction:", error);
          // This is expected for users who haven't made a prediction yet
        }
      } catch (error) {
        console.error("Failed to fetch contest data:", error);
        toast.error("Failed to load contest details");
        router.push("/contests");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContestData();
  }, [contestId, router]);
  
  const handlePredictClick = () => {
    router.push(`/contest/${contestId}/predict`);
  };
  
  const handleLeaderboardClick = () => {
    router.push(`/contests/${contestId}/leaderboard`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!contest) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Contest Not Found</h1>
          <p className="text-muted-foreground mb-6">The contest you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/contests")}>Back to Contests</Button>
        </div>
      </div>
    );
  }
  
  const now = new Date();
  const isRegistrationOpen = new Date(contest.predictionDeadline) > now;
  const hasSubmittedPrediction = prediction !== null;
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/contests")}
          className="flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contests
        </Button>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {contest.competition.name} {contest.year}
            </h1>
            <p className="text-muted-foreground mt-1">
              Make your predictions and compete with others
            </p>
          </div>
          
          <Badge 
            variant="outline" 
            className="capitalize text-base px-3 py-1"
          >
            {contest.competition.sportType}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-green-500" />
                    <span>
                      <span className="text-muted-foreground">Starts:</span>{" "}
                      {format(new Date(contest.startTime), "PPP")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-red-500" />
                    <span>
                      <span className="text-muted-foreground">Ends:</span>{" "}
                      {format(new Date(contest.endTime), "PPP")}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>
                      <span className="text-muted-foreground">Register by:</span>{" "}
                      {format(new Date(contest.predictionDeadline), "PPP 'at' h:mm a")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>
                      {hasSubmittedPrediction 
                        ? "You've submitted your prediction!" 
                        : isRegistrationOpen 
                          ? "Make your prediction now!" 
                          : "Registration period has ended"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4 flex-wrap md:flex-nowrap">
                <Button 
                  onClick={handlePredictClick}
                  className="flex items-center gap-2 flex-1"
                  disabled={!isRegistrationOpen && !hasSubmittedPrediction}
                >
                  <Trophy className="h-4 w-4" />
                  {hasSubmittedPrediction ? "View Your Prediction" : "Make Prediction"}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleLeaderboardClick}
                  className="flex items-center gap-2 flex-1"
                >
                  <BarChart4 className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About This Contest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compete in the {contest.competition.name} {contest.year} prediction contest! 
                Predict the final standings of all teams and earn points based on how accurate your predictions are.
                Check the leaderboard regularly to see where you stand among other participants.
              </p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Scoring System:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>10 points for each exact position match</li>
                  <li>5 points for being off by only one position</li>
                  <li>3 points for being off by two positions</li>
                  <li>1 point for being off by three positions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-muted-foreground">No teams available for this contest yet.</p>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="flex-shrink-0">
                        {team.logoUrl ? (
                          <div className="h-8 w-8 relative">
                            <Image
                              src={team.logoUrl}
                              alt={team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {team.shortCode || team.name.substring(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.shortCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-primary" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Check out the current standings and see how your predictions compare!
              </p>
              <Button onClick={handleLeaderboardClick} className="w-full">
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 