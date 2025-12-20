"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  User
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UserData {
  id: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
}

interface UserLoginInfo {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  userType: 'PLAYER' | 'TRAINEE' | 'COMMITTEE'
  traineeId: string | null
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export default function LastLoginsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [users, setUsers] = useState<UserLoginInfo[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserLoginInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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

      fetchLastLogins()
    } else {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
            u.traineeId?.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query) ||
            u.userType.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

  const fetchLastLogins = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/api/dashboard/last-logins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch last logins')
      }

      const data = await response.json()
      // Sort by lastLoginAt in descending order (most recent first)
      const sortedUsers = data.data.sort((a: UserLoginInfo, b: UserLoginInfo) => {
        // Handle null values - put them at the end
        if (!a.lastLoginAt && !b.lastLoginAt) return 0
        if (!a.lastLoginAt) return 1
        if (!b.lastLoginAt) return -1
        // Compare dates in descending order
        return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
      })
      setUsers(sortedUsers)
      setFilteredUsers(sortedUsers)
    } catch (error) {
      console.error('Error fetching last logins:', error)
      toast.error('Failed to load last login data')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-red-500 text-white">Super Admin</Badge>
      case 'ADMIN':
        return <Badge className="bg-blue-500 text-white">Admin</Badge>
      case 'USER':
        return <Badge className="bg-green-500 text-white">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'PLAYER':
        return <Badge variant="outline" className="bg-green-50">Player</Badge>
      case 'COMMITTEE':
        return <Badge variant="outline" className="bg-blue-50">Committee</Badge>
      case 'TRAINEE':
        return <Badge variant="outline" className="bg-purple-50">Trainee</Badge>
      default:
        return <Badge variant="outline">{userType}</Badge>
    }
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) {
      return <span className="text-muted-foreground italic">Never</span>
    }
    try {
      const date = new Date(dateString)
      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, 'MMM dd, yyyy')}</span>
          <span className="text-xs text-muted-foreground">{format(date, 'hh:mm a')}</span>
        </div>
      )
    } catch (error) {
      return <span className="text-muted-foreground">Invalid date</span>
    }
  }

  const getTimeSinceLastLogin = (dateString: string | null) => {
    if (!dateString) return "Never"
    
    const now = new Date()
    const lastLogin = new Date(dateString)
    const diffMs = now.getTime() - lastLogin.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">User Last Logins</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View all user login activity and timestamps
            </p>
          </div>
        </div>
        <Button
          onClick={fetchLastLogins}
          disabled={loading}
          variant="outline"
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Login Activity</CardTitle>
              <CardDescription className="mt-1">
                {filteredUsers.length} of {users.length} users shown
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, trainee ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search" : "No users have been created yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">User</TableHead>
                    <TableHead className="min-w-[120px]">Trainee ID</TableHead>
                    <TableHead className="min-w-[110px]">Role</TableHead>
                    <TableHead className="min-w-[110px]">User Type</TableHead>
                    <TableHead className="min-w-[110px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Last Login</TableHead>
                    <TableHead className="min-w-[100px]">Time Since</TableHead>
                    <TableHead className="min-w-[150px]">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userInfo) => (
                    <TableRow key={userInfo.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">
                            {userInfo.firstName && userInfo.lastName
                              ? `${userInfo.firstName} ${userInfo.lastName}`
                              : userInfo.email.split('@')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {userInfo.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {userInfo.traineeId ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">
                            {userInfo.traineeId}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(userInfo.role)}</TableCell>
                      <TableCell>{getUserTypeBadge(userInfo.userType)}</TableCell>
                      <TableCell>{getApprovalBadge(userInfo.approvalStatus)}</TableCell>
                      <TableCell>{formatDateTime(userInfo.lastLoginAt)}</TableCell>
                      <TableCell>
                        <span className={userInfo.lastLoginAt ? "text-muted-foreground text-sm" : "italic text-muted-foreground text-sm"}>
                          {getTimeSinceLastLogin(userInfo.lastLoginAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(userInfo.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
