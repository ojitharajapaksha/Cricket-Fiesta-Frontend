"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Plus, Users, Trophy, Calendar, PlayCircle, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Tournament {
  id: string;
  name: string;
  description?: string;
  type: string;
  format: string;
  startDate: string;
  endDate: string;
  status: string;
  numberOfTeams: number;
  matches: any[];
  standings: any[];
}

interface Team {
  id: string;
  name: string;
  shortName: string;
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isGenerateMatchesOpen, setIsGenerateMatchesOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [matchGenerationData, setMatchGenerationData] = useState({
    venue: "",
    startTime: "",
    matchInterval: "180",
  });
  const router = useRouter();

  useEffect(() => {
    fetchTournament();
    fetchAllTeams();
  }, [resolvedParams.id]);

  const fetchTournament = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments/${resolvedParams.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tournament");

      const data = await response.json();
      setTournament(data.data);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      toast.error("Failed to load tournament");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch teams");

      const data = await response.json();
      setAllTeams(data.data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }

    if (addingTeam) return; // Prevent double submission
    setAddingTeam(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments/${resolvedParams.id}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: selectedTeamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add team");
      }

      toast.success("Team added successfully");
      setIsAddTeamOpen(false);
      setSelectedTeamId("");
      fetchTournament();
    } catch (error: any) {
      console.error("Error adding team:", error);
      toast.error(error.message || "Failed to add team");
    } finally {
      setAddingTeam(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to remove this team?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/tournaments/${resolvedParams.id}/teams/${teamId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to remove team");

      toast.success("Team removed successfully");
      fetchTournament();
    } catch (error) {
      console.error("Error removing team:", error);
      toast.error("Failed to remove team");
    }
  };

  const handleGenerateMatches = async () => {
    if (generatingMatches) return;
    setGeneratingMatches(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/tournaments/${resolvedParams.id}/generate-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(matchGenerationData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate matches");
      }

      const data = await response.json();
      toast.success(data.message);
      setIsGenerateMatchesOpen(false);
      fetchTournament();
    } catch (error: any) {
      console.error("Error generating matches:", error);
      toast.error(error.message || "Failed to generate matches");
    } finally {
      setGeneratingMatches(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("Tournament status updated");
      fetchTournament();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-500";
      case "ONGOING":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-6">
        <p>Tournament not found</p>
      </div>
    );
  }

  const availableTeams = allTeams.filter(
    (team) => !tournament.standings.some((s: any) => s.teamId === team.id)
  );

  return (
    <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {tournament.description || "No description"}
            </p>
          </div>
          <div className="flex gap-2">
            {tournament.status === "UPCOMING" && (
              <Button onClick={() => handleUpdateStatus("ONGOING")}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Tournament
              </Button>
            )}
            {tournament.status === "ONGOING" && (
              <Button onClick={() => handleUpdateStatus("COMPLETED")}>
                Complete Tournament
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tournament Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournament.type}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Match Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournament.format}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tournament.standings.length}/{tournament.numberOfTeams}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tournament.matches.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Participating Teams</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={
                            tournament.standings.length >= tournament.numberOfTeams
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Team to Tournament</DialogTitle>
                          <DialogDescription>
                            Select a team to add to this tournament
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Team</Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTeams.map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddTeamOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddTeam} disabled={addingTeam || !selectedTeamId}>
                              {addingTeam ? "Adding..." : "Add Team"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isGenerateMatchesOpen}
                      onOpenChange={setIsGenerateMatchesOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={tournament.standings.length < 2}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Generate Matches
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate Tournament Matches</DialogTitle>
                          <DialogDescription>
                            Configure match schedule settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Venue</Label>
                            <Input
                              value={matchGenerationData.venue}
                              onChange={(e) =>
                                setMatchGenerationData({
                                  ...matchGenerationData,
                                  venue: e.target.value,
                                })
                              }
                              placeholder="e.g., Main Ground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>First Match Date & Time</Label>
                            <Input
                              type="datetime-local"
                              value={matchGenerationData.startTime}
                              onChange={(e) =>
                                setMatchGenerationData({
                                  ...matchGenerationData,
                                  startTime: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Match Interval (minutes)</Label>
                            <Input
                              type="number"
                              value={matchGenerationData.matchInterval}
                              onChange={(e) =>
                                setMatchGenerationData({
                                  ...matchGenerationData,
                                  matchInterval: e.target.value,
                                })
                              }
                              placeholder="180"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsGenerateMatchesOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleGenerateMatches} disabled={generatingMatches}>
                              {generatingMatches ? "Generating..." : "Generate Matches"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tournament.standings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No teams added yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Short Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournament.standings.map((standing: any, index: number) => (
                        <TableRow key={standing.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {standing.team.name}
                          </TableCell>
                          <TableCell>{standing.team.shortName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeam(standing.teamId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Points Table</CardTitle>
              </CardHeader>
              <CardContent>
                {tournament.standings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No standings available
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pos</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                        <TableHead className="text-right">NRR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournament.standings.map((standing: any, index: number) => (
                        <TableRow key={standing.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{standing.team.name}</TableCell>
                          <TableCell className="text-center">
                            {standing.matchesPlayed}
                          </TableCell>
                          <TableCell className="text-center">{standing.wins}</TableCell>
                          <TableCell className="text-center">{standing.losses}</TableCell>
                          <TableCell className="text-center font-bold">
                            {standing.points}
                          </TableCell>
                          <TableCell className="text-right">
                            {standing.netRunRate?.toFixed(3) || "0.000"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {tournament.matches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No matches generated yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tournament.matches.map((match: any) => (
                      <Card key={match.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                Match #{match.matchNumber}
                                {match.round && ` - ${match.round}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(match.scheduledTime).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-center flex-1">
                              <div className="font-bold text-lg">
                                {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {match.venue}
                              </div>
                            </div>
                            <Badge>{match.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
