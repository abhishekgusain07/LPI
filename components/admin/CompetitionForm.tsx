"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { competitionCreate } from "@/utils/data/competition/competitionCreate";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type CompetitionFormData = {
  name: string;
  slug: string;
  sportType: 'cricket' | 'football' | 'basketball';
  logoUrl?: string;
  seasonDuration?: string;
};

export const CompetitionForm = () => {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { isSubmitting, errors } } = useForm<CompetitionFormData>({
    defaultValues: {
      sportType: 'football',
      name: '',
      slug: '',
      logoUrl: '',
      seasonDuration: ''
    }
  });

  const onSubmit = async (data: CompetitionFormData) => {
    try {
      console.log("Competition data being submitted:", data);
      
      await competitionCreate(data);
      toast.success("Competition created successfully");
      router.push("/contests");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Controller
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <Input 
              id="name" 
              {...field}
              onChange={(e) => {
                field.onChange(e);
                // Auto-generate slug when name changes
                const generatedSlug = generateSlug(e.target.value);
                // Update the slug field (this requires accessing form methods)
                control._formValues.slug = generatedSlug;
              }}
              placeholder="e.g., Premier League" 
              className={errors.name ? "border-red-500" : ""}
            />
          )}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Controller
          name="slug"
          control={control}
          rules={{ required: "Slug is required" }}
          render={({ field }) => (
            <Input 
              id="slug" 
              {...field}
              placeholder="e.g., premier-league" 
              className={errors.slug ? "border-red-500" : ""}
            />
          )}
        />
        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sportType">Sport Type</Label>
        <Controller
          name="sportType"
          control={control}
          rules={{ required: "Sport type is required" }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger className={errors.sportType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.sportType && <p className="text-red-500 text-sm">{errors.sportType.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Controller
          name="logoUrl"
          control={control}
          render={({ field }) => (
            <Input 
              id="logoUrl" 
              type="url"
              {...field}
              placeholder="https://example.com/logo.png" 
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seasonDuration">Season Duration</Label>
        <Controller
          name="seasonDuration"
          control={control}
          render={({ field }) => (
            <Input 
              id="seasonDuration" 
              {...field}
              placeholder="e.g., September-June" 
            />
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Competition"}
      </Button>
    </form>
  );
}; 