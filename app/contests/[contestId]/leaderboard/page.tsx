"use client";

import { useEffect, useState } from "react";
import { getContestById } from "@/utils/data/contest/getContestById";
import { getContestLeaderboard, type LeaderboardEntry } from "@/utils/data/leaderboard/getContestLeaderboard";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@clerk/nextjs";
import { getHistoricalContestWinners, ContestWinner } from "@/utils/data/leaderboard/getHistoricalContestWinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
        <p className="mt-4">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contest
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{contestData?.title || "Contest"} Leaderboard</h1>
        <p className="text-muted-foreground">
          {contestData?.competitionTitle
            ? `For ${contestData.competitionTitle} ${contestData.year}`
            : ""}
        </p>
        {contestData?.competition?.sportType && (
          <Badge variant="outline" className="capitalize mt-2">
            {contestData.competition.sportType}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="current" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="current">Current Standings</TabsTrigger>
          <TabsTrigger value="historical">Historical Winners</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          {/* Current User Section (if logged in and in leaderboard) */}
          {currentUser && (
            <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h2 className="text-lg font-semibold mb-3">Your Ranking</h2>
              <div className="flex items-center gap-4">
                <div className="flex-none w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold">
                  {currentUser.rank}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <UserAvatar
                    imageUrl={currentUser.profileImageUrl}
                    fallbackName={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">
                      {currentUser.firstName} {currentUser.lastName}{" "}
                      <span className="inline-block ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded">
                        You
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex-none">
                  <p className="font-bold text-lg">{currentUser.score}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Leaderboard */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Leaderboard</h2>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <p>No participants yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Rank</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Participant</th>
                      <th className="py-3 px-4 text-right font-medium text-muted-foreground">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`border-b hover:bg-muted/20 ${
                          entry.isCurrentUser ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4">{entry.rank}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              imageUrl={entry.profileImageUrl}
                              fallbackName={`${entry.firstName || ''} ${entry.lastName || ''}`}
                              size="sm"
                            />
                            <span>
                              {entry.firstName} {entry.lastName}{" "}
                              {entry.isCurrentUser && (
                                <span className="inline-block ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs rounded">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>Historical Winners: {contestData?.competition?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {historicalWinners.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No historical data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historicalWinners.map((winner) => (
                    <div key={winner.year} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {winner.firstName} {winner.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {winner.year} Winner
                        </p>
                      </div>
                      <div className="font-bold">{winner.score} pts</div>
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