"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Play, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Match {
  id: string
  matchNumber: number
  homeTeam: { id: string; name: string; shortName: string }
  awayTeam: { id: string; name: string; shortName: string }
  status: string
  scheduledTime: string
  homeScore?: string
  awayScore?: string
  winnerId?: string
}

export default function MatchesPage() {
  // Auth check - allow all authenticated users to view
  const { loading: authLoading, isAuthenticated, isSuperAdmin, isOC, token } = useAuth()
  
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMatches()
    }
  }, [isAuthenticated, token])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setMatches(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
      toast.error("Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = filter === "All" ? matches : matches.filter((match) => match.status === filter)

  const statusCounts = {
    total: matches.length,
    completed: matches.filter((m) => m.status === "COMPLETED").length,
    live: matches.filter((m) => m.status === "LIVE").length,
    scheduled: matches.filter((m) => m.status === "SCHEDULED").length,
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
              {(isSuperAdmin || isOC) ? 'Match Management' : 'Matches'}
            </h1>
            <p className="text-xs text-muted-foreground lg:text-base">
              {(isSuperAdmin || isOC) ? 'Schedule matches and manage live scoring' : 'View all matches and scores'}
            </p>
          </div>
          {(isSuperAdmin || isOC) && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 bg-transparent text-xs lg:text-sm" size="sm">
                <span className="hidden sm:inline">Generate Fixtures</span>
                <span className="sm:hidden">Fixtures</span>
              </Button>
              <Link href="/matches/new">
                <Button className="gap-2 text-xs lg:text-sm" size="sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Create Match</span>
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
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{statusCounts.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-500 lg:text-2xl">{statusCounts.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Live</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-orange-500 lg:text-2xl">{statusCounts.live}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Scheduled</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{statusCounts.scheduled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 lg:mb-6">
          <CardContent className="p-3 lg:pt-6">
            <div className="flex flex-wrap gap-1.5 lg:gap-2">
              {["All", "SCHEDULED", "LIVE", "COMPLETED"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status)}
                  size="sm"
                  className="h-7 px-2 text-xs lg:h-9 lg:px-4 lg:text-sm"
                >
                  {status === "All" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        <div className="space-y-3 lg:space-y-4">
          {filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 lg:py-12">
                <Calendar className="mb-4 h-8 w-8 text-muted-foreground lg:h-12 lg:w-12" />
                <p className="text-center text-sm text-muted-foreground lg:text-base">No matches found. Create your first match.</p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match) => (
              <Card key={match.id} className="group transition-all hover:border-primary">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] lg:text-xs">Match {match.matchNumber}</Badge>
                        <Badge
                          className={`text-[10px] lg:text-xs ${
                            match.status === "LIVE"
                              ? "animate-pulse bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                              : match.status === "COMPLETED"
                                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {match.status === "LIVE" && <Play className="mr-1 h-2 w-2 lg:h-3 lg:w-3" />}
                          {match.status === "COMPLETED" && <CheckCircle className="mr-1 h-2 w-2 lg:h-3 lg:w-3" />}
                          {match.status === "SCHEDULED" && <Calendar className="mr-1 h-2 w-2 lg:h-3 lg:w-3" />}
                          {match.status.charAt(0) + match.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>

                      <div className="mb-2 text-[10px] text-muted-foreground lg:text-sm">
                        {new Date(match.scheduledTime).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Teams and Scores */}
                      <div className="space-y-1.5 lg:space-y-2">
                        <div className="flex items-center justify-between gap-2 lg:gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="truncate text-xs font-semibold lg:text-base">{match.homeTeam.name}</span>
                            {match.winnerId === match.homeTeam.id && (
                              <Badge className="ml-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[8px] lg:ml-2 lg:text-xs">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-base font-bold lg:text-xl">{match.homeScore || "-"}</div>
                        </div>
                        <div className="flex items-center justify-between gap-2 lg:gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="truncate text-xs font-semibold lg:text-base">{match.awayTeam.name}</span>
                            {match.winnerId === match.awayTeam.id && (
                              <Badge className="ml-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[8px] lg:ml-2 lg:text-xs">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-base font-bold lg:text-xl">{match.awayScore || "-"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:w-40 lg:flex-col">
                      {(isSuperAdmin || isOC) && match.status === "SCHEDULED" && (
                        <Link href={`/matches/${match.id}/scoring`} className="flex-1 lg:flex-none">
                          <Button className="w-full gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                            <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                            Start
                          </Button>
                        </Link>
                      )}
                      {(isSuperAdmin || isOC) && match.status === "LIVE" && (
                        <Link href={`/matches/${match.id}/scoring`} className="flex-1 lg:flex-none">
                          <Button className="w-full gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" variant="outline" size="sm">
                            Live Scoring
                          </Button>
                        </Link>
                      )}
                      <Link href={`/matches/${match.id}`} className="flex-1 lg:flex-none">
                        <Button className="w-full bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                          {match.status === "LIVE" ? "Watch Live" : "Details"}
                        </Button>
                      </Link>
                    </div>
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
