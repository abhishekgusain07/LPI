"use client";

import { useState, useEffect } from "react";
import { CompetitionForm } from "@/components/admin/CompetitionForm";
import { ContestForm } from "@/components/admin/ContestForm";
import { ContestManagement } from "@/components/admin/ContestManagement";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { competitionGet } from "@/utils/data/competition/competitionGet";
import { contestGet, ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { getAdminStats, AdminStats } from "@/utils/data/admin/getAdminStats";
import { getContestPredictionCount } from "@/utils/data/contest/getContestPredictionCount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, PlusCircle, RefreshCw, BarChart3, Lock, AlertCircle, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the competition type
type Competition = {
  id: string;
  name: string;
};

// Admin email
const ADMIN_EMAIL = "valorantgusain@gmail.com";

export default function AdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [contests, setContests] = useState<ContestWithCompetition[]>([]);
  const [filteredContests, setFilteredContests] = useState<ContestWithCompetition[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterSport, setFilterSport] = useState("all");
  const [selectedContest, setSelectedContest] = useState<ContestWithCompetition | null>(null);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Check if the current user is an admin
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !user) {
        // If not signed in, redirect to sign-in page
        router.push("/sign-in");
        return;
      }

      const userEmail = user.primaryEmailAddress?.emailAddress;
      const hasAdminAccess = userEmail === ADMIN_EMAIL;
      
      setIsAdmin(hasAdminAccess);
      
      if (!hasAdminAccess) {
        toast.error("You don't have permission to access the admin area");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Load initial data only if the user is an admin
  useEffect(() => {
    const loadData = async () => {
      // Only load data if user is admin
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        
        // Load competitions
        const competitionsData = await competitionGet();
        setCompetitions(competitionsData);
        
        // Load contests
        const contestsData = await contestGet();
        setContests(contestsData);
        setFilteredContests(contestsData);
        
        // Load admin stats
        const statsData = await getAdminStats();
        setStats(statsData);
      } catch (error: any) {
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin]);

  // Filter contests when search term or filter sport changes
  useEffect(() => {
    let filtered = [...contests];
    
    // Apply sport filter
    if (filterSport !== "all") {
      filtered = filtered.filter(contest => 
        contest.competition.sportType.toLowerCase() === filterSport.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contest => 
        contest.competition.name.toLowerCase().includes(term) ||
        contest.year.toString().includes(term)
      );
    }
    
    setFilteredContests(filtered);
  }, [contests, searchTerm, filterSport]);

  // Get prediction count when selected contest changes
  useEffect(() => {
    const loadPredictionCount = async () => {
      // Skip if no contest is selected
      if (!selectedContest) return;
      
      try {
        const count = await getContestPredictionCount(selectedContest.id);
        setPredictionsCount(count);
      } catch (error: any) {
        console.error("Failed to load prediction count:", error);
        setPredictionsCount(0);
      }
    };
    
    loadPredictionCount();
  }, [selectedContest]);

  // If still checking authentication or if user is not admin, show appropriate message
  if (isAdmin === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Lock className="h-10 w-10 text-primary mb-4" />
          <p className="text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-destructive/10 p-8 rounded-lg max-w-md w-full flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-center mb-4">
            Sorry, you don't have permission to access the admin dashboard. 
            This area is restricted to administrators only.
          </p>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      setLoading(true);
      toast.info("Refreshing data...");
      
      // Reload all data
      const [competitionsData, contestsData, statsData] = await Promise.all([
        competitionGet(),
        contestGet(),
        getAdminStats()
      ]);
      
      setCompetitions(competitionsData);
      setContests(contestsData);
      setFilteredContests(contestsData);
      setStats(statsData);
      
      toast.success("Data refreshed successfully");
    } catch (error: any) {
      toast.error(`Failed to refresh data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContest = async (contest: ContestWithCompetition) => {
    setSelectedContest(contest);
    setActiveTab("contest");
  };

  const sportTypes = Array.from(new Set(contests.map(contest => 
    contest.competition.sportType.toLowerCase()
  )));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage competitions, contests, and view platform statistics
          </p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4">
          <TabsList className="mb-2 md:mb-0">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> 
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="contests">Contests</TabsTrigger>
            {selectedContest && (
              <TabsTrigger value="contest">
                Contest Management
              </TabsTrigger>
            )}
            <TabsTrigger value="leaderboard" className="flex items-center gap-2" onClick={() => router.push("/admin/leaderboard")}>
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>
          
          {(activeTab === "contests" || activeTab === "dashboard") && (
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contests..."
                  className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={filterSport}
                onValueChange={setFilterSport}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sportTypes.map(sport => (
                    <SelectItem key={sport} value={sport} className="capitalize">
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="dashboard" className="space-y-8">
          {stats ? (
            <>
              <DashboardStats stats={stats} />
              <div className="flex justify-end">
                <Button 
                  onClick={() => router.push("/admin/leaderboard")}
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Show Leaderboard
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading statistics...
            </div>
          )}
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Contests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContests.slice(0, 6).map(contest => (
                <Card 
                  key={contest.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleSelectContest(contest)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">
                        {contest.competition.name} {contest.year}
                      </CardTitle>
                      <Badge 
                        variant={contest.isActive ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {contest.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize mr-2">
                        {contest.competition.sportType}
                      </Badge>
                      Click to manage
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Competition</h2>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <CompetitionForm />
          </div>
        </TabsContent>

        <TabsContent value="contests" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Contest</h2>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <ContestForm competitions={competitions} />
          </div>
          
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Manage Contests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContests.map(contest => (
                <Card 
                  key={contest.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleSelectContest(contest)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">
                        {contest.competition.name} {contest.year}
                      </CardTitle>
                      <Badge 
                        variant={contest.isActive ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {contest.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize mr-2">
                        {contest.competition.sportType}
                      </Badge>
                      Click to manage
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredContests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No contests found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contest">
          {selectedContest && (
            <ContestManagement 
              contest={selectedContest} 
              predictionsCount={predictionsCount}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 