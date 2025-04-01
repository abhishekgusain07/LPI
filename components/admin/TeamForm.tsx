"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamCreateProps, teamCreate } from "@/utils/data/team/teamCreate";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type TeamFormData = Omit<TeamCreateProps, 'contestId'>;

export const TeamForm = ({ contestId }: { contestId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<TeamFormData>({
    defaultValues: {
      name: '',
      shortCode: '',
      logoUrl: ''
    }
  });

  const onSubmit = async (data: TeamFormData) => {
    if (!contestId) {
      toast.error("Contest ID is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the team using the server action
      await teamCreate({
        contestId,
        ...data
      });
      
      toast.success(`Team "${data.name}" added successfully`);
      reset(); // Clear the form
    } catch (error: any) {
      toast.error(`Failed to add team: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Team name is required" })}
          placeholder="e.g., Manchester United"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortCode">Short Code</Label>
        <Input
          id="shortCode"
          {...register("shortCode", { 
            required: "Short code is required",
            maxLength: { value: 4, message: "Short code cannot exceed 4 characters" }
          })}
          placeholder="e.g., MUN"
          className={errors.shortCode ? "border-red-500" : ""}
        />
        {errors.shortCode && <p className="text-red-500 text-sm">{errors.shortCode.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          type="url"
          {...register("logoUrl")}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding Team..." : "Add Team"}
      </Button>
    </form>
  );
}; 