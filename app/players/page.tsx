"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, MoreVertical, QrCode, Edit, Trash2, UserCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Player {
  id: string;
  traineeId: string;
  fullName: string;
  gender: string;
  contactNumber: string;
  department: string;
  position: string;
  experienceLevel: string;
  attended: boolean;
  attendedAt: string | null;
  team: {
    id: string;
    name: string;
    shortName: string;
  } | null;
  teamId: string | null;
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
    fetchTeamCount()
  }, [])

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch players");

      const data = await response.json();
      setPlayers(data.data);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  }

  const fetchTeamCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }

  const handleMarkAttendance = async (playerId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/${playerId}/attendance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark attendance");

      toast.success("Attendance marked successfully");
      fetchPlayers(); // Refresh data
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      toast.error(error.message || "Failed to mark attendance");
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const attendedCount = players.filter((p) => p.attended).length
  const unassignedCount = players.filter((p) => !p.teamId).length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Player Management</h1>
              <p className="text-muted-foreground">Manage player registrations, teams, and attendance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/players/bulk-import">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/players/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Player
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{players.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Attended</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unassignedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, department, or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Players Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No players found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlayers.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.fullName}</TableCell>
                        <TableCell>{player.gender}</TableCell>
                        <TableCell>{player.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>{player.experienceLevel}</TableCell>
                        <TableCell>
                          {player.team ? (
                            <Badge>{player.team.shortName}</Badge>
                          ) : (
                            <Badge variant="secondary">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {player.attended ? (
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Attended
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR Code
                              </DropdownMenuItem>
                              {!player.attended && (
                                <DropdownMenuItem onClick={() => handleMarkAttendance(player.id)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Mark Attendance
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
