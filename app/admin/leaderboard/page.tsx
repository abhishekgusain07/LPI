"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getContestLeaderboard, LeaderboardEntry } from "@/utils/data/leaderboard/getContestLeaderboard";
import { getHistoricalContestWinners, ContestWinner } from "@/utils/data/leaderboard/getHistoricalContestWinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db/drizzle";
import { contests, competitions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define Contest type based on schema
type Contest = {
  id: string;
  year: number;
  competition: {
    id: string;
    name: string;
  };
};

// Function to get all contests
const getContests = async (): Promise<Contest[]> => {
  try {
    const contestsData = await db
      .select({
        id: contests.id,
        year: contests.year,
        competitionId: competitions.id,
        competitionName: competitions.name,
      })
      .from(contests)
      .innerJoin(competitions, eq(contests.competitionId, competitions.id));

    return contestsData.map(contest => ({
      id: contest.id,
      year: contest.year,
      competition: {
        id: contest.competitionId,
        name: contest.competitionName,
      },
    }));
  } catch (error) {
    console.error("Error fetching contests:", error);
    return [];
  }
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>("");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<ContestWinner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("current");

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestsData = await getContests();
        setContests(contestsData);
        
        // Extract unique competitions
        const uniqueCompetitions = Array.from(
          new Map(
            contestsData.map((contest: Contest) => [
              contest.competition.id,
              { 
                id: contest.competition.id, 
                name: contest.competition.name 
              }
            ])
          ).values()
        );
        
        setCompetitions(uniqueCompetitions as { id: string; name: string }[]);
        
        if (uniqueCompetitions.length > 0) {
          const firstComp = uniqueCompetitions[0] as { id: string; name: string };
          setSelectedCompetitionId(firstComp.id);
        }
        
        // Get the URL search params
        const searchParams = new URLSearchParams(window.location.search);
        const contestIdParam = searchParams.get('contestId');
        
        // If a contest ID was provided, use it
        if (contestIdParam) {
          setSelectedContestId(contestIdParam);
          
          // Also set the competition ID
          const selectedContest = contestsData.find((c) => c.id === contestIdParam);
          if (selectedContest) {
            setSelectedCompetitionId(selectedContest.competition.id);
          }
        } else if (contestsData.length > 0) {
          // Otherwise use the first contest
          setSelectedContestId(contestsData[0].id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contests:", error);
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (selectedContestId) {
        try {
          const data = await getContestLeaderboard(selectedContestId);
          setLeaderboard(data);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        }
      }
    };

    fetchLeaderboard();
  }, [selectedContestId]);

  useEffect(() => {
    const fetchHistoricalWinners = async () => {
      if (selectedCompetitionId) {
        try {
          const data = await getHistoricalContestWinners(selectedCompetitionId);
          setHistoricalWinners(data);
        } catch (error) {
          console.error("Error fetching historical winners:", error);
        }
      }
    };

    fetchHistoricalWinners();
  }, [selectedCompetitionId]);

  const handleContestChange = (value: string) => {
    setSelectedContestId(value);
  };

  const handleCompetitionChange = (value: string) => {
    setSelectedCompetitionId(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contest Leaderboards</h1>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Leaderboard</TabsTrigger>
          <TabsTrigger value="historical">Historical Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contest Leaderboard</CardTitle>
              <div className="mt-2">
                <Select
                  value={selectedContestId}
                  onValueChange={handleContestChange}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a contest" />
                  </SelectTrigger>
                  <SelectContent>
                    {contests.map((contest) => (
                      <SelectItem key={contest.id} value={contest.id}>
                        {contest.competition.name} {contest.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center py-6">No leaderboard data available for this contest.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-right py-3 px-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr 
                          key={entry.id}
                          className={`
                            border-b hover:bg-muted/50 transition-colors 
                            ${entry.isCurrentUser ? "bg-primary/10" : ""}
                          `}
                        >
                          <td className="py-3 px-4">
                            {entry.rank === 1 && (
                              <Badge className="bg-yellow-500">
                                <Trophy className="h-3 w-3 mr-1" />
                                {entry.rank}
                              </Badge>
                            )}
                            {entry.rank === 2 && (
                              <Badge className="bg-gray-400">
                                {entry.rank}
                              </Badge>
                            )}
                            {entry.rank === 3 && (
                              <Badge className="bg-amber-700">
                                {entry.rank}
                              </Badge>
                            )}
                            {entry.rank > 3 && entry.rank}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.profileImageUrl || ""} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {entry.firstName || entry.lastName
                                  ? `${entry.firstName || ""} ${entry.lastName || ""}`
                                  : "Anonymous User"}
                                {entry.isCurrentUser && (
                                  <Badge variant="outline" className="ml-2">You</Badge>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Contest Winners</CardTitle>
              <div className="mt-2">
                <Select
                  value={selectedCompetitionId}
                  onValueChange={handleCompetitionChange}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a competition" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {historicalWinners.length === 0 ? (
                <p className="text-center py-6">No historical winners data available for this competition.</p>
              ) : (
                <div className="grid gap-4">
                  {historicalWinners.map((winner) => (
                    <div 
                      key={winner.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={winner.profileImageUrl || ""} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {winner.firstName || winner.lastName
                              ? `${winner.firstName || ""} ${winner.lastName || ""}`
                              : "Anonymous User"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {winner.competitionName} {winner.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{winner.score} points</span>
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
} 