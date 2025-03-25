"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { competitionCreate } from "@/utils/data/competition/competitionCreate";
import { useState } from "react";
import { toast } from "sonner";

export const CompetitionForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      sportType: formData.get("sportType") as 'cricket' | 'football' | 'basketball',
      logoUrl: formData.get("logoUrl") as string,
      seasonDuration: formData.get("seasonDuration") as string,
    };

    try {
      await competitionCreate(data);
      toast.success("Competition created successfully");
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="e.g., Premier League" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder="e.g., premier-league" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sportType">Sport Type</Label>
        <Select name="sportType" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cricket">Cricket</SelectItem>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://example.com/logo.png" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seasonDuration">Season Duration</Label>
        <Input id="seasonDuration" name="seasonDuration" placeholder="e.g., September-June" />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Competition"}
      </Button>
    </form>
  );
}; 