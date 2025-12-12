"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trophy, TrendingUp, Loader2, Shuffle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UserData {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

interface Team {
  id: string
  name: string
  shortName: string
  color: string
  playerCount?: number
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  captain?: string
  _count?: {
    players: number
  }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [totalRegisteredPlayers, setTotalRegisteredPlayers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchTeams()
    fetchPlayerCount()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setTeams(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayerCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/players`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setTotalRegisteredPlayers(data.data?.length || 0)
      }
    } catch (error) {
      console.error("Failed to fetch players:", error)
    }
  }

  const handleAutoAssign = async () => {
    if (teams.length === 0) {
      toast.error("Please create teams first before auto-assigning players")
      return
    }
    
    setAutoAssigning(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teams/auto-assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || "Players assigned successfully!")
        // Refresh teams data
        fetchTeams()
        fetchPlayerCount()
      } else {
        throw new Error(data.message || "Failed to auto-assign players")
      }
    } catch (error: any) {
      console.error("Auto-assign error:", error)
      toast.error(error.message || "Failed to auto-assign players")
    } finally {
      setAutoAssigning(false)
    }
  }

  const totalTeams = teams.length
  const assignedPlayers = teams.reduce((sum, team) => sum + (team._count?.players || team.playerCount || 0), 0)
  const totalMatches = teams.reduce((sum, team) => sum + team.matchesPlayed, 0)

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
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">
              {user?.role === 'USER' ? 'Teams' : 'Team Management'}
            </h1>
            <p className="text-xs text-muted-foreground lg:text-base">
              {user?.role === 'USER' ? 'View all cricket teams' : 'Manage cricket teams and player assignments'}
            </p>
          </div>
          {/* Only show admin buttons for non-USER roles */}
          {user?.role !== 'USER' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent text-xs lg:text-sm"
                size="sm"
                onClick={handleAutoAssign}
                disabled={autoAssigning || teams.length === 0}
              >
                {autoAssigning ? (
                  <Loader2 className="h-3 w-3 animate-spin lg:h-4 lg:w-4" />
                ) : (
                  <Shuffle className="h-3 w-3 lg:h-4 lg:w-4" />
                )}
                <span className="hidden sm:inline">{autoAssigning ? "Assigning..." : "Auto-Assign Players"}</span>
                <span className="sm:hidden">{autoAssigning ? "..." : "Auto"}</span>
              </Button>
              <Link href="/teams/new">
                <Button className="gap-2 text-xs lg:text-sm" size="sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Create Team</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Total Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{totalTeams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Registered</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{totalRegisteredPlayers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Assigned</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{assignedPlayers}</div>
              <p className="text-[10px] text-muted-foreground lg:text-xs">
                {totalRegisteredPlayers > 0 ? `${Math.round((assignedPlayers / totalRegisteredPlayers) * 100)}%` : '0%'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Matches</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{totalMatches}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:gap-6">
          {teams.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8 lg:py-12">
                <Trophy className="mb-4 h-8 w-8 text-muted-foreground lg:h-12 lg:w-12" />
                <p className="text-center text-sm text-muted-foreground lg:text-base">No teams found. Create your first team.</p>
              </CardContent>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="group transition-all hover:border-primary">
                <CardHeader className="p-3 lg:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white lg:h-12 lg:w-12"
                        style={{ backgroundColor: team.color }}
                      >
                        <Trophy className="h-4 w-4 lg:h-6 lg:w-6" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm lg:text-xl">{team.name}</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">{team.captain ? `Captain: ${team.captain}` : team.shortName}</CardDescription>
                      </div>
                    </div>
                    <Link href={`/teams/${team.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs lg:h-9 lg:px-3 lg:text-sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-3 pt-0 lg:space-y-4 lg:p-6 lg:pt-0">
                  {/* Team Stats */}
                  <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center">
                        <Users className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
                      </div>
                      <div className="text-lg font-bold lg:text-2xl">{team._count?.players || team.playerCount || 0}</div>
                      <div className="text-[10px] text-muted-foreground lg:text-xs">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
                      </div>
                      <div className="text-lg font-bold text-green-500 lg:text-2xl">{team.matchesWon}</div>
                      <div className="text-[10px] text-muted-foreground lg:text-xs">Won</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
                      </div>
                      <div className="text-lg font-bold text-destructive lg:text-2xl">{team.matchesLost}</div>
                      <div className="text-[10px] text-muted-foreground lg:text-xs">Lost</div>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs lg:mb-2 lg:text-sm">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-medium">
                        {team.matchesPlayed > 0 ? Math.round((team.matchesWon / team.matchesPlayed) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted lg:h-2">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${team.matchesPlayed > 0 ? (team.matchesWon / team.matchesPlayed) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <Badge variant={team.matchesWon > team.matchesLost ? "default" : "secondary"} className="text-[10px] lg:text-xs">
                      {team.matchesPlayed} Matches
                    </Badge>
                    {team.matchesWon === team.matchesPlayed && team.matchesPlayed > 0 && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[10px] lg:text-xs">Undefeated</Badge>
                    )}
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
