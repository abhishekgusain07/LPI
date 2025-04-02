"use client";

import { useEffect, useState } from "react";
import { getContestById } from "@/utils/data/contest/getContestById";
import { getContestLeaderboard, type LeaderboardEntry } from "@/utils/data/leaderboard/getContestLeaderboard";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Loader2, Medal } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@clerk/nextjs";
import { getHistoricalContestWinners, ContestWinner } from "@/utils/data/leaderboard/getHistoricalContestWinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import LoadingSpinner directly or define it inline if import isn't working
const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }[size];
  
  return <Loader2 className={`${sizeClass} animate-spin text-primary`} />;
};

const ContestLeaderboardPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId: currentClerkId } = useAuth();
  const contestId = params?.contestId as string;
  const [loading, setLoading] = useState(true);
  const [contestData, setContestData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<ContestWinner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("current");

  const fetchData = async () => {
    console.log("Leaderboard page loaded for contest ID:", contestId);
    
    if (!contestId) {
      console.error("No contest ID provided");
      setError("No contest ID provided");
      setLoading(false);
      return;
    }

    try {
      // Fetch contest data
      const contest = await getContestById(contestId);
      console.log("Contest data fetched:", contest);
      
      if (!contest) {
        console.error("Contest not found");
        setError("Contest not found");
        setLoading(false);
        return;
      }
      
      setContestData(contest);
      
      // Fetch leaderboard data
      const leaderboardData = await getContestLeaderboard(contestId);
      console.log("Leaderboard data fetched:", leaderboardData);
      
      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contestId]);

  // Fetch historical winners when contest is loaded
  useEffect(() => {
    const fetchHistoricalWinners = async () => {
      if (!contestData?.competition?.id) return;
      
      try {
        const data = await getHistoricalContestWinners(contestData.competition.id);
        setHistoricalWinners(data);
      } catch (error) {
        console.error("Error fetching historical winners:", error);
      }
    };

    if (contestData) {
      fetchHistoricalWinners();
    }
  }, [contestData]);

  const handleBack = () => {
    console.log("Back button clicked, navigating to:", `/contests/${contestId}`);
    router.push(`/contests/${contestId}`);
  };

  // Find current user in leaderboard
  const currentUser = leaderboard.find(entry => entry.isCurrentUser);
  
  // Filter out current user from the main leaderboard to avoid duplication
  const otherParticipants = leaderboard.filter(entry => !entry.isCurrentUser);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="container py-8 flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="border border-destructive/20 bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/contests")}
          >
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">🥇 1st</Badge>;
    }
    if (rank === 2) {
      return <Badge className="bg-zinc-300/20 text-zinc-300 border-zinc-300/50">🥈 2nd</Badge>;
    }
    if (rank === 3) {
      return <Badge className="bg-amber-700/20 text-amber-700 border-amber-700/50">🥉 3rd</Badge>;
    }
    return <span className="text-muted-foreground">{rank}th</span>;
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-accent"
          onClick={() => router.push(`/contests/${contestId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contest
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{contestData?.title || "Contest"} Leaderboard</h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            {contestData?.competitionTitle
              ? `${contestData.competitionTitle} ${contestData.year}`
              : ""}
          </p>
          {contestData?.competition?.sportType && (
            <Badge variant="secondary" className="capitalize">
              {contestData.competition.sportType}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="current" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="current">Current Standings</TabsTrigger>
          <TabsTrigger value="historical">Historical Winners</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          {/* Current User Section */}
          {currentUser && (
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-none w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-lg">
                    {currentUser.rank}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <UserAvatar
                      imageUrl={currentUser.profileImageUrl}
                      fallbackName={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium text-lg">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <Badge variant="secondary" className="mt-1">Your Position</Badge>
                    </div>
                  </div>
                  <div className="flex-none text-right">
                    <p className="font-bold text-2xl text-primary">{currentUser.score}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>All Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No participants yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Rank</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Participant</th>
                        <th className="py-3 px-4 text-right font-medium text-muted-foreground">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.id}
                          className={cn(
                            "group transition-colors hover:bg-muted/50",
                            entry.isCurrentUser && "bg-primary/5"
                          )}
                        >
                          <td className="py-4 px-4">
                            {getRankBadge(entry.rank)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                imageUrl={entry.profileImageUrl}
                                fallbackName={`${entry.firstName || ''} ${entry.lastName || ''}`}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">
                                  {entry.firstName} {entry.lastName}
                                </p>
                                {entry.isCurrentUser && (
                                  <p className="text-xs text-primary">You</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-semibold">{entry.score}</span>
                            <span className="text-muted-foreground ml-1 text-sm">pts</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>Historical Winners</CardTitle>
              <p className="text-sm text-muted-foreground">Past champions of {contestData?.competition?.name}</p>
            </CardHeader>
            <CardContent>
              {historicalWinners.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No historical data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historicalWinners.map((winner) => (
                    <div 
                      key={winner.year} 
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="bg-primary/10 p-2.5 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            imageUrl={winner.profileImageUrl}
                            fallbackName={`${winner.firstName || ''} ${winner.lastName || ''}`}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium truncate">
                              {winner.firstName} {winner.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {winner.year} Champion
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{winner.score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestLeaderboardPage; 