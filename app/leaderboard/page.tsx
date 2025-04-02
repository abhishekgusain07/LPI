"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllTimeLeaderboard, type AllTimeLeaderboardEntry } from "@/utils/data/leaderboard/getAllTimeLeaderboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { Award, Crown, Home, LayoutDashboard, Loader2, Medal, Share2, StarIcon, Trophy, Users, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AllTimeLeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<AllTimeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getAllTimeLeaderboard();
        setLeaderboard(data);
      } catch (error: any) {
        console.error("Error fetching all-time leaderboard:", error);
        
        // Check if error is authentication related
        if (error.message?.toLowerCase().includes("unauthorized") || 
            error.message?.toLowerCase().includes("user not found")) {
          setError("Please sign in to view the leaderboard");
        } else {
          setError(error.message || "Failed to load leaderboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Find top 3 users and current user
  const topUsers = leaderboard.slice(0, 3);
  const currentUser = leaderboard.find(user => user.isCurrentUser);
  
  // Filter leaderboard based on active tab
  const filteredLeaderboard = activeTab === "all"
    ? leaderboard
    : leaderboard.filter(user => user.contestsPlayed >= 5);

  // Get user rank badge with appropriate medal
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{rank}</div>;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.toLowerCase().includes("sign in") || 
                       error.toLowerCase().includes("unauthorized");
    
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto border-destructive/20">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              {isAuthError ? (
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              )}
            </div>
            <CardTitle className="text-center">
              {isAuthError ? "Sign in to View Leaderboard" : "Error Loading Leaderboard"}
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            {isAuthError ? (
              <Button className="w-full" onClick={() => router.push("/sign-in")}>
                Sign In
              </Button>
            ) : (
              <Button className="w-full" onClick={() => router.push("/")}>
                Return to Homepage
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => router.push("/contests")}>
              View Contests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            All-Time Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            The ultimate ranking of all players across all contests ever held
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/contests")}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          View Contests
        </Button>
      </div>

      {/* Top 3 Users Podium */}
      {topUsers.length > 0 && (
        <Card className="overflow-hidden border-none bg-gradient-to-b from-primary/10 to-transparent shadow-none">
          <CardContent className="pt-8 pb-6">
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              {topUsers.length > 1 && (
                <div className="flex flex-col items-center order-1">
                  <div className="relative mb-2">
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-slate-400">2nd</Badge>
                    </div>
                    <UserAvatar
                      imageUrl={topUsers[1].profileImageUrl}
                      fallbackName={`${topUsers[1].firstName || ''} ${topUsers[1].lastName || ''}`}
                      size="lg"
                    />
                  </div>
                  <div className="h-32 w-full rounded-t-lg bg-slate-400/20 border border-slate-400/30 flex flex-col items-center justify-end p-3">
                    <p className="font-semibold text-sm truncate max-w-full">
                      {topUsers[1].firstName} {topUsers[1].lastName}
                    </p>
                    <p className="font-bold text-xl">{topUsers[1].totalScore}</p>
                    <p className="text-xs text-muted-foreground">{topUsers[1].contestsPlayed} contests</p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topUsers.length > 0 && (
                <div className="flex flex-col items-center order-2">
                  <div className="relative mb-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-yellow-500">1st</Badge>
                    </div>
                    <UserAvatar
                      imageUrl={topUsers[0].profileImageUrl}
                      fallbackName={`${topUsers[0].firstName || ''} ${topUsers[0].lastName || ''}`}
                      size="lg"
                    />
                  </div>
                  <div className="h-40 w-full rounded-t-lg bg-yellow-500/20 border border-yellow-500/30 flex flex-col items-center justify-end p-3">
                    <p className="font-semibold text-sm truncate max-w-full">
                      {topUsers[0].firstName} {topUsers[0].lastName}
                    </p>
                    <p className="font-bold text-2xl">{topUsers[0].totalScore}</p>
                    <p className="text-xs text-muted-foreground">{topUsers[0].contestsPlayed} contests</p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topUsers.length > 2 && (
                <div className="flex flex-col items-center order-3">
                  <div className="relative mb-2">
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-amber-700">3rd</Badge>
                    </div>
                    <UserAvatar
                      imageUrl={topUsers[2].profileImageUrl}
                      fallbackName={`${topUsers[2].firstName || ''} ${topUsers[2].lastName || ''}`}
                      size="lg"
                    />
                  </div>
                  <div className="h-24 w-full rounded-t-lg bg-amber-700/20 border border-amber-700/30 flex flex-col items-center justify-end p-3">
                    <p className="font-semibold text-sm truncate max-w-full">
                      {topUsers[2].firstName} {topUsers[2].lastName}
                    </p>
                    <p className="font-bold text-xl">{topUsers[2].totalScore}</p>
                    <p className="text-xs text-muted-foreground">{topUsers[2].contestsPlayed} contests</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Leaderboard */}
      <Card className="overflow-hidden">
        {/* Current User Card - if exists */}
        {currentUser && (
          <div className="border-b border-border/80 bg-primary/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-semibold text-primary">
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
                    <Badge variant="secondary" className="ml-2">You</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">{currentUser.contestsPlayed} contests played</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-bold text-xl text-primary">{currentUser.totalScore}</p>
                <p className="text-xs text-muted-foreground">All-time points</p>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                {filteredLeaderboard.length} total participants
              </CardDescription>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[240px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Players</TabsTrigger>
                <TabsTrigger value="active">Active Players</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <div className="px-6 pb-3 flex items-center text-sm font-medium text-muted-foreground">
            <div className="w-[60px]">Rank</div>
            <div className="flex-1">Player</div>
            <div className="w-[100px] text-center">Contests</div>
            <div className="w-[100px] text-right">Points</div>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border/40">
              {filteredLeaderboard.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No participants yet</p>
                </div>
              ) : (
                filteredLeaderboard.map((user) => (
                  <div
                    key={user.userId}
                    className={cn(
                      "flex items-center px-6 py-4 group hover:bg-muted/50 transition-colors",
                      user.isCurrentUser && "bg-primary/5"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-[60px] flex items-center justify-center">
                      {getRankBadge(user.rank)}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <UserAvatar
                        imageUrl={user.profileImageUrl}
                        fallbackName={`${user.firstName || ''} ${user.lastName || ''}`}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.firstName} {user.lastName}
                          {user.isCurrentUser && (
                            <span className="inline-block ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        {user.rank <= 10 && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                            Top {user.rank === 1 ? "Player" : `${user.rank}0%`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Contest Count */}
                    <div className="w-[100px] text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-normal",
                          user.contestsPlayed >= 10 ? "border-green-500/20 text-green-500" : "",
                          user.contestsPlayed >= 5 && user.contestsPlayed < 10 ? "border-blue-500/20 text-blue-500" : "",
                          user.contestsPlayed < 5 ? "border-muted-foreground/20" : ""
                        )}
                      >
                        {user.contestsPlayed} {user.contestsPlayed === 1 ? "contest" : "contests"}
                      </Badge>
                    </div>
                    
                    {/* Points */}
                    <div className="w-[100px] text-right font-bold">
                      {user.totalScore}
                      <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 