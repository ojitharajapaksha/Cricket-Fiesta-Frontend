"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trophy, TrendingUp, Loader2, Shuffle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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

  useEffect(() => {
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
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Team Management</h1>
              <p className="text-muted-foreground">Manage cricket teams and player assignments</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent"
                onClick={handleAutoAssign}
                disabled={autoAssigning || teams.length === 0}
              >
                {autoAssigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shuffle className="h-4 w-4" />
                )}
                {autoAssigning ? "Assigning..." : "Auto-Assign Players"}
              </Button>
              <Link href="/teams/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Registered Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegisteredPlayers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedPlayers}</div>
                <p className="text-xs text-muted-foreground">
                  {totalRegisteredPlayers > 0 ? `${Math.round((assignedPlayers / totalRegisteredPlayers) * 100)}%` : '0%'} assigned
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMatches}</div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {teams.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">No teams found. Create your first team to get started.</p>
                </CardContent>
              </Card>
            ) : (
              teams.map((team) => (
                <Card key={team.id} className="group transition-all hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: team.color }}
                        >
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{team.name}</CardTitle>
                          <CardDescription>{team.captain ? `Captain: ${team.captain}` : `${team.shortName}`}</CardDescription>
                        </div>
                      </div>
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Team Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="mb-1 flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{team._count?.players || team.playerCount || 0}</div>
                        <div className="text-xs text-muted-foreground">Players</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 flex items-center justify-center gap-1">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-green-500">{team.matchesWon}</div>
                        <div className="text-xs text-muted-foreground">Won</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-destructive">{team.matchesLost}</div>
                        <div className="text-xs text-muted-foreground">Lost</div>
                      </div>
                    </div>

                  {/* Win Rate */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-medium">
                        {team.matchesPlayed > 0 ? Math.round((team.matchesWon / team.matchesPlayed) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${team.matchesPlayed > 0 ? (team.matchesWon / team.matchesPlayed) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant={team.matchesWon > team.matchesLost ? "default" : "secondary"}>
                      {team.matchesPlayed} Matches Played
                    </Badge>
                    {team.matchesWon === team.matchesPlayed && team.matchesPlayed > 0 && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Undefeated</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
