"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { contestCreate } from "@/utils/data/contest/contestCreate";
import { useState } from "react";
import { toast } from "sonner";

type Competition = {
  id: string;
  name: string;
};

export const ContestForm = ({ competitions }: { competitions: Competition[] }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      competitionId: formData.get("competitionId") as string,
      year: parseInt(formData.get("year") as string),
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
      predictionDeadline: new Date(formData.get("predictionDeadline") as string),
      isActive: formData.get("isActive") === "true",
    };

    try {
      await contestCreate(data);
      toast.success("Contest created successfully");
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="competitionId">Competition</Label>
        <Select name="competitionId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map((competition) => (
              <SelectItem key={competition.id} value={competition.id}>
                {competition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input 
          id="year" 
          name="year" 
          type="number" 
          required 
          min={2000} 
          max={2100}
          placeholder="e.g., 2024" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input id="startTime" name="startTime" type="datetime-local" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End Time</Label>
        <Input id="endTime" name="endTime" type="datetime-local" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="predictionDeadline">Prediction Deadline</Label>
        <Input id="predictionDeadline" name="predictionDeadline" type="datetime-local" required />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" name="isActive" defaultChecked />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Contest"}
      </Button>
    </form>
  );
}; 