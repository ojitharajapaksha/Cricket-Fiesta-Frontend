"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Player Management</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Manage player registrations, teams, and attendance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/players/bulk-import">
              <Button variant="outline" className="gap-2 bg-transparent text-xs lg:text-sm" size="sm">
                <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Import</span>
              </Button>
            </Link>
            <Button variant="outline" className="gap-2 bg-transparent text-xs lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              Export
            </Button>
            <Link href="/players/new">
              <Button className="gap-2 text-xs lg:text-sm" size="sm">
                <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Add Player</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Total Players</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{players.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Attended</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{attendedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{teamCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Unassigned</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{unassignedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 lg:mb-6">
          <CardContent className="p-3 lg:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground lg:h-4 lg:w-4" />
                <Input
                  placeholder="Search by name, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs lg:pl-9 lg:text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="text-xs lg:text-sm">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Players Table - Desktop */}
        <Card className="hidden lg:block">
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

        {/* Players Cards - Mobile */}
        <div className="space-y-3 lg:hidden">
          {filteredPlayers.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No players found
              </CardContent>
            </Card>
          ) : (
            filteredPlayers.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold">{player.fullName}</h3>
                      <p className="text-xs text-muted-foreground">{player.department}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px]">{player.position}</Badge>
                        {player.team ? (
                          <Badge className="text-[10px]">{player.team.shortName}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Unassigned</Badge>
                        )}
                        {player.attended ? (
                          <Badge className="bg-green-500/10 text-green-500 text-[10px]">
                            <UserCheck className="mr-1 h-2 w-2" />
                            Attended
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                          View QR
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
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}
