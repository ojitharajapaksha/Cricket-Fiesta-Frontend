"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trophy, Calendar, Users, Edit, Trash2, PlayCircle } from "lucide-react";

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
  maxPlayersPerTeam?: number;
  minPlayersPerTeam?: number;
  entryFee?: number;
  prizePool?: number;
  matches: any[];
  standings: any[];
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "LEAGUE",
    format: "T20",
    startDate: "",
    endDate: "",
    numberOfTeams: "",
    maxPlayersPerTeam: "11",
    minPlayersPerTeam: "8",
    entryFee: "",
    prizePool: "",
    rules: "",
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tournaments");

      const data = await response.json();
      setTournaments(data.data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          numberOfTeams: parseInt(formData.numberOfTeams),
          maxPlayersPerTeam: formData.maxPlayersPerTeam ? parseInt(formData.maxPlayersPerTeam) : undefined,
          minPlayersPerTeam: formData.minPlayersPerTeam ? parseInt(formData.minPlayersPerTeam) : undefined,
          entryFee: formData.entryFee ? parseFloat(formData.entryFee) : undefined,
          prizePool: formData.prizePool ? parseFloat(formData.prizePool) : undefined,
          rules: formData.rules ? JSON.parse(formData.rules) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create tournament");
      }

      toast.success("Tournament created successfully");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "LEAGUE",
        format: "T20",
        startDate: "",
        endDate: "",
        numberOfTeams: "",
        maxPlayersPerTeam: "11",
        minPlayersPerTeam: "8",
        entryFee: "",
        prizePool: "",
        rules: "",
      });
      fetchTournaments();
    } catch (error: any) {
      console.error("Error creating tournament:", error);
      toast.error(error.message || "Failed to create tournament");
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tournaments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete tournament");

      toast.success("Tournament deleted successfully");
      fetchTournaments();
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast.error("Failed to delete tournament");
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

  const getTournamentTypeLabel = (type: string) => {
    switch (type) {
      case "LEAGUE":
        return "League";
      case "KNOCKOUT":
        return "Knockout";
      case "ROUND_ROBIN":
        return "Round Robin";
      case "MIXED":
        return "Mixed";
      case "FRIENDLY":
        return "Friendly";
      case "EXHIBITION":
        return "Exhibition";
      default:
        return type;
    }
  };

  return (
    <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
      <div className="container mx-auto px-3 py-4 space-y-4 sm:px-4 sm:py-6 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Tournament Management</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Create and manage cricket tournaments and leagues
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new cricket tournament
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Tournament Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Cricket Fiesta 2026"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Tournament description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tournament Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAGUE">League</SelectItem>
                        <SelectItem value="KNOCKOUT">Knockout</SelectItem>
                        <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                        <SelectItem value="MIXED">Mixed</SelectItem>
                        <SelectItem value="FRIENDLY">Friendly</SelectItem>
                        <SelectItem value="EXHIBITION">Exhibition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Match Format *</Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) =>
                        setFormData({ ...formData, format: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T10">T10</SelectItem>
                        <SelectItem value="T15">T15</SelectItem>
                        <SelectItem value="T20">T20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfTeams">Number of Teams *</Label>
                    <Input
                      id="numberOfTeams"
                      type="number"
                      required
                      min="2"
                      value={formData.numberOfTeams}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfTeams: e.target.value })
                      }
                      placeholder="e.g., 8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPlayersPerTeam">Max Players Per Team</Label>
                    <Input
                      id="maxPlayersPerTeam"
                      type="number"
                      min="8"
                      max="15"
                      value={formData.maxPlayersPerTeam}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPlayersPerTeam: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPlayersPerTeam">Min Players Per Team</Label>
                    <Input
                      id="minPlayersPerTeam"
                      type="number"
                      min="8"
                      max="11"
                      value={formData.minPlayersPerTeam}
                      onChange={(e) =>
                        setFormData({ ...formData, minPlayersPerTeam: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee (LKR)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.entryFee}
                      onChange={(e) =>
                        setFormData({ ...formData, entryFee: e.target.value })
                      }
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prizePool">Prize Pool (LKR)</Label>
                    <Input
                      id="prizePool"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prizePool}
                      onChange={(e) =>
                        setFormData({ ...formData, prizePool: e.target.value })
                      }
                      placeholder="e.g., 50000"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="rules">Rules (JSON format)</Label>
                    <Textarea
                      id="rules"
                      value={formData.rules}
                      onChange={(e) =>
                        setFormData({ ...formData, rules: e.target.value })
                      }
                      placeholder='{"powerplay": "6 overs", "drs": false}'
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Tournament</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No tournaments yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first tournament to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">{tournament.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2">
                        {tournament.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(tournament.status)} text-xs flex-shrink-0`}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-3 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {getTournamentTypeLabel(tournament.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{tournament.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {tournament.standings?.length || 0}/{tournament.numberOfTeams} Teams
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {tournament.matches?.length || 0} Matches
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm">
                    <p className="text-muted-foreground">
                      {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  {tournament.prizePool && (
                    <div className="text-xs sm:text-sm font-medium">
                      Prize Pool: LKR {tournament.prizePool.toLocaleString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => router.push(`/admin/tournaments/${tournament.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTournament(tournament.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
