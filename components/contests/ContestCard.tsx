"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { contestRegister } from "@/utils/data/contest/contestRegister";
import { getUserPrediction } from "@/utils/data/prediction/getUserPrediction";
import { format } from "date-fns";
import { CalendarDays, Clock, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ContestCard = ({ contest }: { contest: ContestWithCompetition }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEnteredContest, setHasEnteredContest] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserPrediction = async () => {
      try {
        setIsCheckingStatus(true);
        const prediction = await getUserPrediction(contest.id);
        setHasEnteredContest(prediction !== null);
      } catch (error) {
        // Silent fail - if we can't check prediction status, assume not entered
        console.error("Failed to check prediction status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkUserPrediction();
  }, [contest.id]);

  const handleAction = async () => {
    if (hasEnteredContest) {
      // If already entered, just navigate to prediction page
      router.push(`/contest/${contest.id}/predict`);
      return;
    }

    try {
      setIsRegistering(true);
      const result = await contestRegister(contest.id);
      toast.success("Successfully registered for the contest!");
      
      // Redirect to the prediction page
      router.push(`/contest/${contest.id}/predict`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const now = new Date();
  const isRegistrationOpen = new Date(contest.predictionDeadline) > now;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{contest.competition.name}</CardTitle>
          <Badge 
            variant="outline" 
            className="capitalize bg-primary/5"
          >
            {contest.competition.sportType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span>Season {contest.year}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-green-500" />
              <span>Starts: {format(new Date(contest.startTime), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-red-500" />
              <span>Ends: {format(new Date(contest.endTime), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Register by: {format(new Date(contest.predictionDeadline), "PPP")}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleAction}
          disabled={(!isRegistrationOpen && !hasEnteredContest) || isRegistering || isCheckingStatus}
        >
          {isCheckingStatus ? "Checking..." :
           isRegistering ? "Registering..." : 
           !isRegistrationOpen && !hasEnteredContest ? "Registration Closed" : 
           hasEnteredContest ? "View Prediction" : 
           "Enter Contest"}
        </Button>
      </CardFooter>
    </Card>
  );
}; 