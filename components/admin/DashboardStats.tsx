"use client";

import { AdminStats } from "@/utils/data/admin/getAdminStats";
import { 
  Activity,
  CalendarDays, 
  Clock, 
  TrendingUp, 
  Trophy, 
  Users 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardStatsProps {
  stats: AdminStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Calculate percentages for visualizations
  const totalContestPercentage = Math.round((stats.activeContests / Math.max(stats.totalContests, 1)) * 100);
  
  // Get the total participants across all contests
  const totalParticipants = stats.contestStats.reduce((sum, contest) => sum + contest.entrantsCount, 0);
  
  // Find most popular contest (most participants)
  const sortedByPopularity = [...stats.contestStats].sort((a, b) => b.entrantsCount - a.entrantsCount);
  const mostPopularContest = sortedByPopularity.length > 0 ? sortedByPopularity[0] : null;
  
  // Find contests with no teams
  const contestsWithNoTeams = stats.contestStats.filter(contest => contest.teamsCount === 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
            <Trophy className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContests}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                {totalContestPercentage}% of total contests
              </p>
              <Progress value={totalContestPercentage} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompetitions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {Array.from(new Set(stats.contestStats.map(c => c.sportType))).length} sports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalPredictions} predictions made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalContests > 0 
                ? Math.round((totalParticipants / stats.totalContests) * 10) / 10 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg participants per contest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {mostPopularContest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Most Popular Contest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-base">
                    {mostPopularContest.name} {mostPopularContest.year}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mostPopularContest.sportType}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {mostPopularContest.entrantsCount} participants
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Contests Needing Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contestsWithNoTeams.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-500">
                  {contestsWithNoTeams.length} contest(s) need teams
                </p>
                <ul className="space-y-1 text-sm">
                  {contestsWithNoTeams.slice(0, 3).map(contest => (
                    <li key={contest.id} className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {contest.name} {contest.year}
                      </span>
                    </li>
                  ))}
                  {contestsWithNoTeams.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      + {contestsWithNoTeams.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500 font-medium">
                  All contests have teams
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Contest Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedByPopularity.slice(0, 4).map(contest => (
                <div key={contest.id} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="truncate max-w-[180px]">
                      {contest.name} {contest.year}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {contest.entrantsCount}
                    </span>
                  </div>
                  <Progress 
                    value={mostPopularContest 
                      ? (contest.entrantsCount / mostPopularContest.entrantsCount) * 100 
                      : 0} 
                    className="h-1" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 