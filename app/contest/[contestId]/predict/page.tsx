"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormEvent, useEffect, useState } from "react";
import React from "react"; // Import React
// NOTE: You need to install this package: npm install @hello-pangea/dnd
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { getContestWithTeams, ContestWithTeams, Team } from "@/utils/data/contest/getContestWithTeams";
import { toast } from "sonner";
import { AlertCircle, Calendar, Clock, InfoIcon, Loader2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveContestPrediction } from "@/utils/data/prediction/saveContestPrediction";
import { getUserPrediction, PredictionWithTeams } from "@/utils/data/prediction/getUserPrediction";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { format, isBefore } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PredictionPage({ params }: { params: { contestId: string } }) {
  const contestId = params.contestId;
  
  const [contest, setContest] = useState<ContestWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [existingPrediction, setExistingPrediction] = useState<PredictionWithTeams | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [hasPrediction, setHasPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contest data with teams
        const contestData = await getContestWithTeams(contestId);
        setContest(contestData);
        
        if (!contestData) {
          throw new Error("Contest not found");
        }
        
        // Make sure we have teams for this contest
        if (!contestData.teams || contestData.teams.length === 0) {
          setError("No teams found for this contest. Please ask an administrator to add teams.");
          return;
        }
        
        // Set deadline date and check if past deadline
        if (contestData.predictionDeadline) {
          const deadline = new Date(contestData.predictionDeadline);
          setDeadlineDate(deadline);
          setIsPastDeadline(isBefore(deadline, new Date()));
        }
        
        // Fetch user's existing prediction if any
        const userPrediction = await getUserPrediction(contestId);
        setExistingPrediction(userPrediction);
        
        // If the user has an existing prediction, use that order
        if (userPrediction && userPrediction.entries && userPrediction.entries.length > 0) {
          setHasPrediction(true);
          
          // Map the teams to the order from the prediction
          const orderedTeams = userPrediction.entries
            .sort((a, b) => a.position - b.position)
            .map(entry => ({
              id: entry.team.id,
              name: entry.team.name,
              shortCode: entry.team.shortCode,
              logoUrl: entry.team.logoUrl,
            }));
            
          setTeams(orderedTeams);
        } 
        // Otherwise, use the teams from the contest
        else {
          setTeams(contestData.teams);
        }
      } catch (error: any) {
        const errorMessage = error.message || "Failed to load contest";
        console.error("Error fetching contest data:", error);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(teams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTeams(items);
  };

  const handleSavePrediction = async () => {
    if (isPastDeadline) {
      toast.error("The deadline for predictions has passed");
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (teams.length === 0) {
      console.error("No teams available to save prediction");
      toast.error("No teams to predict");
      return;
    }

    try {
      setSubmitting(true);
      console.log("Starting to save prediction for contest:", contestId);
      console.log("Teams data:", teams);
      
      // Validate that all teams have valid IDs before proceeding
      const invalidTeams = teams.filter(team => !team.id || team.id.trim() === "");
      if (invalidTeams.length > 0) {
        console.error("Found teams with invalid IDs:", invalidTeams);
        toast.error("Some teams have invalid IDs and cannot be saved");
        return;
      }
      
      // Create prediction entries mapping team positions
      const predictionEntries = teams.map((team, index) => ({
        teamId: team.id,
        position: index + 1, // Position is 1-indexed
      }));
      
      console.log("Prediction entries prepared:", predictionEntries);
      
      try {
        const result = await saveContestPrediction(contestId, predictionEntries);
        console.log("Prediction save result:", result);
        
        if (!result || !result.success) {
          throw new Error("Failed to save prediction - no success status returned");
        }
        
        if (result.entriesCount !== teams.length) {
          console.warn("Not all teams were saved in the prediction", {
            teamsCount: teams.length,
            savedCount: result.entriesCount
          });
        }
        
        setHasPrediction(true);
        setShowConfirmDialog(false);
        
        // Show success message with a promise to ensure it's visible before redirect
        const message = existingPrediction ? "Your prediction has been updated!" : "Your prediction has been saved!";
        
        toast.success(message, {
          duration: 2000,
          description: "You'll be redirected to the contests page in a moment."
        });
        
        // Delay redirect slightly to allow toast to be seen
        setTimeout(() => {
          router.push("/contests");
        }, 1500);
      } catch (saveError: any) {
        console.error("Error from saveContestPrediction:", saveError);
        throw saveError; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error("Error saving prediction:", error);
      setShowConfirmDialog(false);
      toast.error(error.message || "Failed to save prediction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button onClick={() => router.push("/contests")} className="mt-4">
          Return to Contests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {contest?.competition?.name || "Contest"} {contest?.year || ""}
        </h1>
        <p className="text-muted-foreground">
          Drag and drop teams to predict their final position. Position 1 is the winner.
        </p>
        
        {deadlineDate && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Prediction deadline: {format(deadlineDate, "PPP 'at' p")}
            </span>
          </div>
        )}
        
        {hasPrediction && !isPastDeadline && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            You have already submitted a prediction. You can update it until the deadline.
          </div>
        )}
      </div>

      {isPastDeadline && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deadline Passed</AlertTitle>
          <AlertDescription>
            The deadline for submitting predictions has passed. You can view your prediction but cannot update it.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {hasPrediction ? "Your Prediction" : "Make Your Prediction"}
          </CardTitle>
          <CardDescription>
            {isPastDeadline 
              ? "This is your final prediction. The deadline has passed and no changes can be made."
              : hasPrediction 
                ? "You can update your prediction by dragging teams into a different order."
                : "Rearrange teams by dragging them into your predicted final order"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Teams Available</AlertTitle>
              <AlertDescription>
                There are no teams available for this contest. Please contact an administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="teams" isDropDisabled={isPastDeadline}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {teams.map((team, index) => (
                      <Draggable 
                        key={team.id} 
                        draggableId={team.id} 
                        index={index}
                        isDragDisabled={isPastDeadline}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center gap-3 p-3 bg-card border rounded-lg ${isPastDeadline ? 'opacity-80' : 'hover:bg-accent/10'} transition-colors`}
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            
                            {team.logoUrl && (
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img 
                                  src={team.logoUrl} 
                                  alt={team.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <p className="font-medium">{team.name}</p>
                              {team.shortCode && (
                                <p className="text-xs text-muted-foreground">{team.shortCode}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSavePrediction}
            disabled={submitting || isPastDeadline || teams.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Prediction...
              </>
            ) : isPastDeadline ? (
              "Prediction Deadline Passed"
            ) : teams.length === 0 ? (
              "No Teams Available"
            ) : hasPrediction ? (
              "Update Prediction"
            ) : (
              "Save Prediction"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasPrediction ? "Update Your Prediction" : "Confirm Your Prediction"}</DialogTitle>
            <DialogDescription>
              Please review your team predictions carefully. You can update your prediction any time until the deadline ({deadlineDate ? format(deadlineDate, "PPP") : "deadline date"}), but after that, no changes will be possible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                Predictions can be updated until the deadline. After the deadline, all predictions will be locked.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasPrediction ? (
                "Confirm & Update"
              ) : (
                "Confirm & Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 