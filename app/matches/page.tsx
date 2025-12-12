"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Play, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
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
              <h1 className="mb-2 text-3xl font-bold text-foreground">Match Management</h1>
              <p className="text-muted-foreground">Schedule matches and manage live scoring</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                Generate Fixtures
              </Button>
              <Link href="/matches/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Match
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{statusCounts.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Live</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{statusCounts.live}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.scheduled}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {["All", "SCHEDULED", "LIVE", "COMPLETED"].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    onClick={() => setFilter(status)}
                    size="sm"
                  >
                    {status === "All" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          <div className="space-y-4">
            {filteredMatches.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">No matches found. Create your first match to get started.</p>
                </CardContent>
              </Card>
            ) : (
              filteredMatches.map((match) => (
                <Card key={match.id} className="group transition-all hover:border-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <Badge variant="outline">Match {match.matchNumber}</Badge>
                          <Badge
                            className={
                              match.status === "LIVE"
                                ? "animate-pulse bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                                : match.status === "COMPLETED"
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : "bg-muted text-muted-foreground"
                            }
                          >
                            {match.status === "LIVE" && <Play className="mr-1 h-3 w-3" />}
                            {match.status === "COMPLETED" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {match.status === "SCHEDULED" && <Calendar className="mr-1 h-3 w-3" />}
                            {match.status.charAt(0) + match.status.slice(1).toLowerCase()}
                          </Badge>
                        </div>

                        <div className="mb-2 text-sm text-muted-foreground">
                          {new Date(match.scheduledTime).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        {/* Teams and Scores */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <span className="font-semibold">{match.homeTeam.name}</span>
                              {match.winnerId === match.homeTeam.id && (
                                <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="text-xl font-bold">{match.homeScore || "-"}</div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <span className="font-semibold">{match.awayTeam.name}</span>
                              {match.winnerId === match.awayTeam.id && (
                                <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="text-xl font-bold">{match.awayScore || "-"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 sm:w-40">
                        {match.status === "SCHEDULED" && (
                          <Link href={`/matches/${match.id}/scoring`}>
                            <Button className="w-full gap-2" size="sm">
                              <Play className="h-4 w-4" />
                              Start Match
                            </Button>
                          </Link>
                        )}
                        {match.status === "LIVE" && (
                          <Link href={`/matches/${match.id}/scoring`}>
                            <Button className="w-full gap-2 bg-transparent" variant="outline" size="sm">
                              Live Scoring
                            </Button>
                          </Link>
                        )}
                        <Link href={`/matches/${match.id}`}>
                          <Button className="w-full bg-transparent" variant="outline" size="sm">
                            View Details
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
      </main>
    </div>
  )
}
