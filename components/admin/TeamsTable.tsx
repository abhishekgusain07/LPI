"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team } from "@/utils/data/team/getTeamsByContest";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TeamsTableProps {
  teams: Team[];
  onDeleteTeam?: (teamId: string) => Promise<void>;
}

export function TeamsTable({ teams, onDeleteTeam }: TeamsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const handleDelete = async (teamId: string) => {
    if (!onDeleteTeam) return;
    
    try {
      setDeletingId(teamId);
      await onDeleteTeam(teamId);
    } catch (error) {
      console.error("Failed to delete team:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageError = (teamId: string) => {
    setImageError(prev => ({ ...prev, [teamId]: true }));
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No teams found for this contest
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Short Code</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                {team.logoUrl && !imageError[team.id] ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <Image
                      src={team.logoUrl}
                      alt={team.name}
                      width={32}
                      height={32}
                      className="object-contain"
                      onError={() => handleImageError(team.id)}
                      priority={false}
                      unoptimized={true}
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {team.shortCode || team.name.substring(0, 2)}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.shortCode}</TableCell>
              <TableCell className="text-right">
                {onDeleteTeam && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(team.id)}
                    disabled={deletingId === team.id}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}