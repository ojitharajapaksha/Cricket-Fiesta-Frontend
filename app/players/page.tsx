"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, MoreVertical, QrCode, Edit, Trash2, UserCheck, Loader2, RefreshCw, Building2, ShieldCheck, ShieldX, FileSpreadsheet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import * as XLSX from "xlsx"

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
  projectName: string | null;
  isApproved: boolean;
  team: {
    id: string;
    name: string;
    shortName: string;
  } | null;
  teamId: string | null;
}

export default function PlayersPage() {
  // Auth check - redirects to login if not authenticated, requires ADMIN or SUPER_ADMIN
  const { loading: authLoading, isAuthenticated, isSuperAdmin, token } = useAuth('ADMIN_OR_SUPER')
  
  const [searchQuery, setSearchQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [players, setPlayers] = useState<Player[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPlayers()
      fetchTeamCount()
      fetchProjects()
    }
  }, [isAuthenticated, token])

  const fetchPlayers = async () => {
    try {
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

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  const fetchTeamCount = async () => {
    try {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPlayers(), fetchProjects(), fetchTeamCount()]);
    setRefreshing(false);
    toast.success("Data refreshed");
  }

  const handleMigration = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/migrate/link-users-players`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Migration failed");

      const data = await response.json();
      toast.success(data.message || "Migration completed successfully");
      
      // Refresh the players list to show updated data
      await fetchPlayers();
    } catch (error: any) {
      console.error("Error running migration:", error);
      toast.error(error.message || "Failed to run migration");
    }
  }

  const handleToggleApproval = async (playerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/${playerId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update approval status");

      toast.success(`Player ${!currentStatus ? 'approved' : 'removed from'} public page`);
      fetchPlayers();
    } catch (error: any) {
      console.error("Error updating approval:", error);
      toast.error(error.message || "Failed to update approval status");
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredPlayers = players.filter(
    (player) => {
      const matchesSearch = player.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.projectName && player.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesProject = projectFilter === "all" || 
        (projectFilter === "unassigned" ? !player.projectName : player.projectName === projectFilter);
      
      return matchesSearch && matchesProject;
    }
  )

  const attendedCount = players.filter((p) => p.attended).length
  const unassignedCount = players.filter((p) => !p.teamId && !p.team).length
  const approvedCount = players.filter((p) => p.isApproved).length

  // Export players to Excel
  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredPlayers.map((player, index) => ({
        "No.": index + 1,
        "Trainee ID": player.traineeId,
        "Full Name": player.fullName,
        "Gender": player.gender,
        "Department": player.department,
        "Project": player.projectName || "Not Entered",
        "Position": player.position.replace("_", " "),
        "Experience Level": player.experienceLevel,
        "Contact Number": player.contactNumber,
        "Team": player.team?.name || "Unassigned",
        "Attendance": player.attended ? "Yes" : "No",
        "Attended At": player.attendedAt ? new Date(player.attendedAt).toLocaleString() : "-",
        "Public Approved": player.isApproved ? "Yes" : "No",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // No.
        { wch: 15 },  // Trainee ID
        { wch: 25 },  // Full Name
        { wch: 10 },  // Gender
        { wch: 20 },  // Department
        { wch: 20 },  // Project
        { wch: 15 },  // Position
        { wch: 15 },  // Experience Level
        { wch: 15 },  // Contact Number
        { wch: 15 },  // Team
        { wch: 12 },  // Attendance
        { wch: 20 },  // Attended At
        { wch: 15 },  // Public Approved
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Players");

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      const filename = `players_export_${date}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Exported ${filteredPlayers.length} players to ${filename}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export players");
    }
  };

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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent text-xs lg:text-sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
            {isSuperAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20 text-xs lg:text-sm"
                onClick={handleMigration}
                title="Fix missing project names by linking users to players"
              >
                <Building2 className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Fix Projects</span>
              </Button>
            )}
            {isSuperAdmin && (
              <Link href="/players/bulk-import">
                <Button variant="outline" className="gap-2 bg-transparent text-xs lg:text-sm" size="sm">
                  <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Bulk Import</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </Link>
            )}
            {isSuperAdmin && (
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent text-xs lg:text-sm" 
                size="sm"
                onClick={handleExportToExcel}
              >
                <FileSpreadsheet className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
            {isSuperAdmin && (
              <Link href="/players/new">
                <Button className="gap-2 text-xs lg:text-sm" size="sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Add Player</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 lg:mb-6 lg:grid-cols-6 lg:gap-4">
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
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{projects.length}</div>
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
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-green-600 lg:text-sm">Public Page</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-600 lg:text-2xl">{approvedCount}</div>
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
                  placeholder="Search by name, department, project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs lg:pl-9 lg:text-sm"
                />
              </div>
              {projects.length > 0 && (
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] text-xs lg:text-sm">
                    <Building2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    <SelectValue placeholder="Filter by Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="unassigned">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                  <TableHead>Project</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
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
                        {player.projectName ? (
                          <span className="text-sm">{player.projectName}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell>
                        {player.team && player.team.shortName ? (
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
                      <TableCell>
                        {isSuperAdmin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={player.isApproved ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-foreground"}
                            onClick={() => handleToggleApproval(player.id, player.isApproved)}
                            title={player.isApproved ? "Click to remove from public page" : "Click to approve for public page"}
                          >
                            {player.isApproved ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : (
                              <ShieldX className="h-5 w-5" />
                            )}
                          </Button>
                        ) : (
                          player.isApproved ? (
                            <Badge className="bg-green-500/10 text-green-500">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Private</Badge>
                          )
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
                            {isSuperAdmin && (
                              <DropdownMenuItem 
                                onClick={() => handleToggleApproval(player.id, player.isApproved)}
                                className={player.isApproved ? "text-orange-600" : "text-green-600"}
                              >
                                {player.isApproved ? (
                                  <>
                                    <ShieldX className="mr-2 h-4 w-4" />
                                    Remove from Public
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Approve for Public
                                  </>
                                )}
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
              <Card key={player.id} className={player.isApproved ? "border-green-500/30" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{player.fullName}</h3>
                        {player.isApproved && (
                          <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{player.department}</p>
                      {player.projectName && (
                        <p className="text-xs text-primary mt-0.5">📁 {player.projectName}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px]">{player.position}</Badge>
                        {player.team && player.team.shortName ? (
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
                        {player.isApproved && (
                          <Badge className="bg-green-500/10 text-green-600 text-[10px]">
                            Public
                          </Badge>
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
                        {isSuperAdmin && (
                          <DropdownMenuItem 
                            onClick={() => handleToggleApproval(player.id, player.isApproved)}
                            className={player.isApproved ? "text-orange-600" : "text-green-600"}
                          >
                            {player.isApproved ? (
                              <>
                                <ShieldX className="mr-2 h-4 w-4" />
                                Remove from Public
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Approve for Public
                              </>
                            )}
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
