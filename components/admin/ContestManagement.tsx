"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TeamForm } from "./TeamForm";
import { Team, getTeamsByContest } from "@/utils/data/team/getTeamsByContest";
import { teamDelete } from "@/utils/data/team/teamDelete";
import { Trophy, Loader2, Users, Calendar } from "lucide-react";
import { ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { format } from "date-fns";
import { TeamsTable } from "./TeamsTable";

interface ContestManagementProps {
  contest: ContestWithCompetition;
  predictionsCount: number;
}

export function ContestManagement({ contest, predictionsCount }: ContestManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getTeamsByContest(contest.id);
        setTeams(teamsData);
      } catch (error: any) {
        toast.error(`Failed to load teams: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [contest.id, refreshCounter]);

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await teamDelete(teamId);
      toast.success("Team deleted successfully");
      setRefreshCounter(prev => prev + 1);
    } catch (error: any) {
      toast.error(`Failed to delete team: ${error.message}`);
    }
  };

  const refreshTeams = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {contest.competition.name} {contest.year}
          </h1>
          <p className="text-muted-foreground">
            Manage contest details, teams, and statistics
          </p>
        </div>
        <Button variant="secondary" onClick={refreshTeams}>
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sport Type</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{contest.competition.sportType}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total participants entered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(contest.predictionDeadline), 'MMM dd, yyyy')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(contest.predictionDeadline), 'h:mm a')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Teams Management</TabsTrigger>
          <TabsTrigger value="settings">Contest Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Team</CardTitle>
              </CardHeader>
              <CardContent>
                <TeamForm 
                  contestId={contest.id} 
                  key={refreshCounter} // Reset form on refresh
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Teams ({teams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <TeamsTable 
                    teams={teams} 
                    onDeleteTeam={handleDeleteTeam}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Contest Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contest settings management is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 