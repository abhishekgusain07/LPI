import { CompetitionForm } from "@/components/admin/CompetitionForm";
import { ContestForm } from "@/components/admin/ContestForm";
import { competitionGet } from "@/utils/data/competition/competitionGet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const competitions = await competitionGet();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="competitions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="contests">Contests</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Competition</h2>
            <CompetitionForm />
          </div>
        </TabsContent>

        <TabsContent value="contests" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Contest</h2>
            <ContestForm competitions={competitions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 