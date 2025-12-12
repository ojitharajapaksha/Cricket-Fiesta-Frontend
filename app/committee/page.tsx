"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
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

  useEffect(() => {
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
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Committee Management</h1>
              <p className="text-muted-foreground">Manage organizing committee volunteers and roles</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/committee/bulk-import">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/committee/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{checkedInCount}</div>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Experienced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{experiencedCount}</div>
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
                    placeholder="Search by name, department, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Committee Table */}
          <Card>
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
        </div>
      </main>
    </div>
  )
}
