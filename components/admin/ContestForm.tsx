"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { contestCreate } from "@/utils/data/contest/contestCreate";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Competition = {
  id: string;
  name: string;
};

type ContestFormData = {
  competitionId: string;
  year: number;
  startTime: string;
  endTime: string;
  predictionDeadline: string;
  isActive: boolean;
};

export const ContestForm = ({ competitions }: { competitions: Competition[] }) => {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<ContestFormData>({
    defaultValues: {
      isActive: true,
      competitionId: competitions.length > 0 ? competitions[0].id : ""
    }
  });

  const onSubmit = async (data: ContestFormData) => {
    try {
      console.log("Contest data being submitted:", data);
      
      await contestCreate({
        ...data,
        year: parseInt(data.year.toString()),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        predictionDeadline: new Date(data.predictionDeadline),
      });
      toast.success("Contest created successfully");
      router.push("/contests");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="competitionId">Competition</Label>
        <Controller
          name="competitionId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
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
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input 
          id="year" 
          type="number" 
          {...register("year", { 
            required: true,
            min: 2000,
            max: 2100,
            valueAsNumber: true
          })}
          placeholder="e.g., 2024" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input 
          id="startTime" 
          type="datetime-local" 
          {...register("startTime", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End Time</Label>
        <Input 
          id="endTime" 
          type="datetime-local" 
          {...register("endTime", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="predictionDeadline">Prediction Deadline</Label>
        <Input 
          id="predictionDeadline" 
          type="datetime-local" 
          {...register("predictionDeadline", { required: true })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive" 
          {...register("isActive")}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Contest"}
      </Button>
    </form>
  );
}; 