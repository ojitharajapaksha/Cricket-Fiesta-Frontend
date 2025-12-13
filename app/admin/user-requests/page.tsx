"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  User, 
  Mail, 
  Building, 
  BadgeCheck,
  RefreshCw,
  Users,
  Shield
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface LoginRequest {
  id: string
  email: string
  fullName: string
  userType: string
  traineeId: string | null
  department: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}

interface Team {
  id: string
  name: string
  color: string
}

interface UserData {
  id: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
}

export default function UserRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [requests, setRequests] = useState<LoginRequest[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  
  // Rejection dialog
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<LoginRequest | null>(null)

  // Approve dialog (for team selection)
  const [approveDialog, setApproveDialog] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      if (userData.role !== 'SUPER_ADMIN') {
        toast.error('Access denied. Super Admin only.')
        router.push('/dashboard')
        return
      }
      
      fetchRequests()
      fetchTeams()
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/auth/login-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to fetch requests")

      const data = await response.json()
      setRequests(data.data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load login requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: LoginRequest) => {
    // For players, show dialog to select team
    if (request.userType === 'player') {
      setSelectedRequest(request)
      setSelectedTeamId("")
      setApproveDialog(true)
      return
    }

    // For non-players, approve directly
    await approveRequest(request.id)
  }

  const approveRequest = async (requestId: string, teamId?: string) => {
    setProcessing(requestId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/auth/login-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ teamId: teamId || undefined })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to approve")
      }

      const data = await response.json()
      const teamName = data.data?.team?.name
      toast.success(`Approved login request${teamName ? ` (Team: ${teamName})` : ''}`)
      setApproveDialog(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request")
    } finally {
      setProcessing(null)
    }
  }

  const handleApproveWithTeam = () => {
    if (!selectedRequest) return
    approveRequest(selectedRequest.id, selectedTeamId || undefined)
  }

  const openRejectDialog = (request: LoginRequest) => {
    setSelectedRequest(request)
    setRejectReason("")
    setRejectDialog(true)
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    setProcessing(selectedRequest.id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/auth/login-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to reject")
      }

      toast.success(`Rejected login request for ${selectedRequest.fullName}`)
      setRejectDialog(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request")
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (request: LoginRequest) => {
    if (!confirm(`Delete login request for ${request.fullName}? This will allow them to submit a new request.`)) return
    
    setProcessing(request.id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/auth/login-requests/${request.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Login request deleted")
      fetchRequests()
    } catch (error) {
      toast.error("Failed to delete request")
    } finally {
      setProcessing(null)
    }
  }

  const getUserTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      player: { label: "Player", variant: "default" },
      committee: { label: "OC Member", variant: "secondary" },
      food: { label: "Food Registrant", variant: "outline" }
    }
    const config = types[type] || { label: type, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-orange-500 text-orange-500"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case "APPROVED":
        return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredRequests = requests.filter(r => {
    if (activeTab === "pending") return r.status === "PENDING"
    if (activeTab === "approved") return r.status === "APPROVED"
    if (activeTab === "rejected") return r.status === "REJECTED"
    return true
  })

  const pendingCount = requests.filter(r => r.status === "PENDING").length

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-5xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3 lg:mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">User Login Requests</h1>
            <p className="text-xs text-muted-foreground lg:text-sm">Approve or reject first-time login requests from players and Organizing Committee Members</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3 mb-4 lg:mb-6">
          <Card>
            <CardContent className="p-3 lg:p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === "PENDING").length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 lg:p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === "APPROVED").length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 lg:p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === "REJECTED").length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader className="p-3 lg:p-6 pb-0 lg:pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="pending" className="text-xs lg:text-sm py-1.5 lg:py-2 relative">
                  Pending
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs lg:text-sm py-1.5 lg:py-2">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs lg:text-sm py-1.5 lg:py-2">Rejected</TabsTrigger>
                <TabsTrigger value="all" className="text-xs lg:text-sm py-1.5 lg:py-2">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-3 lg:p-6 pt-4 lg:pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No {activeTab === "all" ? "" : activeTab} requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-sm lg:text-base">{request.fullName}</h3>
                            {getUserTypeBadge(request.userType)}
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {request.email}
                            </span>
                            {request.traineeId && (
                              <span className="flex items-center gap-1">
                                <BadgeCheck className="h-3 w-3" />
                                {request.traineeId}
                              </span>
                            )}
                            {request.department && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {request.department}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground lg:text-xs">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                            {request.reviewedAt && (
                              <> • Reviewed: {new Date(request.reviewedAt).toLocaleString()}</>
                            )}
                          </p>
                          {request.reviewNote && (
                            <p className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">
                              Reason: {request.reviewNote}
                            </p>
                          )}
                        </div>
                        
                        {request.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request)}
                              disabled={processing === request.id}
                              className="flex-1 lg:flex-none"
                            >
                              {processing === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(request)}
                              disabled={processing === request.id}
                              className="flex-1 lg:flex-none"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {request.status === "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(request)}
                            disabled={processing === request.id}
                          >
                            Delete (Allow Retry)
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Login Request</DialogTitle>
              <DialogDescription>
                Reject the login request for {selectedRequest?.fullName}. You can optionally provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={processing !== null}>
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Dialog (with team selection for players) */}
        <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Player Login</DialogTitle>
              <DialogDescription>
                Approve login for {selectedRequest?.fullName}. You can assign them to a team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedRequest?.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  {selectedRequest?.email}
                </div>
                {selectedRequest?.department && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    {selectedRequest?.department}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Assign to Team (Optional)</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team assignment</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You can assign the player to a team now or do it later from the teams page.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveWithTeam} disabled={processing !== null}>
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  )
}
