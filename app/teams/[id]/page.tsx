"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, UserPlus, Trophy, Users, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Player {
  id: string
  traineeId: string
  fullName: string
  position: string
  experienceLevel: string
  department: string
}

interface Match {
  id: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
  homeScore: number | null
  awayScore: number | null
  homeWickets: number | null
  awayWickets: number | null
  status: string
  scheduledAt: string
  result: string | null
}

interface Team {
  id: string
  name: string
  color: string
  captainId: string | null
  viceCaptainId: string | null
  players: Player[]
}

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string
  // Auth check - redirects to login if not authenticated
  const { loading: authLoading, isAuthenticated, token, isSuperAdmin, isOC } = useAuth('ADMIN_OR_SUPER')

  const [team, setTeam] = useState<Team | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teamId && isAuthenticated && token) {
      fetchTeamData()
    }
  }, [teamId, isAuthenticated, token])

  const fetchTeamData = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch team with players
      const teamRes = await fetch(`${API_URL}/api/teams/${teamId}`, { headers })
      if (!teamRes.ok) {
        throw new Error("Team not found")
      }
      const teamData = await teamRes.json()
      setTeam(teamData.data)

      // Fetch matches for this team
      const matchesRes = await fetch(`${API_URL}/api/matches?teamId=${teamId}`, { headers })
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.data || [])
      }
    } catch (err: any) {
      console.error("Error fetching team:", err)
      setError(err.message || "Failed to load team data")
      toast.error("Failed to load team data")
    } finally {
      setLoading(false)
    }
  }

  // Calculate match stats
  const getMatchStats = () => {
    let won = 0
    let lost = 0
    let drawn = 0

    matches.forEach(match => {
      if (match.status !== 'COMPLETED') return

      const isHome = match.homeTeam.id === teamId
      const homeScore = match.homeScore || 0
      const awayScore = match.awayScore || 0

      if (isHome) {
        if (homeScore > awayScore) won++
        else if (homeScore < awayScore) lost++
        else drawn++
      } else {
        if (awayScore > homeScore) won++
        else if (awayScore < homeScore) lost++
        else drawn++
      }
    })

    const total = won + lost + drawn
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0

    return { won, lost, drawn, total, winRate }
  }

  const stats = getMatchStats()

  // Get captain name
  const getCaptainName = () => {
    if (!team?.captainId || !team?.players) return "Not assigned"
    const captain = team.players.find(p => p.id === team.captainId)
    return captain?.fullName || "Not assigned"
  }

  // Format position
  const formatPosition = (position: string) => {
    return position.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  // Format experience level
  const formatExperience = (level: string) => {
    return level.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    )
  }

  if (error || !team) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto p-4 lg:p-6">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{error || "Team not found"}</p>
              <Link href="/teams">
                <Button variant="outline" className="mt-4">Go to Teams</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Teams
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 lg:gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div
                className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-xl text-lg lg:text-2xl font-bold text-white"
                style={{ backgroundColor: team.color }}
              >
                {team.name[0]}
              </div>
              <div>
                <h1 className="mb-1 text-xl lg:text-3xl font-bold text-foreground">{team.name}</h1>
                <p className="text-xs lg:text-base text-muted-foreground">Captain: {getCaptainName()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/teams/${teamId}/edit`}>
                <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                  <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                  Edit Team
                </Button>
              </Link>
              <Link href={`/teams/${teamId}/add-player`}>
                <Button size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <UserPlus className="h-3 w-3 lg:h-4 lg:w-4" />
                  Add Player
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 lg:mb-6 grid grid-cols-2 gap-2 lg:gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Total Players</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold">{team.players?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Matches Won</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-green-500">{stats.won}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Matches Lost</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-destructive">{stats.lost}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold">{stats.winRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Players List */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                Team Players
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {team.players?.length || 0} players in this team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {team.players && team.players.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs lg:text-sm">Name</TableHead>
                      <TableHead className="text-xs lg:text-sm">Position</TableHead>
                      <TableHead className="text-xs lg:text-sm">Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium text-xs lg:text-sm">
                          {player.fullName}
                          {player.id === team.captainId && (
                            <Badge className="ml-1 lg:ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs">C</Badge>
                          )}
                          {player.id === team.viceCaptainId && (
                            <Badge className="ml-1 lg:ml-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs">VC</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{formatPosition(player.position)}</Badge>
                        </TableCell>
                        <TableCell className="text-xs lg:text-sm">{formatExperience(player.experienceLevel)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No players assigned to this team yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match History */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
                Match History
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {matches.length > 0 ? `${stats.total} completed matches` : "No matches yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-2 lg:space-y-3">
              {matches.length > 0 ? (
                matches.slice(0, 5).map((match) => {
                  const isHome = match.homeTeam.id === teamId
                  const opponent = isHome ? match.awayTeam.name : match.homeTeam.name
                  const teamScore = isHome 
                    ? `${match.homeScore || 0}/${match.homeWickets || 0}` 
                    : `${match.awayScore || 0}/${match.awayWickets || 0}`
                  const opponentScore = isHome 
                    ? `${match.awayScore || 0}/${match.awayWickets || 0}` 
                    : `${match.homeScore || 0}/${match.homeWickets || 0}`
                  
                  let result = "Upcoming"
                  let resultColor = "bg-gray-500/10 text-gray-500"
                  
                  if (match.status === 'COMPLETED') {
                    const homeScore = match.homeScore || 0
                    const awayScore = match.awayScore || 0
                    const won = isHome ? homeScore > awayScore : awayScore > homeScore
                    const lost = isHome ? homeScore < awayScore : awayScore < homeScore
                    
                    if (won) {
                      result = "Won"
                      resultColor = "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    } else if (lost) {
                      result = "Lost"
                      resultColor = "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    } else {
                      result = "Draw"
                      resultColor = "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    }
                  } else if (match.status === 'LIVE') {
                    result = "Live"
                    resultColor = "bg-red-500/10 text-red-500 animate-pulse"
                  }

                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-border p-3 lg:p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div>
                          <div className="mb-1 font-medium text-sm lg:text-base">vs {opponent}</div>
                          {match.status === 'COMPLETED' && (
                            <div className="text-xs text-muted-foreground">{teamScore} vs {opponentScore}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.scheduledAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={`${resultColor} text-xs`}>
                          {result}
                        </Badge>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center text-muted-foreground text-sm py-6">
                  No matches scheduled for this team yet
                </div>
              )}
              {matches.length > 5 && (
                <Link href={`/matches?teamId=${teamId}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                    View All Matches
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
