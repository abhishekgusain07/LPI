"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ContestWithCompetition } from "@/utils/data/contest/contestGet";
import { CalendarDays, Clock, Trophy, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ContestCardProps {
  contest: ContestWithCompetition;
}

export const ContestCard = ({ contest }: ContestCardProps) => {
  const router = useRouter();
  const now = new Date();
  const isRegistrationOpen = new Date(contest.predictionDeadline) > now;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {contest.competition.name} {contest.year}
            </h3>
            <p className="text-sm text-muted-foreground">
              Make your predictions and compete!
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="capitalize shrink-0 bg-primary/10 text-primary border-primary/20"
          >
            {contest.competition.sportType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-green-500" />
            <span>{format(new Date(contest.startTime), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-red-500" />
            <span>{format(new Date(contest.endTime), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span>Register by {format(new Date(contest.predictionDeadline), "MMM d, h:mm a")}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group/btn relative"
          onClick={() => router.push(`/contests/${contest.id}`)}
        >
          <span className="flex items-center gap-2 group-hover/btn:translate-x-[-4px] transition-transform">
            <Trophy className="h-4 w-4" />
            {isRegistrationOpen ? "Join Contest" : "View Contest"}
          </span>
          <ArrowRight className="h-4 w-4 absolute right-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
        </Button>
      </CardFooter>
    </Card>
  )
}; 