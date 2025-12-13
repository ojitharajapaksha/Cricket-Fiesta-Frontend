"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, MoreVertical, Edit, Trash2, LogIn, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface CommitteeMember {
  id: string
  fullName: string
  department: string
  whatsappNumber: string
  email?: string
  assignedTeam?: string
  experienceLevel: string
  checkedIn: boolean
  checkInTime?: string
  checkOutTime?: string
}

export default function CommitteePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check if user is Super Admin
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setIsSuperAdmin(userData.role === 'SUPER_ADMIN')
    }
    fetchMembers()
    fetchTeamCount()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/committee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setMembers(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch committee members:", error)
      toast.error("Failed to load committee members")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setTeamCount(data.data.length)
      }
    } catch (error) {
      console.error("Failed to fetch team count:", error)
    }
  }

  const handleCheckIn = async (memberId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/committee/${memberId}/check-in`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        toast.success("Member checked in successfully")
        fetchMembers()
      }
    } catch (error) {
      console.error("Failed to check in member:", error)
      toast.error("Failed to check in member")
    }
  }

  const handleCheckOut = async (memberId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/committee/${memberId}/check-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        toast.success("Member checked out successfully")
        fetchMembers()
      }
    } catch (error) {
      console.error("Failed to check out member:", error)
      toast.error("Failed to check out member")
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/committee/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        toast.success("Member deleted successfully")
        fetchMembers()
      }
    } catch (error) {
      console.error("Failed to delete member:", error)
      toast.error("Failed to delete member")
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.assignedTeam && member.assignedTeam.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const checkedInCount = members.filter((m) => m.checkedIn).length
  const experiencedCount = members.filter((m) => m.experienceLevel === "EXTENSIVE").length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Committee Management</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Manage organizing committee volunteers</p>
          </div>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {isSuperAdmin && (
              <Link href="/committee/bulk-import">
                <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
                  <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
              </Link>
            )}
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {isSuperAdmin && (
              <Link href="/committee/new">
                <Button className="gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Checked In</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-500 lg:text-2xl">{checkedInCount}</div>
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
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Experienced</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{experiencedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 lg:mb-6">
          <CardContent className="p-3 lg:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground lg:h-4 lg:w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs lg:h-10 lg:pl-9 lg:text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs lg:h-10 lg:text-sm">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Assigned Team</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No committee members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <code className="text-xs">{member.whatsappNumber}</code>
                      </TableCell>
                      <TableCell>
                        {member.assignedTeam ? (
                          <Badge variant="outline">{member.assignedTeam}</Badge>
                        ) : (
                          <Badge variant="secondary">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.experienceLevel === "EXTENSIVE" ? "default" : "secondary"}>
                          {member.experienceLevel === "EXTENSIVE" ? "Extensive" : member.experienceLevel === "SOME" ? "Some" : "None"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.checkedIn ? (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Checked In</Badge>
                        ) : (
                          <Badge variant="secondary">Not Checked In</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.checkInTime ? (
                          <span className="text-xs text-muted-foreground">
                            {new Date(member.checkInTime).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
                            {!member.checkedIn ? (
                              <DropdownMenuItem onClick={() => handleCheckIn(member.id)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Check In
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleCheckOut(member.id)}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Check Out
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
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

        {/* Mobile Card View */}
        <div className="space-y-3 lg:hidden">
          {filteredMembers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No committee members found
              </CardContent>
            </Card>
          ) : (
            filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">{member.fullName}</span>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {member.department}
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        <code>{member.whatsappNumber}</code>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        {!member.checkedIn ? (
                          <DropdownMenuItem onClick={() => handleCheckIn(member.id)}>
                            <LogIn className="mr-2 h-3.5 w-3.5" />
                            Check In
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleCheckOut(member.id)}>
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                            Check Out
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {member.assignedTeam ? (
                      <Badge variant="outline" className="text-[10px]">{member.assignedTeam}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Unassigned</Badge>
                    )}
                    <Badge variant={member.experienceLevel === "EXTENSIVE" ? "default" : "secondary"} className="text-[10px]">
                      {member.experienceLevel === "EXTENSIVE" ? "Exp" : member.experienceLevel === "SOME" ? "Some" : "None"}
                    </Badge>
                    {member.checkedIn ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[10px]">In</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Not In</Badge>
                    )}
                  </div>
                  {member.checkInTime && (
                    <div className="mt-1.5 text-[10px] text-muted-foreground">
                      Check-in: {new Date(member.checkInTime).toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}
